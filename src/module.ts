import { readFileSync, writeFileSync } from 'fs'
import { defineNuxtModule } from '@nuxt/kit'
import viteCompression from 'vite-plugin-compression'
import { globbySync } from 'globby'
import { virtual } from './virtual'

export type ViteCompressionOptions = Parameters<typeof viteCompression>[0];

export interface ModuleOptions {
  maxAge?: number | ((path: string) => number);
  cacheControl?: string | ((path: string) => number);
  viteCompression?: ViteCompressionOptions;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'compression',
    configKey: 'compression'
  },
  defaults: {
    maxAge: 60 * 60 * 24 * 365,
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
      let cacheControlHeader

      if (options.cacheControl) {
        const cacheControl = typeof options.cacheControl === 'function' ? 'cacheControl(assetPath)' : 'cacheControl'
        cacheControlHeader = `res.setHeader("Cache-Control", ${cacheControl});`
      } else {
        const maxAge = typeof options.maxAge === 'function' ? 'maxAge(assetPath)' : 'maxAge'
        cacheControlHeader = `res.setHeader("Cache-Control", \`max-age=\${${maxAge}}, immutable\`);`
      }

      nitro.options.rollupConfig?.plugins?.push(
        virtual(
          {
            '#internal/nitro/virtual/public-assets-node': `
import { promises as fsp, constants } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#internal/nitro/virtual/public-assets-data'

const maxAge = ${options.maxAge};
const cacheControl = ${typeof options.cacheControl === 'function' ? options.cacheControl.toString() : options.cacheControl ? `'${options.cacheControl}'` : 'undefined'};
const filter = ${filter};
 
export async function readAsset (id, res) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  let assetPath = resolve(serverDir, assets[id].path)

  if (${typeof filter === 'function' ? 'filter(assetPath)' : 'filter.test(assetPath)'}) {
    try {
      await fsp.access(\`\${assetPath}.${fileExtension}\`, constants.R_OK | constants.W_OK);
      assetPath = \`\${assetPath}.${fileExtension}\`;
      res.setHeader('Content-Encoding', '${contentEncoding}');
    } catch {}
  }

  ${cacheControlHeader}

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
