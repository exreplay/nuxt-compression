# Compression module for Nuxt 3

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

## Setup

```bash
yarn install -D @averjs/nuxt-compression
pnpm add -D @averjs/nuxt-compression
```

## Usage

```ts
export default defineNuxtConfig({
  buildModules: ['@averjs/nuxt-compression'],
  'compression': {
    // options
  },
});
```

## Options

### `viteCompression`

* default -
```ts
{
  algorithm: 'brotliCompress',
  filter: /\.(js|mjs|json|css|html)$/i
}
```

Options for the `vite-plugin-compression` plugin

### `maxAge`

* default - `60 * 60 * 24 * 365`

Set the `maxAge` for the `Cache-Control` Header. Can either be a number or a filter function which accepts the asset path and should return a `number`. Be aware, if you use `cacheControl` alongside `maxAge`, it is getting ignored.

### `cacheControl`

* default - `undefined`

Set `Cache-Control` Header. Can either be a string or a filter function which accespts the asset path and should return a valid `Cache-Control` Header string. This option has more weight than `maxAge` and overwrites it. You can head to [MDN](https://developer.mozilla.org/de/docs/Web/HTTP/Headers/Cache-Control) to see all the available options.

## Development

- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@averjs/nuxt-compression/latest.svg
[npm-version-href]: https://npmjs.com/package/@averjs/nuxt-compression

[npm-downloads-src]: https://img.shields.io/npm/dt/@averjs/nuxt-compression.svg
[npm-downloads-href]: https://npmjs.com/package/@averjs/nuxt-compression