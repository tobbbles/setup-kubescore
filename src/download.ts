import * as os from 'os'
import * as fs from 'fs'

import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'

export const toolName = 'helm'
export const stableVersion = 'v1.10.0'
const downloadPathRoot = 'https://github.com/zegl/kube-score/releases/download'

export async function getStableVersion(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((resolve, _reject) => {
    resolve(stableVersion)
  })
}

export async function getDownloadURL(version: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    switch (os.type()) {
      case 'Linux':
        resolve(
          `${downloadPathRoot}/${version}/kube-score_${version.replace(
            'v',
            ''
          )}_linux_amd64.tar.gz`
        )
        break

      case 'Darwin':
        resolve(
          `${downloadPathRoot}/${version}/kube-score_${version.replace(
            'v',
            ''
          )}_darwin_amd64.tar.gz`
        )
        break

      default:
        reject(new Error('unsupported operating system'))
        break
    }
  })
}

export async function download(version: string): Promise<string> {
  if (!version) {
    version = await getStableVersion()
  }

  let cachedToolpath = toolCache.find(toolName, version)

  // Download
  if (!cachedToolpath) {
    let downloadedToolPath: string

    const downloadURL = await getDownloadURL(version)

    try {
      downloadedToolPath = await toolCache.downloadTool(downloadURL)
    } catch (exception) {
      throw new Error(
        `Failed to download kube-score from location ${downloadURL}`
      )
    }

    fs.chmodSync(downloadedToolPath, '777')

    const unzippedToolPath = await toolCache.extractTar(downloadedToolPath)
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
