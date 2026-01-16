/**
 * Status command - show current release status
 */

import chalk from "chalk"
import { createGit, getGitStatus, getLatestTag, getCommitsSinceTag } from "../utils/git.js"
import { getNpmWhoami } from "../utils/npm.js"
import type { ReleaseConfig } from "../types.js"

export async function runStatus(config: ReleaseConfig): Promise<void> {
  const cwd = process.cwd()
  const git = createGit(cwd)

  console.log("")
  console.log(chalk.bold(`  📊 Release Status`))
  console.log(chalk.dim(`  ─────────────────────────`))
  console.log("")

  // Package info
  console.log(chalk.bold("  Package"))
  console.log(`    Name:     ${chalk.cyan(config.name)}`)
  console.log(`    Version:  ${chalk.cyan(config.version)}`)
  console.log("")

  // Git info
  const status = await getGitStatus(git)
  const latestTag = await getLatestTag(git)
  const commits = await getCommitsSinceTag(git, latestTag ?? undefined)

  console.log(chalk.bold("  Git"))
  console.log(`    Branch:   ${chalk.cyan(status.branch)}`)
  console.log(`    Clean:    ${status.isClean ? chalk.green("Yes") : chalk.yellow("No")}`)
  if (!status.isClean) {
    console.log(`    Modified: ${chalk.yellow(status.modified.length)}`)
    console.log(`    Staged:   ${chalk.yellow(status.staged.length)}`)
  }
  console.log(`    Latest:   ${latestTag ? chalk.cyan(latestTag) : chalk.dim("No tags")}`)
  console.log(`    Commits:  ${chalk.cyan(commits.length)} since last tag`)
  console.log("")

  // NPM info
  const npmUser = await getNpmWhoami(config.registry)
  console.log(chalk.bold("  NPM"))
  console.log(`    Registry: ${chalk.dim(config.registry)}`)
  console.log(`    User:     ${npmUser ? chalk.green(npmUser.username) : chalk.red("Not logged in")}`)
  console.log("")

  // LLM info
  console.log(chalk.bold("  LLM"))
  console.log(`    Provider: ${chalk.cyan(config.llm?.provider ?? "Not configured")}`)
  console.log(`    Model:    ${chalk.dim(config.llm?.model ?? "N/A")}`)
  console.log(`    API Key:  ${config.llm?.apiKey ? chalk.green("Configured") : chalk.yellow("Not set")}`)
  console.log("")

  // Recent commits
  if (commits.length > 0) {
    console.log(chalk.bold("  Recent Commits"))
    commits.slice(0, 5).forEach((c) => {
      const type = c.type ? chalk.dim(`[${c.type}]`) : ""
      console.log(`    ${chalk.dim(c.shortHash)} ${type} ${c.message.slice(0, 50)}`)
    })
    if (commits.length > 5) {
      console.log(chalk.dim(`    ... and ${commits.length - 5} more`))
    }
    console.log("")
  }
}
