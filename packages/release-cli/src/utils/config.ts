/**
 * Configuration loading and management
 */

import { readFile } from "fs/promises"
import { resolve } from "path"
import type { ReleaseConfig, LLMConfig, LLMProvider } from "../types.js"

const DEFAULT_CONFIG: Partial<ReleaseConfig> = {
  remote: "origin",
  branch: "main",
  registry: "https://registry.npmjs.org",
  dryRun: false,
  skipConfirm: false,
  changelog: true,
  tag: true,
  push: true,
  publish: true,
  access: "public",
}

const CONFIG_FILES = [".release-cli.json", ".release-cli.js", "release.config.json", "release.config.js"]

export async function loadConfig(cwd: string = process.cwd()): Promise<Partial<ReleaseConfig>> {
  // Load package.json
  const packageJsonPath = resolve(cwd, "package.json")
  let packageJson: Record<string, unknown> = {}

  try {
    const content = await readFile(packageJsonPath, "utf-8")
    packageJson = JSON.parse(content)
  } catch {
    throw new Error("No package.json found in current directory")
  }

  // Try to load config file
  let fileConfig: Partial<ReleaseConfig> = {}

  for (const configFile of CONFIG_FILES) {
    try {
      const configPath = resolve(cwd, configFile)
      if (configFile.endsWith(".json")) {
        const content = await readFile(configPath, "utf-8")
        fileConfig = JSON.parse(content)
      } else {
        const module = await import(configPath)
        fileConfig = module.default ?? module
      }
      break
    } catch {
      // Try next config file
    }
  }

  // Check for config in package.json
  const pkgConfig = (packageJson["release-cli"] ?? packageJson["release"]) as Partial<ReleaseConfig> | undefined

  // Merge configs: defaults < file < package.json
  const mergedConfig: Partial<ReleaseConfig> = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...pkgConfig,
    name: packageJson["name"] as string,
    version: packageJson["version"] as string,
  }

  // Load LLM config from environment
  mergedConfig.llm = loadLLMConfig(mergedConfig.llm)

  return mergedConfig
}

export function loadLLMConfig(existing?: Partial<LLMConfig>): LLMConfig {
  const provider = existing?.provider ?? (process.env["LLM_PROVIDER"] as LLMProvider) ?? detectLLMProvider()
  const apiKey = existing?.apiKey ?? getApiKey(provider)

  if (provider !== "ollama" && (!apiKey || apiKey.trim() === "")) {
    const envVar = getEnvVarName(provider)
    throw new Error(`${envVar} is required for ${provider} provider but not set`)
  }

  const config: LLMConfig = {
    provider,
    model: existing?.model ?? getDefaultModel(provider),
    apiKey,
    baseUrl: existing?.baseUrl ?? process.env["LLM_BASE_URL"],
  }

  return config
}

function getEnvVarName(provider: LLMProvider): string {
  const envVars: Record<LLMProvider, string> = {
    gemini: "GEMINI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    ollama: "",
  }
  return envVars[provider]
}

function detectLLMProvider(): LLMProvider {
  if (process.env["GEMINI_API_KEY"]) return "gemini"
  if (process.env["ANTHROPIC_API_KEY"]) return "anthropic"
  if (process.env["OPENAI_API_KEY"]) return "openai"
  if (process.env["OPENROUTER_API_KEY"]) return "openrouter"
  return "ollama" // Default to local
}

function getDefaultModel(provider: LLMProvider): string {
  switch (provider) {
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
}

function getApiKey(provider: LLMProvider): string | undefined {
  switch (provider) {
    case "gemini":
      return process.env["GEMINI_API_KEY"]
    case "anthropic":
      return process.env["ANTHROPIC_API_KEY"]
    case "openai":
      return process.env["OPENAI_API_KEY"]
    case "openrouter":
      return process.env["OPENROUTER_API_KEY"]
    case "ollama":
      return undefined // No key needed
    default:
      return undefined
  }
}

export async function getPackageJson(cwd: string): Promise<Record<string, unknown>> {
  const content = await readFile(resolve(cwd, "package.json"), "utf-8")
  return JSON.parse(content)
}

export async function updatePackageVersion(cwd: string, newVersion: string): Promise<void> {
  const { writeFile } = await import("fs/promises")
  const packageJson = await getPackageJson(cwd)
  packageJson["version"] = newVersion
  await writeFile(resolve(cwd, "package.json"), JSON.stringify(packageJson, null, 2) + "\n", "utf-8")
}
