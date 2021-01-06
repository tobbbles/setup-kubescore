import * as core from '@actions/core'
import path from 'path'
import * as os from 'os'
import * as fs from 'fs'

import * as toolCache from '@actions/tool-cache'

const toolName = 'helm'
const stableVersion = 'v1.10.0'

const downloadPathRoot = 'https://github.com/zegl/kube-score/releases/download'
async function getStableVersion(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((resolve, _reject) => {
    resolve(stableVersion)
  })
  // return stableHelmVersion
}

function getDownloadURL(version: string): string {
  switch (os.type()) {
    case 'Linux':
      return `${downloadPathRoot}/v${version}/kube-score_${version}_linux_amd64`
    case 'Darwin':
      return `${downloadPathRoot}/v${version}/kube-score_${version}_darwin_amd64`
    default:
      return ''
  }
}

async function download(version: string): Promise<string> {
  if (!version) {
    version = await getStableVersion()
  }

  let cachedToolpath = toolCache.find(toolName, version)

  // Download
  if (!cachedToolpath) {
    let downloadedToolPath: string
    const downloadURL = getDownloadURL(version)

    try {
      downloadedToolPath = await toolCache.downloadTool(downloadURL)
    } catch (exception) {
      throw new Error(`Failed to download Helm from location ${downloadURL}`)
    }

    fs.chmodSync(downloadedToolPath, '777')

    const unzippedToolPath = await toolCache.extractZip(downloadedToolPath)
    cachedToolpath = await toolCache.cacheDir(
      unzippedToolPath,
      toolName,
      version
    )
  }

  const cachedBinaryPath = `${cachedToolpath}/kube-score`

  core.debug(cachedBinaryPath)
  fs.chmodSync(cachedBinaryPath, '777')

  return cachedBinaryPath
}

async function run(): Promise<void> {
  let version = core.getInput('version', {required: true})
  if (version.toLocaleLowerCase() === 'latest') {
    version = await getStableVersion()
  } else if (!version.toLocaleLowerCase().startsWith('v')) {
    version = `v${version}`
  }

  const installPath = await download(version)

  try {
    if (!process.env['PATH'].startsWith(path.dirname(installPath))) {
      core.addPath(path.dirname(installPath))
    }
  } catch (_: unknown) {
    // Already installed
  }

  // eslint-disable-next-line no-console
  console.log(
    `kube-score version: '${version}' has been installed at ${installPath}`
  )
  core.setOutput('kubescore-path', installPath)
}

run()
