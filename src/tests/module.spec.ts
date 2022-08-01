import { fileURLToPath } from 'url'
import { promises } from 'fs'
import { describe, expect, it } from 'vitest'
import { setup, useTestContext, fetch } from '@nuxt/test-utils'
import { globby } from 'globby'

describe('module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
    build: true
  })

  it('ensure the generate node-server.mjs is modified correctly', async () => {
    const ctx = useTestContext()
    const [nodeServer] = await globby(`${ctx.options.nuxtConfig.buildDir}/output/**/node-server.mjs`)

    if (nodeServer) {
      const nodeServerContent = await promises.readFile(nodeServer, 'utf8')
      expect(nodeServerContent).toContain(`
const maxAge = 31536000;
const filter = /\\.(js|mjs|json|css|html)$/i;
  
async function readAsset (id, res) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  let assetPath = resolve(serverDir, assets[id].path);

  if (filter.test(assetPath)) {
    try {
      await promises.access(\`\${assetPath}.br\`, constants.R_OK | constants.W_OK);
      assetPath = \`\${assetPath}.br\`;
      res.setHeader('Content-Encoding', 'br');
    } catch {}
  }

  res.setHeader("Cache-Control", \`max-age=\${maxAge}, immutable\`);

  return promises.readFile(assetPath);
}
      `.trim())
      expect(nodeServerContent).toContain('readAsset(id, event.res)')
    }
  })

  it('should send the correct headers when a compressed file is available', async () => {
    const ctx = useTestContext()
    const [entry] = await globby(`${ctx.options.nuxtConfig.buildDir}/output/**/entry*.mjs`)

    const { headers } = await fetch(entry.replace(`${ctx.options.nuxtConfig.buildDir}/output/public`, ''))

    expect(headers.get('Content-Encoding')).toBe('br')
  })
})
