import { ACTIVE_STYLE, HIDE_POPUP_STYLE, INACTIVE_STYLE, SHOW_POPUP_STYLE } from './constants'
import { status } from './git'

export const checkStatus = async () => {
  console.log('Checking status...')
  const statusRes = await status(false)
  if (statusRes?.stdout === '') {
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


export const showPopup = () => {
  const _style = getPluginStyle()
  setPluginStyle(`${_style}\n${SHOW_POPUP_STYLE}`)
}
export const hidePopup = () => {
  const _style = getPluginStyle()
  setPluginStyle(`${_style}\n${HIDE_POPUP_STYLE}`)
}


export const debounce = (fn, wait: number = 100, environment?: any) => {
  let timer = null
  return function() {
    // @ts-ignore
    const context = environment || this
    const args = arguments
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    // @ts-ignore
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, wait)
  }
}