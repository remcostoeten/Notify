/**
 * Main release command implementation
 */

import chalk from "chalk"
import ora from "ora"
import * as semver from "semver"
import { prompt } from "enquirer"
import type { ReleaseConfig, ReleaseResult, VersionBump, GitCommit } from "../types.js"
import {
  createGit,
  getGitStatus,
  getCommitsSinceTag,
  getLatestTag,
  createTag,
  pushWithTags,
  commitChanges,
} from "../utils/git.js"
import { npmPublish, npmRunScript } from "../utils/npm.js"
import { generateChangelog, formatChangelogEntry, prependToChangelog } from "../utils/llm.js"
import { updatePackageVersion } from "../utils/config.js"
import { resolve } from "path"

export interface ReleaseOptions {
  bump?: VersionBump
  version?: string
  preid?: string
  dryRun?: boolean
  skipConfirm?: boolean
  skipChangelog?: boolean
  skipTag?: boolean
  skipPush?: boolean
  skipPublish?: boolean
  otp?: string
}

export async function runRelease(config: ReleaseConfig, options: ReleaseOptions): Promise<ReleaseResult> {
  const cwd = process.cwd()
  const git = createGit(cwd)
  const spinner = ora()
  const errors: string[] = []
  const dryRun = options.dryRun ?? config.dryRun

  console.log("")
  console.log(chalk.bold(`  📦 ${config.name} Release`))
  console.log(chalk.dim(`  ─────────────────────────`))
  console.log("")

  // Step 1: Check git status
  spinner.start("Checking git status...")
  const status = await getGitStatus(git)

  if (!status.isClean) {
    spinner.warn("Working directory is not clean")
    console.log(
      chalk.yellow(
        `  Modified: ${status.modified.length}, Staged: ${status.staged.length}, Untracked: ${status.untracked.length}`,
      ),
    )

    if (!options.skipConfirm) {
      const { proceed } = await prompt<{ proceed: boolean }>({
        type: "confirm",
        name: "proceed",
        message: "Continue with uncommitted changes?",
        initial: false,
      })
      if (!proceed) {
        return { success: false, version: config.version, errors: ["Aborted: uncommitted changes"] }
      }
    }
  } else {
    spinner.succeed(`Git status clean (${status.branch})`)
  }

  // Step 2: Determine version
  let newVersion: string

  if (options.version) {
    newVersion = options.version.replace(/^v/, "")
  } else if (options.bump) {
    const bumped = semver.inc(config.version, options.bump, options.preid)
    if (!bumped) {
      return { success: false, version: config.version, errors: [`Invalid version bump: ${options.bump}`] }
    }
    newVersion = bumped
  } else {
    // Interactive version selection
    const { bump } = await prompt<{ bump: VersionBump }>({
      type: "select",
      name: "bump",
      message: "Select version bump:",
      choices: [
        { name: "patch", message: `patch  ${config.version} → ${semver.inc(config.version, "patch")}` },
        { name: "minor", message: `minor  ${config.version} → ${semver.inc(config.version, "minor")}` },
        { name: "major", message: `major  ${config.version} → ${semver.inc(config.version, "major")}` },
        {
          name: "prerelease",
          message: `prerelease  ${config.version} → ${semver.inc(config.version, "prerelease", options.preid ?? "alpha")}`,
        },
      ],
    })
    newVersion = semver.inc(config.version, bump, options.preid)!
  }

  console.log("")
  console.log(chalk.cyan(`  Version: ${config.version} → ${chalk.bold(newVersion)}`))
  console.log("")

  // Step 3: Get commits for changelog
  let commits: GitCommit[] = []
  let changelogEntry = ""

  if (!options.skipChangelog && config.changelog) {
    spinner.start("Fetching commits...")
    const latestTag = await getLatestTag(git)
    commits = await getCommitsSinceTag(git, latestTag ?? undefined)
    spinner.succeed(`Found ${commits.length} commits since ${latestTag ?? "beginning"}`)

    if (commits.length > 0 && config.llm?.apiKey) {
      spinner.start(`Generating changelog with ${config.llm.provider}...`)
      try {
        const entry = await generateChangelog(config.llm, commits, newVersion, config.name)
        changelogEntry = formatChangelogEntry(entry)
        spinner.succeed("Changelog generated")

        console.log("")
        console.log(chalk.dim("  ─────────────────────────"))
        console.log(
          changelogEntry
            .split("\n")
            .map((l) => `  ${l}`)
            .join("\n"),
        )
        console.log(chalk.dim("  ─────────────────────────"))
        console.log("")
      } catch (error) {
        spinner.warn(`Changelog generation failed: ${error}`)
      }
    } else if (commits.length > 0) {
      spinner.info("No LLM configured, skipping AI changelog")
    }
  }

  // Step 4: Confirmation
  if (!options.skipConfirm && !dryRun) {
    const actions = []
    actions.push(`Bump version to ${newVersion}`)
    if (changelogEntry) actions.push("Update CHANGELOG.md")
    if (!options.skipTag && config.tag) actions.push(`Create git tag v${newVersion}`)
    if (!options.skipPush && config.push) actions.push("Push to remote")
    if (!options.skipPublish && config.publish) actions.push("Publish to npm")

    console.log(chalk.bold("  Actions to perform:"))
    actions.forEach((a) => console.log(chalk.dim(`    • ${a}`)))
    console.log("")

    const { confirm } = await prompt<{ confirm: boolean }>({
      type: "confirm",
      name: "confirm",
      message: "Proceed with release?",
      initial: true,
    })

    if (!confirm) {
      return { success: false, version: config.version, errors: ["Aborted by user"] }
    }
  }

  if (dryRun) {
    console.log(chalk.yellow("\n  🔸 DRY RUN - No changes will be made\n"))
  }

  // Step 5: Update version
  spinner.start("Updating package.json...")
  if (!dryRun) {
    await updatePackageVersion(cwd, newVersion)
  }
  spinner.succeed(`Updated version to ${newVersion}`)

  // Step 6: Update changelog
  if (changelogEntry && !dryRun) {
    spinner.start("Updating CHANGELOG.md...")
    await prependToChangelog(resolve(cwd, "CHANGELOG.md"), changelogEntry)
    spinner.succeed("Updated CHANGELOG.md")
  }

  // Step 7: Build
  spinner.start("Building...")
  if (!dryRun) {
    const buildResult = await npmRunScript(cwd, "build")
    if (!buildResult.success) {
      spinner.fail("Build failed")
      errors.push(`Build failed: ${buildResult.output}`)
      return { success: false, version: newVersion, errors }
    }
  }
  spinner.succeed("Build complete")

  // Step 8: Git commit and tag
  if (!dryRun) {
    spinner.start("Committing changes...")
    await commitChanges(git, `chore(release): v${newVersion}`, ["package.json", "CHANGELOG.md"])
    spinner.succeed("Changes committed")

    if (!options.skipTag && config.tag) {
      spinner.start(`Creating tag v${newVersion}...`)
      await createTag(git, `v${newVersion}`, `Release v${newVersion}`)
      spinner.succeed(`Tag v${newVersion} created`)
    }

    if (!options.skipPush && config.push) {
      spinner.start("Pushing to remote...")
      await pushWithTags(git, config.remote, config.branch)
      spinner.succeed("Pushed to remote")
    }
  }

  // Step 9: Publish to npm
  let npmUrl: string | undefined

  if (!options.skipPublish && config.publish) {
    spinner.start("Publishing to npm...")
    const publishResult = await npmPublish(cwd, {
      access: config.access,
      registry: config.registry,
      dryRun,
      otp: options.otp,
    })

    if (publishResult.success) {
      spinner.succeed(`Published to npm`)
      npmUrl = `https://www.npmjs.com/package/${config.name}/v/${newVersion}`
    } else {
      spinner.fail("Publish failed")
      errors.push(`Publish failed: ${publishResult.output}`)
    }
  }

  // Summary
  console.log("")
  console.log(chalk.green.bold(`  ✓ Released ${config.name}@${newVersion}`))
  if (npmUrl) {
    console.log(chalk.dim(`    ${npmUrl}`))
  }
  console.log("")

  return {
    success: errors.length === 0,
    version: newVersion,
    changelog: changelogEntry,
    gitTag: `v${newVersion}`,
    npmUrl,
    errors,
  }
}
