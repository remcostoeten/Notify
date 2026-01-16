/**
 * Release CLI Type Definitions
 */

export type VersionBump = "major" | "minor" | "patch" | "premajor" | "preminor" | "prepatch" | "prerelease"

export type LLMProvider = "anthropic" | "openai" | "ollama" | "openrouter" | "gemini"

export interface LLMConfig {
  provider: LLMProvider
  model: string
  apiKey?: string
  baseUrl?: string
}

export interface GitCommit {
  hash: string
  shortHash: string
  message: string
  body: string
  author: string
  date: string
  type?: string
  scope?: string
  breaking?: boolean
}

export interface ChangelogEntry {
  version: string
  date: string
  summary: string
  sections: {
    breaking?: string[]
    features?: string[]
    fixes?: string[]
    improvements?: string[]
    docs?: string[]
    chores?: string[]
  }
  raw?: string
}

export interface ReleaseConfig {
  /** Package name */
  name: string
  /** Current version */
  version: string
  /** Git remote (default: origin) */
  remote: string
  /** Main branch (default: main) */
  branch: string
  /** NPM registry URL */
  registry: string
  /** LLM configuration for changelog generation */
  llm: LLMConfig
  /** Dry run mode - preview without executing */
  dryRun: boolean
  /** Skip confirmation prompts */
  skipConfirm: boolean
  /** Generate changelog */
  changelog: boolean
  /** Create git tag */
  tag: boolean
  /** Push to remote */
  push: boolean
  /** Publish to npm */
  publish: boolean
  /** NPM access level */
  access: "public" | "restricted"
  /** Pre-release identifier (alpha, beta, rc) */
  preid?: string
}

export interface ReleaseResult {
  success: boolean
  version: string
  changelog?: string
  gitTag?: string
  npmUrl?: string
  errors: string[]
}

export interface CLIContext {
  config: ReleaseConfig
  cwd: string
  packageJson: Record<string, unknown>
  commits: GitCommit[]
  changelog?: ChangelogEntry
}
