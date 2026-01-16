/**
 * Git utilities for release management
 */

import simpleGit, { type SimpleGit } from "simple-git"
import type { GitCommit } from "../types.js"

const CONVENTIONAL_COMMIT_REGEX = /^(?<type>\w+)(?:$$(?<scope>[^)]+)$$)?(?<breaking>!)?: (?<subject>.+)$/

export function createGit(cwd: string = process.cwd()): SimpleGit {
  return simpleGit(cwd)
}

export async function getGitStatus(git: SimpleGit): Promise<{
  isClean: boolean
  branch: string
  ahead: number
  behind: number
  staged: string[]
  modified: string[]
  untracked: string[]
}> {
  const status = await git.status()
  return {
    isClean: status.isClean(),
    branch: status.current ?? "unknown",
    ahead: status.ahead,
    behind: status.behind,
    staged: status.staged,
    modified: status.modified,
    untracked: status.not_added,
  }
}

export async function getCommitsSinceTag(git: SimpleGit, tag?: string): Promise<GitCommit[]> {
  const range = tag ? `${tag}..HEAD` : "HEAD~50..HEAD"

  try {
    const log = await git.log({
      from: tag ?? undefined,
      to: "HEAD",
      format: {
        hash: "%H",
        shortHash: "%h",
        message: "%s",
        body: "%b",
        author: "%an",
        date: "%aI",
      },
    })

    return log.all.map((commit) => {
      const parsed = parseConventionalCommit(commit.message)
      return {
        hash: commit.hash,
        shortHash: commit.shortHash ?? commit.hash.slice(0, 7),
        message: commit.message,
        body: commit.body ?? "",
        author: commit.author ?? "unknown",
        date: commit.date ?? new Date().toISOString(),
        type: parsed?.type,
        scope: parsed?.scope,
        breaking: parsed?.breaking,
      }
    })
  } catch {
    // Fallback if no tags exist
    const log = await git.log({ maxCount: 50 })
    return log.all.map((commit) => {
      const parsed = parseConventionalCommit(commit.message)
      return {
        hash: commit.hash,
        shortHash: commit.hash.slice(0, 7),
        message: commit.message,
        body: commit.body ?? "",
        author: commit.author_name ?? "unknown",
        date: commit.date ?? new Date().toISOString(),
        type: parsed?.type,
        scope: parsed?.scope,
        breaking: parsed?.breaking,
      }
    })
  }
}

export async function getLatestTag(git: SimpleGit): Promise<string | null> {
  try {
    const tags = await git.tags(["--sort=-version:refname"])
    const versionTags = tags.all.filter((t) => /^v?\d+\.\d+\.\d+/.test(t))
    return versionTags[0] ?? null
  } catch {
    return null
  }
}

export async function createTag(git: SimpleGit, tag: string, message: string): Promise<void> {
  await git.addAnnotatedTag(tag, message)
}

export async function pushWithTags(git: SimpleGit, remote = "origin", branch = "main"): Promise<void> {
  await git.push(remote, branch)
  await git.pushTags(remote)
}

export async function commitChanges(git: SimpleGit, message: string, files: string[] = ["."]): Promise<void> {
  await git.add(files)
  await git.commit(message)
}

function parseConventionalCommit(message: string): {
  type: string
  scope?: string
  breaking: boolean
  subject: string
} | null {
  const match = message.match(CONVENTIONAL_COMMIT_REGEX)
  if (!match?.groups) return null

  return {
    type: match.groups.type,
    scope: match.groups.scope,
    breaking: !!match.groups.breaking,
    subject: match.groups.subject,
  }
}
