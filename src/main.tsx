import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { COMMON_STYLE, LOADING_STYLE, SHOW_POPUP_STYLE } from './helper/constants'
import { commit, push, status } from './helper/git'
import { checkStatus, getPluginStyle, setPluginStyle } from './helper/util'
import './index.css'

const isDevelopment = import.meta.env.DEV

if (isDevelopment) {
  renderApp('browser')
} else {
  console.log('=== logseq-plugin-git loaded ===')
  logseq.ready(() => {

    checkStatus()

    logseq.provideModel({
      async check() {
        const status = await checkStatus()
        logseq.App.showMsg(status)
      },
      async push() {
        setPluginStyle(LOADING_STYLE)
        console.log('Committing...')
        await commit(`[logseq-plugin-git:push] ${new Date().toISOString()}`)
        console.log('Pushing...')
        await push()
        console.log('Checking status...')
        checkStatus()
      },
      async showPopup() {
        const _style = getPluginStyle()
        setPluginStyle(`${_style}\n${SHOW_POPUP_STYLE}`)
      },
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'git',
      template: '<a data-on-click="showPopup" class="button"><i class="ti ti-brand-git"></i></a>',
    })
    setTimeout(() => {
      setPluginStyle(COMMON_STYLE + SHOW_POPUP_STYLE)
      logseq.provideUI({
        key: 'git',
        path: '#injected-ui-item-git-logseq-plugin-git',
        template: `
          <div class="plugin-git-popup flex flex-col">
            <button data-on-click="check" class="text-sm bg-green-600">Check Status</button>
            <button data-on-click="push" class="text-sm bg-green-600">Push</button>
          </div>
        `,
      })
    }, 1000)

    logseq.App.onRouteChanged(async () => {
      checkStatus()
    })


  })
}

function renderApp(env: string) {
  ReactDOM.render(
    <React.StrictMode>
      <App env={env} />
    </React.StrictMode>,
    document.getElementById('root')
  )
}
