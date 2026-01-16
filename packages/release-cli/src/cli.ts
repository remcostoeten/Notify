#!/usr/bin/env node

/**
 * @remcostoeten/release-cli
 * AI-powered release automation CLI
 */

import { Command } from "commander"
import chalk from "chalk"
import { config as loadEnv } from "dotenv"
import { loadConfig } from "./utils/config.js"
import { runRelease } from "./commands/release.js"
import { runChangelog } from "./commands/changelog.js"
import { runStatus } from "./commands/status.js"
import type { ReleaseConfig, VersionBump } from "./types.js"

// Load environment variables
loadEnv()

const program = new Command()

program.name("release").description("AI-powered release automation CLI").version("1.0.0")

// Main release command
program
  .command("run", { isDefault: true })
  .description("Run the release process")
  .option("-b, --bump <type>", "Version bump type (major, minor, patch, prerelease)")
  .option("-v, --version <version>", "Explicit version number")
  .option("--preid <identifier>", "Pre-release identifier (alpha, beta, rc)")
  .option("--dry-run", "Preview changes without executing")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("--no-changelog", "Skip changelog generation")
  .option("--no-tag", "Skip git tag creation")
  .option("--no-push", "Skip pushing to remote")
  .option("--no-publish", "Skip npm publish")
  .option("--otp <code>", "NPM one-time password for 2FA")
  .action(async (options) => {
    try {
      const config = (await loadConfig()) as ReleaseConfig

      await runRelease(config, {
        bump: options.bump as VersionBump,
        version: options.version,
        preid: options.preid,
        dryRun: options.dryRun,
        skipConfirm: options.yes,
        skipChangelog: !options.changelog,
        skipTag: !options.tag,
        skipPush: !options.push,
        skipPublish: !options.publish,
        otp: options.otp,
      })
    } catch (error) {
      console.error(chalk.red(`\n  Error: ${error}\n`))
      process.exit(1)
    }
  })

// Changelog command
program
  .command("changelog")
  .description("Generate changelog using AI")
  .option("-v, --version <version>", "Version for changelog entry")
  .option("-o, --output <path>", "Output file path")
  .option("--dry-run", "Preview without saving")
  .option("--print", "Print to stdout only")
  .action(async (options) => {
    try {
      const config = (await loadConfig()) as ReleaseConfig

      await runChangelog(config, {
        version: options.version,
        output: options.output,
        dryRun: options.dryRun,
        print: options.print,
      })
    } catch (error) {
      console.error(chalk.red(`\n  Error: ${error}\n`))
      process.exit(1)
    }
  })

// Status command
program
  .command("status")
  .description("Show current release status")
  .action(async () => {
    try {
      const config = (await loadConfig()) as ReleaseConfig
      await runStatus(config)
    } catch (error) {
      console.error(chalk.red(`\n  Error: ${error}\n`))
      process.exit(1)
    }
  })

// Init command
program
  .command("init")
  .description("Initialize release configuration")
  .action(async () => {
    const { prompt } = await import("enquirer")

    console.log("")
    console.log(chalk.bold("  🚀 Release CLI Setup"))
    console.log(chalk.dim("  ─────────────────────────"))
    console.log("")

    const answers = await prompt<{
      provider: string
      model: string
      branch: string
      access: string
    }>([
      {
        type: "select",
        name: "provider",
        message: "LLM provider for changelog:",
        choices: [
          { name: "gemini", message: "Gemini (Free tier available)" },
          { name: "anthropic", message: "Anthropic (Claude)" },
          { name: "openai", message: "OpenAI (GPT-4)" },
          { name: "openrouter", message: "OpenRouter" },
          { name: "ollama", message: "Ollama (Local)" },
        ],
      },
      {
        type: "input",
        name: "model",
        message: "Model name:",
        initial: (prev: { provider: string }) => {
          switch (prev.provider) {
            case "gemini":
              return "gemini-2.0-flash"
            case "anthropic":
              return "claude-sonnet-4-20250514"
            case "openai":
              return "gpt-4o"
            case "openrouter":
              return "anthropic/claude-sonnet-4-20250514"
            case "ollama":
              return "llama3.2"
            default:
              return "gemini-2.0-flash"
          }
        },
      },
      {
        type: "input",
        name: "branch",
        message: "Main branch:",
        initial: "main",
      },
      {
        type: "select",
        name: "access",
        message: "NPM access:",
        choices: ["public", "restricted"],
      },
    ])

    const config = {
      branch: answers.branch,
      access: answers.access,
      llm: {
        provider: answers.provider,
        model: answers.model,
      },
    }

    const { writeFile } = await import("fs/promises")
    await writeFile(".release-cli.json", JSON.stringify(config, null, 2) + "\n")

    console.log("")
    console.log(chalk.green("  ✓ Created .release-cli.json"))
    console.log("")
    console.log(chalk.dim("  Set your API key:"))

    switch (answers.provider) {
      case "gemini":
        console.log(chalk.cyan("    export GEMINI_API_KEY=your-key"))
        console.log(chalk.dim("    Get free key: https://aistudio.google.com/apikey"))
        break
      case "anthropic":
        console.log(chalk.cyan("    export ANTHROPIC_API_KEY=your-key"))
        break
      case "openai":
        console.log(chalk.cyan("    export OPENAI_API_KEY=your-key"))
        break
      case "openrouter":
        console.log(chalk.cyan("    export OPENROUTER_API_KEY=your-key"))
        break
      case "ollama":
        console.log(chalk.dim("    No API key needed for Ollama"))
        break
    }
    console.log("")
  })

program.parse()
