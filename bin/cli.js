#!/usr/bin/env node
// agentic-harness CLI — wraps dsh with the project overlay.
// Resolves the overlay's customSkillDirs against this project root so the
// skill filesystem provider finds .dsh/skills/ regardless of cwd.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const mode = process.argv[2] ?? 'web'
const taskArgs = process.argv.slice(3)

const overlayFile = mode === 'web' ? 'cordis.yml' : 'cordis.headless.yml'
const overlayPath = join(projectRoot, overlayFile)

// Replace the __PROJECT_ROOT__ token with the actual project root, so
// customSkillDirs resolves regardless of where dsh runs from.
let overlay = readFileSync(overlayPath, 'utf8')
overlay = overlay.replaceAll('__PROJECT_ROOT__', projectRoot)

const tmpDir = mkdtempSync(join(tmpdir(), 'agentic-harness-'))
const tmpOverlayPath = join(tmpDir, 'overlay.yml')
writeFileSync(tmpOverlayPath, overlay)

const profile = mode === 'web' ? 'web' : 'headless'

// Resolve the dsh executable in order of preference.
const installedBin = resolve(projectRoot, 'node_modules', '.bin', 'dsh')
const repoBin = resolve(projectRoot, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
const appsCliBin = resolve(projectRoot, 'node_modules', '@deepseek-ai', 'dsh', 'apps', 'cli', 'lib', 'bin.js')
const tsxBin = resolve(projectRoot, 'node_modules', '@deepseek-ai', 'dsh', 'apps', 'cli', 'src', 'bin.ts')
const tsxHook = resolve(projectRoot, 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '.pnpm', 'tsx@4.22.4', 'node_modules', 'tsx', 'esm')

let cmd
let args
if (existsSync(installedBin)) {
  cmd = installedBin
  args = ['--profile', profile, '--patch', tmpOverlayPath]
} else if (existsSync(repoBin)) {
  cmd = 'node'
  args = [repoBin, '--profile', profile, '--patch', tmpOverlayPath]
} else if (existsSync(appsCliBin)) {
  cmd = 'node'
  args = [appsCliBin, '--profile', profile, '--patch', tmpOverlayPath]
} else if (existsSync(tsxBin) && existsSync(tsxHook)) {
  cmd = 'node'
  args = ['--import', tsxHook, tsxBin, '--profile', profile, '--patch', tmpOverlayPath]
} else {
  console.error('agentic-harness: dsh not found.')
  console.error(`Run 'npm install' in ${projectRoot}, or link a deepseek-harness clone at node_modules/@deepseek-ai/dsh.`)
  cleanup()
  process.exit(1)
}

if (mode === 'headless' && taskArgs.length > 0) {
  args.push(taskArgs.join(' '))
}

function cleanup() {
  rmSync(tmpDir, { recursive: true, force: true })
}

const child = spawn(cmd, args, {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: process.cwd(),
})

child.on('exit', (code) => {
  cleanup()
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  console.error('agentic-harness: failed to start dsh:', err.message)
  console.error(`make sure you ran 'npm install' in ${projectRoot}`)
  cleanup()
  process.exit(1)
})