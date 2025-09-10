// Archives unused JS/JSX modules (under src) and backup/test files into archive_unused/
import { promises as fs } from 'fs'
import path from 'path'

const ROOT = path.resolve(process.cwd())
const SRC = path.join(ROOT, 'src')
const ARCHIVE = path.join(ROOT, 'archive_unused')

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function fileExists(p) {
  try { await fs.stat(p); return true } catch { return false }
}

async function readJSONFromFindUnused() {
  // Dynamically import the analyzer script to get the list programmatically would require refactoring.
  // Instead, spawn it via node and capture JSON by reusing it as a child process is more complex here.
  // We'll re-implement a light call by importing it as a module using dynamic import of its default export if any.
  // Simpler: run it via child_process.
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const execFileP = promisify(execFile)
  const res = await execFileP(process.execPath, [path.join('scripts', 'find-unused.mjs'), '--json'], { cwd: ROOT })
  return JSON.parse(res.stdout)
}

async function listBackupAndTests() {
  const results = []
  // Backup/broken patterns under src
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) await walk(p)
      else if (/\.backup$|\.broken$/i.test(e.name)) results.push(p)
    }
  }
  await walk(SRC)

  // Root-level ad-hoc tests and html demos
  const rootCandidates = (await fs.readdir(ROOT)).filter(n => /^test-.*\.(js|html)$/i.test(n) || /^teste-.*\.(js|html)$/i.test(n))
  for (const n of rootCandidates) results.push(path.join(ROOT, n))
  return results
}

async function moveFile(src, dest) {
  await ensureDir(path.dirname(dest))
  await fs.rename(src, dest)
}

async function main() {
  const dry = process.argv.includes('--dry-run')
  const report = await readJSONFromFindUnused()
  const unused = report.unused || []
  const extras = await listBackupAndTests()
  const toArchive = [...new Set([...unused, ...extras])]

  if (!toArchive.length) {
    console.log('No files to archive.')
    return
  }
  console.log(`Found ${toArchive.length} files to archive.`)
  for (const abs of toArchive) {
    const rel = path.relative(ROOT, abs)
    const dest = path.join(ARCHIVE, rel)
    console.log(` - ${rel}`)
    if (!dry) {
      if (await fileExists(abs)) {
        await moveFile(abs, dest)
      }
    }
  }
  if (dry) console.log('\nDry run complete. Re-run without --dry-run to apply.')
}

main().catch(err => { console.error(err); process.exit(1) })
