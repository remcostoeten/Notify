/**
 * LLM integration for AI-powered changelog generation
 */

import type { LLMConfig, GitCommit, ChangelogEntry } from "../types.js"

const CHANGELOG_SYSTEM_PROMPT = `You are a technical writer generating changelogs for software releases.
Your task is to analyze git commits and generate a clear, well-structured changelog entry.

Guidelines:
- Be concise but informative
- Group changes logically (features, fixes, improvements, breaking changes)
- Use present tense ("Add feature" not "Added feature")
- Start each item with a verb
- Mention scope/component if relevant
- Highlight breaking changes prominently
- Write for developers who will read this

Output format (markdown):
## [version] - date

Brief 1-2 sentence summary of the release.

### Breaking Changes (if any)
- Item

### Features (if any)
- Item

### Bug Fixes (if any)  
- Item

### Improvements (if any)
- Item

### Documentation (if any)
- Item

Only include sections that have items. Be selective - not every commit needs to be in the changelog.`

export async function generateChangelog(
  config: LLMConfig,
  commits: GitCommit[],
  version: string,
  packageName: string,
): Promise<ChangelogEntry> {
  const commitSummary = commits
    .map((c) => `- ${c.shortHash}: ${c.message}${c.body ? `\n  ${c.body.trim()}` : ""}`)
    .join("\n")

  const userPrompt = `Generate a changelog for ${packageName} version ${version}.

Commits since last release:
${commitSummary}

Generate a changelog entry following the format in your instructions.`

  const response = await callLLM(config, CHANGELOG_SYSTEM_PROMPT, userPrompt)

  return parseChangelogResponse(response, version)
}

async function callLLM(config: LLMConfig, systemPrompt: string, userPrompt: string): Promise<string> {
  const { provider, model, apiKey, baseUrl } = config

  switch (provider) {
    case "anthropic":
      return callAnthropic(apiKey!, model, systemPrompt, userPrompt)
    case "openai":
      return callOpenAI(apiKey!, model, systemPrompt, userPrompt, baseUrl)
    case "openrouter":
      return callOpenRouter(apiKey!, model, systemPrompt, userPrompt)
    case "ollama":
      return callOllama(model, systemPrompt, userPrompt, baseUrl)
    case "gemini":
      return callGemini(apiKey!, model, systemPrompt, userPrompt)
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`)
  }
}

async function callAnthropic(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = (await response.json()) as { content: Array<{ type: string; text: string }> }
  return data.content[0]?.text ?? ""
}

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  baseUrl?: string,
): Promise<string> {
  const url = baseUrl ?? "https://api.openai.com/v1/chat/completions"

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> }
  return data.choices[0]?.message?.content ?? ""
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/remcostoeten/release-cli",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> }
  return data.choices[0]?.message?.content ?? ""
}

async function callOllama(model: string, systemPrompt: string, userPrompt: string, baseUrl?: string): Promise<string> {
  const url = baseUrl ?? "http://localhost:11434/api/chat"

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ollama API error: ${error}`)
  }

  const data = (await response.json()) as { message: { content: string } }
  return data.message?.content ?? ""
}

async function callGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = (await response.json()) as {
    candidates: Array<{
      content: {
        parts: Array<{ text: string }>
      }
    }>
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

function parseChangelogResponse(response: string, version: string): ChangelogEntry {
  const sections: ChangelogEntry["sections"] = {}

  // Extract sections from markdown
  const breakingMatch = response.match(/### Breaking Changes\n([\s\S]*?)(?=###|$)/i)
  const featuresMatch = response.match(/### Features?\n([\s\S]*?)(?=###|$)/i)
  const fixesMatch = response.match(/### (?:Bug )?Fixes?\n([\s\S]*?)(?=###|$)/i)
  const improvementsMatch = response.match(/### Improvements?\n([\s\S]*?)(?=###|$)/i)
  const docsMatch = response.match(/### Documentation\n([\s\S]*?)(?=###|$)/i)

  const parseItems = (match: RegExpMatchArray | null): string[] | undefined => {
    if (!match) return undefined
    const items = match[1]
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
    return items.length > 0 ? items : undefined
  }

  sections.breaking = parseItems(breakingMatch)
  sections.features = parseItems(featuresMatch)
  sections.fixes = parseItems(fixesMatch)
  sections.improvements = parseItems(improvementsMatch)
  sections.docs = parseItems(docsMatch)

  // Extract summary (first paragraph after version header)
  const summaryMatch = response.match(/## \[.*?\].*?\n\n(.*?)(?=\n\n|###)/s)
  const summary = summaryMatch?.[1]?.trim() ?? "Release updates and improvements."

  return {
    version,
    date: new Date().toISOString().split("T")[0],
    summary,
    sections,
    raw: response,
  }
}

export function formatChangelogEntry(entry: ChangelogEntry): string {
  const lines: string[] = []

  lines.push(`## [${entry.version}] - ${entry.date}`)
  lines.push("")
  lines.push(entry.summary)
  lines.push("")

  if (entry.sections.breaking?.length) {
    lines.push("### Breaking Changes")
    entry.sections.breaking.forEach((item) => lines.push(`- ${item}`))
    lines.push("")
  }

  if (entry.sections.features?.length) {
    lines.push("### Features")
    entry.sections.features.forEach((item) => lines.push(`- ${item}`))
    lines.push("")
  }

  if (entry.sections.fixes?.length) {
    lines.push("### Bug Fixes")
    entry.sections.fixes.forEach((item) => lines.push(`- ${item}`))
    lines.push("")
  }

  if (entry.sections.improvements?.length) {
    lines.push("### Improvements")
    entry.sections.improvements.forEach((item) => lines.push(`- ${item}`))
    lines.push("")
  }

  if (entry.sections.docs?.length) {
    lines.push("### Documentation")
    entry.sections.docs.forEach((item) => lines.push(`- ${item}`))
    lines.push("")
  }

  return lines.join("\n")
}

export async function prependToChangelog(changelogPath: string, entry: string): Promise<void> {
  const fs = await import("fs/promises")

  let existing = ""
  try {
    existing = await fs.readFile(changelogPath, "utf-8")
  } catch {
    // File doesn't exist, create with header
    existing = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n"
  }

  // Insert new entry after header
  const headerEnd = existing.indexOf("\n\n", existing.indexOf("# Changelog"))
  const header = existing.slice(0, headerEnd + 2)
  const rest = existing.slice(headerEnd + 2)

  const newContent = `${header}${entry}\n${rest}`
  await fs.writeFile(changelogPath, newContent, "utf-8")
}
