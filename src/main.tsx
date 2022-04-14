import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { commit, push, status } from './helper/git'
import { checkStatus } from './helper/util'
import './index.css'

const isDevelopment = import.meta.env.DEV

if (isDevelopment) {
  renderApp('browser')
} else {
  console.log('=== logseq-plugin-git loaded ===')
  logseq.ready(() => {

    logseq.provideModel({
      async push() {
        // renderApp('logseq')
        // logseq.showMainUI()
        const icon = await logseq.App.queryElementById(`injected-ui-item-git-logseq-plugin-git`)
        console.log('[faiz:] === icon', icon, typeof icon)
          // .then((el: HTMLElement) => {
          //   el.classList.add('git-active')
          // })
        // logseq.provideStyle({
        //   key: 'git',
        //   // add an indicator to the menu
        //   style: ACTIVE_STYLE,
        // })
        await commit(`[logseq-plugin-git:push] ${new Date().toISOString()}`)
        await push()
      },
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'git',
      template: '<a data-on-click="push" class="button"><i class="ti ti-brand-git"></i></a>',
    })

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
