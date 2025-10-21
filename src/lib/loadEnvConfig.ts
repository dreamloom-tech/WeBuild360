import { loadEnvConfig } from '@next/env'

export default async function loadConfig() {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}