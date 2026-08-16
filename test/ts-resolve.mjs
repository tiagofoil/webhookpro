import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

/**
 * Next.js/bundler resolution allows extensionless relative imports ("./foo").
 * Node's ESM resolver does not. This hook lets the test runner load the app's
 * source as-is, without forcing bundler-specific syntax into production files.
 */
const hook = `
  export async function resolve(specifier, context, next) {
    try {
      return await next(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\\.(ts|tsx|js|mjs|cjs|json)$/.test(specifier)) {
        for (const ext of ['.ts', '.tsx']) {
          try {
            return await next(specifier + ext, context)
          } catch {}
        }
      }
      throw error
    }
  }
`

register(`data:text/javascript,${encodeURIComponent(hook)}`, pathToFileURL('./'))
