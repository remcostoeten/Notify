/**
 * Standalone changelog generation command
 */

import chalk from "chalk"
import ora from "ora"
import { prompt } from "enquirer"
import type { ReleaseConfig } from "../types.js"
import { createGit, getCommitsSinceTag, getLatestTag } from "../utils/git.js"
import { generateChangelog, formatChangelogEntry, prependToChangelog } from "../utils/llm.js"
import { resolve } from "path"

export interface ChangelogOptions {
  version?: string
  output?: string
  dryRun?: boolean
  print?: boolean
}

export async function runChangelog(config: ReleaseConfig, options: ChangelogOptions): Promise<void> {
  const cwd = process.cwd()
  const git = createGit(cwd)
  const spinner = ora()

  console.log("")
  console.log(chalk.bold(`  📝 Changelog Generation`))
  console.log(chalk.dim(`  ─────────────────────────`))
  console.log("")

  // Check LLM config
  if (!config.llm?.apiKey && config.llm?.provider !== "ollama") {
    console.log(chalk.red("  No LLM API key configured."))
    console.log(chalk.dim("  Set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY"))
    console.log(chalk.dim("  Or use Ollama for local generation."))
    return
  }

  // Get commits
  spinner.start("Fetching commits...")
  const latestTag = await getLatestTag(git)
  const commits = await getCommitsSinceTag(git, latestTag ?? undefined)
  spinner.succeed(`Found ${commits.length} commits since ${latestTag ?? "beginning"}`)

  if (commits.length === 0) {
    console.log(chalk.yellow("\n  No commits found to generate changelog.\n"))
    return
  }

  // Show commits
  console.log("")
  console.log(chalk.dim("  Recent commits:"))
  commits.slice(0, 10).forEach((c) => {
    const type = c.type ? chalk.cyan(`[${c.type}]`) : ""
    console.log(chalk.dim(`    ${c.shortHash} ${type} ${c.message.slice(0, 60)}`))
  })
  if (commits.length > 10) {
    console.log(chalk.dim(`    ... and ${commits.length - 10} more`))
  }
  console.log("")

  // Determine version
  const version = options.version ?? config.version

  // Generate changelog
  spinner.start(`Generating with ${config.llm.provider} (${config.llm.model})...`)

  try {
    const entry = await generateChangelog(config.llm, commits, version, config.name)
    const formatted = formatChangelogEntry(entry)
    spinner.succeed("Changelog generated")

    console.log("")
    console.log(chalk.dim("  ─────────────────────────"))
    console.log(
      formatted
        .split("\n")
        .map((l) => `  ${l}`)
        .join("\n"),
    )
    console.log(chalk.dim("  ─────────────────────────"))
    console.log("")

    if (options.print) {
      return
    }

    if (!options.dryRun) {
      const { save } = await prompt<{ save: boolean }>({
        type: "confirm",
        name: "save",
        message: "Save to CHANGELOG.md?",
        initial: true,
      })

      if (save) {
        const outputPath = options.output ?? resolve(cwd, "CHANGELOG.md")
        await prependToChangelog(outputPath, formatted)
        console.log(chalk.green(`  ✓ Saved to ${outputPath}\n`))
      }
    }
  } catch (error) {
    spinner.fail("Generation failed")
    console.log(chalk.red(`  Error: ${error}`))
  }
}
