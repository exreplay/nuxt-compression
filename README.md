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

## Development

- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@averjs/nuxt-compression/latest.svg
[npm-version-href]: https://npmjs.com/package/@averjs/nuxt-compression

[npm-downloads-src]: https://img.shields.io/npm/dt/@averjs/nuxt-compression.svg
[npm-downloads-href]: https://npmjs.com/package/@averjs/nuxt-compression