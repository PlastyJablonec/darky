import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

try {
  // Získat git hash, datum a verzi
  const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  const gitDate = execSync('git log -1 --format=%cd --date=iso', { encoding: 'utf8' }).trim()
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
  
  const buildInfo = {
    version: packageJson.version,
    gitHash,
    buildDate: new Date().toISOString(),
    lastCommitDate: gitDate
  }

  // Vytvoř public/build-info.json
  const publicDir = './public'
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  )
  
  console.log('✅ Build info generated:', buildInfo)
} catch (error) {
  console.warn('⚠️ Could not generate build info:', error.message)
  
  // Fallback build info
  const fallbackInfo = {
    version: '1.0.0',
    gitHash: 'unknown',
    buildDate: new Date().toISOString(),
    lastCommitDate: new Date().toISOString()
  }
  
  const publicDir = './public'
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'build-info.json'),
    JSON.stringify(fallbackInfo, null, 2)
  )
}