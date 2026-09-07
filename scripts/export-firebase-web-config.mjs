import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const ENV_BY_KEY = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
}

export const toExportLines = (config) => {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('FIREBASE_WEB_CONFIG must be a JSON object')
  }

  return Object.entries(ENV_BY_KEY)
    .map(([key, envName]) => {
      const value = config[key]
      if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`FIREBASE_WEB_CONFIG missing ${key}`)
      }

      return `export ${envName}=${JSON.stringify(value)}`
    })
    .join('\n')
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isCli) {
  const configPath = process.argv[2]
  if (!configPath) {
    throw new Error('Usage: node export-firebase-web-config.mjs <json-path>')
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'))
  process.stdout.write(`${toExportLines(config)}\n`)
}
