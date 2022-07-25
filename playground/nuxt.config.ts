import { defineNuxtConfig } from 'nuxt'
import MyModule from '..'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  compression: {
    // maxAge: 30 * 24 * 60 * 60
    // maxAge: (file) => {
    //   if (file.includes('error')) {
    //     return 0
    //   } else {
    //     return 30 * 24 * 60 * 60
    //   }
    // }
    // cacheControl: `public, max-age=${30 * 24 * 60 * 60}`
    // cacheControl: (file) => {
    //   if (file.includes('error')) {
    //     return 'no-cache'
    //   } else {
    //     return `public, max-age=${30 * 24 * 60 * 60}`
    //   }
    // }
  }
})
