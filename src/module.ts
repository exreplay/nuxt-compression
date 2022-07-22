import { readFileSync, writeFileSync } from 'fs'
import { defineNuxtModule } from '@nuxt/kit'
import viteCompression from 'vite-plugin-compression'
import { globbySync } from 'globby'
import { virtual } from './virtual'

export type ViteCompressionOptions = Parameters<typeof viteCompression>[0];

export interface ModuleOptions {
  viteCompression?: ViteCompressionOptions;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'compression',
    configKey: 'compression'
  },
  defaults: {
    viteCompression: {
      algorithm: 'brotliCompress',
      filter: /\.(js|mjs|json|css|html)$/i
    }
  },
  setup (options, nuxt) {
    const filter = options.viteCompression.filter
    let fileExtension = ''
    let contentEncoding = ''

    switch (options.viteCompression.algorithm) {
      case 'gzip':
        fileExtension = 'gz'
        contentEncoding = 'gzip'
        break
      case 'brotliCompress':
        fileExtension = 'br'
        contentEncoding = 'br'
        break
    }

    nuxt.hook('vite:extend', (context) => {
      context.config.plugins?.push(
        viteCompression(options.viteCompression)
      )
    })

    nuxt.hook('nitro:build:before', (nitro) => {
      nitro.options.rollupConfig?.plugins?.push(
        virtual(
          {
            '#internal/nitro/virtual/public-assets-node': `
import { promises as fsp, constants } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#internal/nitro/virtual/public-assets-data'

${typeof filter === 'function' ? `const filterFunction = ${filter.toString()}` : ''}

export async function readAsset (id, res) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  let assetPath = resolve(serverDir, assets[id].path)

  if (${typeof filter === 'function' ? 'filterFunction(assetPath)' : '/\\.(js|mjs|json|css|html)$/i.test(assetPath)'}) {
    try {
      await fsp.access(\`\${assetPath}.${fileExtension}\`, constants.R_OK | constants.W_OK);
      assetPath = \`\${assetPath}.${fileExtension}\`;
      res.setHeader('Content-Encoding', '${contentEncoding}');
    } catch {}
  }

  return fsp.readFile(assetPath);
}`
          },
          nitro.vfs
        ) as never
      )

      nitro.hooks.hook('compiled', (nitro) => {
        const [nodeServer] = globbySync('**/node-server.mjs', {
          cwd: nitro.options.output.dir,
          absolute: true
        })

        if (nodeServer) {
          let nodeServerContent = readFileSync(nodeServer, 'utf8')
          nodeServerContent = nodeServerContent.replace(
            /readAsset\(id\)/g,
            'readAsset(id, event.res)'
          )
          writeFileSync(nodeServer, nodeServerContent)
        }
      })
    })

    nuxt.hook('build:done', () => {})
  }
})
