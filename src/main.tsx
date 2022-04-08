import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { status } from './helper/git'
import './index.css'

const isDevelopment = import.meta.env.DEV

const INACTIVE_STYLE = `
#injected-ui-item-git-logseq-plugin-git::after {
  display: none;
}
`
const ACTIVE_STYLE = `
#injected-ui-item-git-logseq-plugin-git {
  position: relative;
}
#injected-ui-item-git-logseq-plugin-git::after {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: rgb(237, 66, 69);
  right: 8px;
  top: 6px;
}
`

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
        logseq.provideStyle({
          key: 'git',
          // add an indicator to the menu
          style: ACTIVE_STYLE,
        })
      },
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'git',
      template: '<a data-on-click="push" class="button"><i class="ti ti-brand-git"></i></a>',
    })

    status()

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
