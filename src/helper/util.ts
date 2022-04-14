import { ACTIVE_STYLE, INACTIVE_STYLE } from './constants'
import { status } from './git'

export const checkStatus = async () => {
  const statusRes = await status()
  if (statusRes === '') {
    logseq.provideStyle({ key: 'git', style: INACTIVE_STYLE })
  } else {
    logseq.provideStyle({ key: 'git', style: ACTIVE_STYLE })
  }
}