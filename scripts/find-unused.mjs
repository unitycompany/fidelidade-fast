// Simple unused-file detector for JS/JSX modules under src.
// Builds a graph from src/main.jsx and reports files in components/services/utils not reachable.
import { promises as fs } from 'fs'
import path from 'path'

const ROOT = path.resolve(process.cwd())
const SRC = path.join(ROOT, 'src')

const EXTS = ['.js', '.jsx']
const START = path.join(SRC, 'main.jsx')

/** Read file safely */
async function readFile(file) {
  try {
    return await fs.readFile(file, 'utf8')
  } catch {
    return null
  }
}

/** Get list of JS/JSX files under a directory recursively */
async function listFiles(dir) {
  const out = []
  async function walk(d) {
    const entries = await fs.readdir(d, { withFileTypes: true })
    for (const e of entries) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        await walk(p)
      } else if (EXTS.includes(path.extname(e.name))) {
        out.push(p)
      }
    }
  }
  await walk(dir)
  return out
}

/** Extract import specifiers via regex (ESM only) */
function extractSpecifiers(code) {
  const specs = new Set()
  const importRe = /import\s+[^'";]+from\s*['"]([^'"\n]+)['"];?/g
  const sideRe = /import\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g
  const exportRe = /export\s+[^;]*from\s*['"]([^'"\n]+)['"]/g
  let m
  while ((m = importRe.exec(code))) specs.add(m[1])
  while ((m = sideRe.exec(code))) specs.add(m[1])
  while ((m = exportRe.exec(code))) specs.add(m[1])
  return [...specs]
}

/** Try resolve a specifier relative to a file, returning absolute path if exists */
async function resolveImport(spec, fromFile) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null // skip packages/aliases
  const base = path.resolve(path.dirname(fromFile), spec)
  const candidates = []
  if (EXTS.includes(path.extname(base))) candidates.push(base)
  else {
    for (const ext of EXTS) candidates.push(base + ext)
    candidates.push(path.join(base, 'index.js'))
    candidates.push(path.join(base, 'index.jsx'))
  }
  for (const c of candidates) {
    try {
      const st = await fs.stat(c)
      if (st.isFile()) return c
    } catch {}
  }
  return null
}

async function buildGraph(entry) {
  const graph = new Map() // file -> Set(deps)
  const visited = new Set()
  async function visit(file) {
    if (visited.has(file)) return
    visited.add(file)
    const code = await readFile(file)
    if (!code) return
    const deps = new Set()
    for (const spec of extractSpecifiers(code)) {
      const r = await resolveImport(spec, file)
      if (r && r.startsWith(SRC)) deps.add(r)
    }
    graph.set(file, deps)
    for (const d of deps) await visit(d)
  }
  await visit(entry)
  return { graph, visited }
}

function filterCandidates(allFiles, reachable) {
  const inScopes = allFiles.filter(f =>
    f.startsWith(path.join(SRC, 'components')) ||
    f.startsWith(path.join(SRC, 'services')) ||
    f.startsWith(path.join(SRC, 'utils'))
  )
  return inScopes.filter(f => !reachable.has(f))
}

async function main() {
  const existsStart = await readFile(START)
  if (!existsStart) {
    console.error('Entry not found:', START)
    process.exit(2)
  }
  const { visited } = await buildGraph(START)
  const all = await listFiles(SRC)
  const unused = filterCandidates(all, visited)
  const format = process.argv.includes('--json') ? 'json' : 'text'
  if (format === 'json') {
    console.log(JSON.stringify({ entry: START, reachableCount: visited.size, totalCandidates: all.length, unused }, null, 2))
  } else {
    console.log(`Reachable: ${visited.size} files`)
    console.log(`Total JS/JSX: ${all.length}`)
    console.log('Unused candidates:')
    for (const f of unused) console.log(' -', path.relative(ROOT, f))
  }
  // Exit with 0 even if unused found
}

main().catch(err => { console.error(err); process.exit(1) })
