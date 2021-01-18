import * as os from 'os'

import {getDownloadURL} from '../src/download'

jest.mock('os')

const osType = os.type as jest.Mock

beforeAll(() => {
  osType.mockReset()
})

describe('download url', () => {
  test('parses Linux correctly', async () => {
    expect.assertions(2)
    osType.mockReturnValue('Linux')

    await expect(getDownloadURL('v1.0.0')).resolves.toBe(
      'https://github.com/zegl/kube-score/releases/download/v1.0.0/kube-score_1.0.0_linux_amd64.tar.gz'
    )
    expect(osType).toHaveBeenCalledTimes(1)
  })

  test('parses Darwin correctly', async () => {
    expect.assertions(2)
    osType.mockReturnValue('Darwin')

    await expect(getDownloadURL('v1.0.0')).resolves.toBe(
      'https://github.com/zegl/kube-score/releases/download/v1.0.0/kube-score_1.0.0_darwin_amd64.tar.gz'
    )
    expect(osType).toHaveBeenCalledTimes(1)
  })

  test('rejects unsupported operating systems', async () => {
    expect.assertions(2)
    osType.mockReturnValue('Unsupported')

    await expect(getDownloadURL('v1.0.0')).rejects.toThrowError(
      'unsupported operating system'
    )
    expect(osType).toHaveBeenCalledTimes(1)
  })
})
