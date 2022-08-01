/* eslint-disable no-template-curly-in-string */
import { describe, expect, it } from 'vitest'
import { ModuleOptions } from '../module'
import {
  getCacheHeaders,
  getExtensionAndEncoding,
  getFilterCondition,
  getPublicAssets,
  getPublicAssetsConstants
} from '../utils'

describe('utils', () => {
  it('getPublicAssets should match snapshot', () => {
    const options: ModuleOptions = {
      maxAge: 60 * 60 * 24 * 365,
      viteCompression: {
        algorithm: 'brotliCompress',
        filter: /\.(js|mjs|json|css|html)$/i
      }
    }

    expect(getPublicAssets(options)).toMatchSnapshot()
  })

  it('getExtensionAndEncoding should return correct file extnsion and encoding', () => {
    let { fileExtension, contentEncoding } = getExtensionAndEncoding({
      algorithm: 'gzip'
    })

    expect(fileExtension).toBe('gz')
    expect(contentEncoding).toBe('gzip');

    ({ fileExtension, contentEncoding } = getExtensionAndEncoding({
      algorithm: 'brotliCompress'
    }))

    expect(fileExtension).toBe('br')
    expect(contentEncoding).toBe('br')
  })

  it('getCacheHeaders should return correct setHeader function call', () => {
    let cacheControlHeader = getCacheHeaders({ maxAge: 60 * 60 * 24 * 365 })
    expect(cacheControlHeader).toBe(
      'res.setHeader("Cache-Control", `max-age=${maxAge}, immutable`);'
    )

    cacheControlHeader = getCacheHeaders({
      maxAge: () => 60 * 60 * 24 * 365
    })
    // eslint-disable-next-line no-template-curly-in-string
    expect(cacheControlHeader).toBe(
      'res.setHeader("Cache-Control", `max-age=${maxAge(assetPath)}, immutable`);'
    )

    cacheControlHeader = getCacheHeaders({
      cacheControl: 'public, max-age=60'
    })
    // eslint-disable-next-line no-template-curly-in-string
    expect(cacheControlHeader).toBe(
      'res.setHeader("Cache-Control", cacheControl);'
    )

    cacheControlHeader = getCacheHeaders({
      cacheControl: () => 'public, max-age=60'
    })
    // eslint-disable-next-line no-template-curly-in-string
    expect(cacheControlHeader).toBe(
      'res.setHeader("Cache-Control", cacheControl(assetPath));'
    )

    cacheControlHeader = getCacheHeaders({
      maxAge: 60 * 60 * 24 * 365,
      cacheControl: 'public, max-age=60'
    })
    // eslint-disable-next-line no-template-curly-in-string
    expect(cacheControlHeader).toBe(
      'res.setHeader("Cache-Control", cacheControl);'
    )
  })

  it('getFilterCondition should return correct filter condition', () => {
    let condition = getFilterCondition({
      viteCompression: {
        filter: /\.js$/
      }
    })

    expect(condition).toBe('filter.test(assetPath)')

    condition = getFilterCondition({
      viteCompression: {
        filter: () => true
      }
    })

    expect(condition).toBe('filter(assetPath)')
  })

  it('getPublicAssetsConstants should return correct constants', () => {
    let publicAssetsConstants = getPublicAssetsConstants({
      maxAge: 60 * 60 * 24 * 365,
      viteCompression: {}
    })

    expect(publicAssetsConstants).toBe(
      `
const maxAge = ${60 * 60 * 24 * 365};
const cacheControl = undefined;
const filter = undefined;
      `.trim()
    )

    publicAssetsConstants = getPublicAssetsConstants({
      maxAge: (path) => {
        if (path.includes('js')) {
          return 1
        } else {
          return 2
        }
      },
      viteCompression: {}
    })

    expect(publicAssetsConstants).toBe(
      `
const maxAge = (path) => {
        if (path.includes("js")) {
          return 1;
        } else {
          return 2;
        }
      };
const cacheControl = undefined;
const filter = undefined;
        `.trim()
    )

    publicAssetsConstants = getPublicAssetsConstants({
      cacheControl: 'public, max-age=60',
      viteCompression: {}
    })

    expect(publicAssetsConstants).toBe(
      `
const maxAge = undefined;
const cacheControl = 'public, max-age=60';
const filter = undefined;
      `.trim()
    )

    publicAssetsConstants = getPublicAssetsConstants({
      cacheControl: (path) => {
        if (path.includes('js')) {
          return 'public, max-age=1'
        } else {
          return 'public, max-age=2'
        }
      },
      viteCompression: {}
    })

    expect(publicAssetsConstants).toBe(
      `
const maxAge = undefined;
const cacheControl = (path) => {
        if (path.includes("js")) {
          return "public, max-age=1";
        } else {
          return "public, max-age=2";
        }
      };
const filter = undefined;
        `.trim()
    )

    publicAssetsConstants = getPublicAssetsConstants({
      viteCompression: {
        filter: /\.(js|mjs|json|css|html)$/i
      }
    })

    expect(publicAssetsConstants).toBe(
      `
const maxAge = undefined;
const cacheControl = undefined;
const filter = /\\.(js|mjs|json|css|html)$/i;
        `.trim()
    )

    publicAssetsConstants = getPublicAssetsConstants({
      viteCompression: {
        filter: (path) => {
          if (path.includes('js')) {
            return true
          } else {
            return false
          }
        }
      }
    })

    expect(publicAssetsConstants).toBe(
      `
const maxAge = undefined;
const cacheControl = undefined;
const filter = (path) => {
          if (path.includes("js")) {
            return true;
          } else {
            return false;
          }
        };
        `.trim()
    )
  })
})
