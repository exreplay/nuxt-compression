import { readFileSync, writeFileSync } from 'fs'
import { defineNuxtModule } from '@nuxt/kit'
import viteCompression from 'vite-plugin-compression'
import { globbySync } from 'globby'
import { virtual } from './virtual'
import { getPublicAssets } from './utils'

export type ViteCompressionOptions = Parameters<typeof viteCompression>[0];

export interface ModuleOptions {
  maxAge?: number | ((path: string) => number);
  cacheControl?: string | ((path: string) => string);
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
    nuxt.hook('vite:extend', (context) => {
      context.config.plugins?.push(
        viteCompression(options.viteCompression)
      )
    })

    nuxt.hook('nitro:build:before', (nitro) => {
      nitro.options.rollupConfig?.plugins?.push(
        virtual(
          {
            '#internal/nitro/virtual/public-assets-node': getPublicAssets(options)
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
