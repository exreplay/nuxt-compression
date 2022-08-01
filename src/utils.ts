import { ModuleOptions, ViteCompressionOptions } from './module'

export function getExtensionAndEncoding (options: ViteCompressionOptions) {
  let fileExtension = ''
  let contentEncoding = ''

  switch (options.algorithm) {
    case 'gzip':
      fileExtension = 'gz'
      contentEncoding = 'gzip'
      break
    case 'brotliCompress':
      fileExtension = 'br'
      contentEncoding = 'br'
      break
  }

  return {
    fileExtension,
    contentEncoding
  }
}

export function getCacheHeaders (options: ModuleOptions) {
  let cacheControlHeader = ''

  if (options.cacheControl) {
    const cacheControl = typeof options.cacheControl === 'function' ? 'cacheControl(assetPath)' : 'cacheControl'
    cacheControlHeader = `res.setHeader("Cache-Control", ${cacheControl});`
  } else {
    const maxAge = typeof options.maxAge === 'function' ? 'maxAge(assetPath)' : 'maxAge'
    cacheControlHeader = `res.setHeader("Cache-Control", \`max-age=\${${maxAge}}, immutable\`);`
  }

  return cacheControlHeader
}

export function getPublicAssetsConstants (options: ModuleOptions) {
  let cacheControl = 'undefined'

  if (typeof options.cacheControl === 'function') {
    cacheControl = options.cacheControl.toString()
  } else if (typeof options.cacheControl === 'string') {
    cacheControl = `'${options.cacheControl}'`
  }

  return `
const maxAge = ${options.maxAge};
const cacheControl = ${cacheControl};
const filter = ${options.viteCompression.filter};
`.trim()
}

export function getFilterCondition (options: ModuleOptions) {
  return typeof options.viteCompression.filter === 'function' ? 'filter(assetPath)' : 'filter.test(assetPath)'
}

export function getPublicAssets (options: ModuleOptions) {
  const { fileExtension, contentEncoding } = getExtensionAndEncoding(options.viteCompression)
  const cacheControlHeader = getCacheHeaders(options)

  return `
import { promises as fsp, constants } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#internal/nitro/virtual/public-assets-data'

${getPublicAssetsConstants(options)}
  
export async function readAsset (id, res) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  let assetPath = resolve(serverDir, assets[id].path)

  if (${getFilterCondition(options)}) {
    try {
      await fsp.access(\`\${assetPath}.${fileExtension}\`, constants.R_OK | constants.W_OK);
      assetPath = \`\${assetPath}.${fileExtension}\`;
      res.setHeader('Content-Encoding', '${contentEncoding}');
    } catch {}
  }

  ${cacheControlHeader}

  return fsp.readFile(assetPath);
}`
}
