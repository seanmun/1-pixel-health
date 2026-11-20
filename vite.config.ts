import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A short fingerprint of every model file, so each is requested as
// models/<name>.glb?v=<fingerprint>. vercel.json lets browsers keep models for a
// year; a changed model gets a new address and is fetched afresh.
const modelHashes = () => {
  const root = join(__dirname, 'public/models')
  const out: Record<string, string> = {}
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else if (name.endsWith('.glb'))
        out[relative(root, path).split('\\').join('/')] = createHash('sha1').update(readFileSync(path)).digest('hex').slice(0, 10)
    }
  }
  walk(root)
  return out
}

export default defineConfig({
  plugins: [react()],
  base: '/', // changed from '/1-pixel-health/'
  define: { __MODEL_HASHES__: JSON.stringify(modelHashes()) },
})
