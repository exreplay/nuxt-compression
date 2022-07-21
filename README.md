# Compression module for Nuxt 3

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
