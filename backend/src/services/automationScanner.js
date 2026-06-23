import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

import { config } from '../config.js'
import { getSettings } from './settingsStore.js'

const TEST_FILE_PATTERN = /Test\.java$/
const TESTRAIL_ANNOTATION = /@TestRailCases\s*\(\s*testCasesId\s*=\s*"(\d+)"/g
const TEST_METHOD_BLOCK = /((?:@[^\n]+\n\s*)*)public\s+void\s+(test\w+)\s*\(/g
const TEST_GROUPS = /@Test\s*\(\s*groups\s*=\s*\{([^}]+)\}/g
const CLASS_NAME = /class\s+(\w+)/

function parseTestMethods(content) {
  const methods = []
  const blocks = [...content.matchAll(TEST_METHOD_BLOCK)]

  for (const block of blocks) {
    const annotationBlock = block[1] ?? ''
    const methodName = block[2]
    const testRailIds = [...annotationBlock.matchAll(/@TestRailCases\s*\(\s*testCasesId\s*=\s*"(\d+)"/g)].map(
      (m) => m[1],
    )

    const groups = new Set()
    for (const match of annotationBlock.matchAll(/@Test\s*\(\s*groups\s*=\s*\{([^}]+)\}/g)) {
      match[1].split(',').forEach((g) => {
        const cleaned = g.replace(/"/g, '').trim()
        if (cleaned) groups.add(cleaned)
      })
    }

    methods.push({
      name: methodName,
      testRailIds: [...new Set(testRailIds)],
      groups: [...groups],
      textLower: `${methodName} ${annotationBlock}`.toLowerCase(),
    })
  }

  return methods
}

async function walkJavaFiles(dir, files = []) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkJavaFiles(fullPath, files)
    } else if (TEST_FILE_PATTERN.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function parseTestFile(content, filePath, repoRoot) {
  const classMatch = content.match(CLASS_NAME)
  const testClass = classMatch?.[1] ?? path.basename(filePath, '.java')
  const methods = parseTestMethods(content)
  const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, '/')

  const allGroups = new Set(methods.flatMap((m) => m.groups))

  return {
    file: relativePath,
    testClass,
    methods,
    testMethods: methods.map((m) => m.name),
    groups: [...allGroups],
    testRailIds: [...new Set(methods.flatMap((m) => m.testRailIds))],
    contentLower: content.toLowerCase(),
    pathLower: relativePath.toLowerCase(),
  }
}

function scoreMethodRelevance(method, keywords) {
  let score = 0
  for (const kw of keywords) {
    if (method.textLower.includes(kw)) score += 2
    if (method.name.toLowerCase().includes(kw)) score += 3
  }
  return score
}

function scoreTestRelevance(test, keywords) {
  let score = 0
  for (const kw of keywords) {
    if (test.pathLower.includes(kw)) score += 3
    if (test.contentLower.includes(kw)) score += 1
    if (test.testClass.toLowerCase().includes(kw)) score += 2
  }

  const methodScores = test.methods.map((m) => scoreMethodRelevance(m, keywords))
  score += Math.max(0, ...methodScores, 0)

  return score
}

function toMatchedTestEntry(test, keywords) {
  const relevantMethods =
    keywords.length === 0
      ? test.methods
      : test.methods.filter((m) => scoreMethodRelevance(m, keywords) > 0)

  const methods = relevantMethods.length > 0 ? relevantMethods : test.methods.slice(0, 5)

  return {
    file: test.file,
    testClass: test.testClass,
    testMethods: methods.map((m) => m.name),
    groups: [...new Set(methods.flatMap((m) => m.groups))],
    testRailIds: [...new Set(methods.flatMap((m) => m.testRailIds))],
    methods: methods.map((m) => ({ name: m.name, testRailIds: m.testRailIds })),
  }
}

export async function scanAutomationRepo(keywords = [], overrides = {}) {
  const repoRoot = overrides.repoPath || config.automation.repoPath
  const environment = overrides.environment || config.automation.environment
  const testRoot = path.join(repoRoot, 'src', 'test', 'java')

  const files = await walkJavaFiles(testRoot)
  const allTests = []

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')
    allTests.push(parseTestFile(content, file, repoRoot))
  }

  const scored = allTests
    .map((test) => ({ test, score: scoreTestRelevance(test, keywords) }))
    .filter(({ score }) => score > 0 || keywords.length === 0)
    .sort((a, b) => b.score - a.score)

  const matched = (keywords.length > 0 ? scored : allTests.map((t) => ({ test: t, score: 1 })))
    .slice(0, 15)
    .map(({ test }) => toMatchedTestEntry(test, keywords))

  const allCaseIds = [
    ...new Set(matched.flatMap((t) => t.testRailIds)),
  ]

  const pageObjectRoot = path.join(repoRoot, 'src', 'main', 'java')
  const pageFiles = await walkPageObjects(pageObjectRoot, keywords, repoRoot)

  return {
    repo: config.automation.repoName,
    framework: 'Java Playwright + TestNG + Allure',
    testNgSuite: 'src/test/resources/testng_suites/Admin_Sanity_Test_Suite.xml',
    environment,
    repoPath: repoRoot,
    tests: [...matched, ...pageFiles].slice(0, 20),
    allTestRailIds: allCaseIds,
    codeImpact: extractCodeImpact(pageFiles, matched),
  }
}

async function walkPageObjects(dir, keywords, repoRoot, files = []) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkPageObjects(fullPath, keywords, repoRoot, files)
    } else if (entry.name.endsWith('Page.java')) {
      const rel = path.relative(repoRoot, fullPath).replace(/\\/g, '/')
      const nameLower = entry.name.toLowerCase()
      if (keywords.length === 0 || keywords.some((k) => nameLower.includes(k) || rel.toLowerCase().includes(k))) {
        files.push({
          file: rel,
          testClass: entry.name.replace('.java', ''),
          testMethods: ['Page object'],
          groups: ['Page Object'],
          testRailIds: [],
        })
      }
    }
  }
  return files.slice(0, 8)
}

function extractCodeImpact(pageFiles, testFiles) {
  const files = [...new Set([...pageFiles, ...testFiles].map((t) => path.basename(t.file)))]
  const components = pageFiles.map((p) => p.testClass)
  const services = ['GalaxyWebService', 'AdminPortalService'].filter(() => files.length > 0)

  return { files: files.slice(0, 10), services, components: components.slice(0, 8) }
}

export function getAutomationStatus() {
  const stored = getSettings()
  const repoPath = stored.automationPath || config.automation.repoPath
  return {
    repoPath,
    environment: stored.environment || config.automation.environment,
    repoName: stored.automationRepo || config.automation.repoName,
    exists: fsSync.existsSync(repoPath),
  }
}
