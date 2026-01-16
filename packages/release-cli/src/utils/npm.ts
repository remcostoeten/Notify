/**
 * NPM utilities for package publishing
 */

import { execa } from "execa"

export interface NpmWhoami {
  username: string
  registry: string
}

export async function getNpmWhoami(registry?: string): Promise<NpmWhoami | null> {
  try {
    const args = ["whoami"]
    if (registry) args.push("--registry", registry)

    const { stdout } = await execa("npm", args)
    return {
      username: stdout.trim(),
      registry: registry ?? "https://registry.npmjs.org",
    }
  } catch {
    return null
  }
}

export async function npmPublish(
  cwd: string,
  options: {
    access?: "public" | "restricted"
    tag?: string
    registry?: string
    dryRun?: boolean
    otp?: string
  } = {},
): Promise<{ success: boolean; output: string }> {
  const args = ["publish"]

  if (options.access) args.push("--access", options.access)
  if (options.tag) args.push("--tag", options.tag)
  if (options.registry) args.push("--registry", options.registry)
  if (options.dryRun) args.push("--dry-run")
  if (options.otp) args.push("--otp", options.otp)

  try {
    const { stdout, stderr } = await execa("npm", args, { cwd })
    return { success: true, output: stdout || stderr }
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string }
    return { success: false, output: err.stderr ?? err.message ?? "Unknown error" }
  }
}

export async function npmVersion(
  cwd: string,
  version: string,
  options: {
    message?: string
    noGitTag?: boolean
  } = {},
): Promise<{ success: boolean; newVersion: string }> {
  const args = ["version", version]

  if (options.message) args.push("--message", options.message)
  if (options.noGitTag) args.push("--no-git-tag-version")

  try {
    const { stdout } = await execa("npm", args, { cwd })
    return { success: true, newVersion: stdout.trim().replace(/^v/, "") }
  } catch (error: unknown) {
    const err = error as { message?: string }
    throw new Error(`Failed to bump version: ${err.message}`)
  }
}

export async function npmRunScript(cwd: string, script: string): Promise<{ success: boolean; output: string }> {
  try {
    const { stdout } = await execa("npm", ["run", script], { cwd })
    return { success: true, output: stdout }
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string }
    return { success: false, output: err.stderr ?? err.message ?? "Unknown error" }
  }
}
