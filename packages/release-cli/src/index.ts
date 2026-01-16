/**
 * @remcostoeten/release-cli
 * Programmatic API exports
 */

export { runRelease } from "./commands/release.js"
export { runChangelog } from "./commands/changelog.js"
export { runStatus } from "./commands/status.js"
export { loadConfig, loadLLMConfig } from "./utils/config.js"
export { generateChangelog, formatChangelogEntry, prependToChangelog } from "./utils/llm.js"
export { createGit, getGitStatus, getCommitsSinceTag, getLatestTag } from "./utils/git.js"
export { getNpmWhoami, npmPublish, npmVersion } from "./utils/npm.js"

export type {
  ReleaseConfig,
  ReleaseResult,
  ReleaseOptions,
  VersionBump,
  LLMProvider,
  LLMConfig,
  GitCommit,
  ChangelogEntry,
  CLIContext,
} from "./types.js"
