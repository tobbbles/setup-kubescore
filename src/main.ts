import * as core from '@actions/core'
import path from 'path'

import { download, getStableVersion } from './download'


async function run(): Promise<void> {
  let version = core.getInput('version', { required: false })
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
