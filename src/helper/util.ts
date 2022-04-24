import { ACTIVE_STYLE, INACTIVE_STYLE } from './constants'
import { status } from './git'

export const checkStatus = async () => {
  console.log('Checking status...')
  const statusRes = await status()
  if (statusRes === '') {
    console.log('No changes', statusRes)
    setPluginStyle(INACTIVE_STYLE)
  } else {
    console.log('Need save', statusRes)
    setPluginStyle(ACTIVE_STYLE)
  }
  return statusRes
}

let pluginStyle = ''
export const setPluginStyle = (style: string) => {
  pluginStyle = style
  logseq.provideStyle({ key: 'git', style })
}
export const getPluginStyle = () => pluginStyle