import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BUTTONS, COMMON_STYLE, LOADING_STYLE, SETTINGS_SCHEMA, SHOW_POPUP_STYLE } from './helper/constants'
import { commit, log, push, status } from './helper/git'
import { checkStatus, getPluginStyle, hidePopup, setPluginStyle, showPopup } from './helper/util'
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
        if (status?.stdout === '') {
          logseq.App.showMsg('No changes detected.')
        } else {
          // logseq.App.showMsg('Changes detected:\n' + status, 'error')
          logseq.App.showMsg('Changes detected:\n' + status.stdout)
        }
        hidePopup()
      },
      async commit() {
        hidePopup()
        console.log('Committing...')
        await commit(`[logseq-plugin-git:commit] ${new Date().toISOString()}`)
      },
      async push() {
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        console.log('Pushing...')
        await push()
        console.log('Checking status...')
        checkStatus()
        logseq.App.showMsg('Pushed Successfully!')
      },
      async commitAndPush() {
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        console.log('Committing...')
        await commit(`[logseq-plugin-git:commit] ${new Date().toISOString()}`)
        console.log('Pushing...')
        await push()
        console.log('Checking status...')
        checkStatus()
        logseq.App.showMsg('Pushed Successfully!')
      },
      async log() {
        const res = await log()
        // logseq.App.showMsg(res?.stdout, 'error')
        logseq.App.showMsg(res?.stdout)
        hidePopup()
      },
      async showPopup() {
        showPopup()
      },
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'git',
      template: '<a data-on-click="showPopup" class="button"><i class="ti ti-brand-git"></i></a>',
    })
    logseq.useSettingsSchema(SETTINGS_SCHEMA)
    setTimeout(() => {
      // setPluginStyle(COMMON_STYLE + SHOW_POPUP_STYLE)
      const buttons = (logseq.settings?.buttons as string[])?.map(title => BUTTONS.find(b => b.title === title))
      console.log('[faiz:] === buttons', buttons, logseq.settings?.buttons)
      if (buttons?.length) {
        logseq.provideUI({
          key: 'git',
          path: '#injected-ui-item-git-logseq-plugin-git',
          template: `
            <div class="plugin-git-popup flex flex-col">
              ${buttons.map(button => '<button data-on-click="' + button?.event + '" class="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm p-1 m-1">' + button?.title + '</button>').join('\n')}
            </div>
          `,
        })
            // <button data-on-click="check" type="button" class="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm p-1 m-1">
            //   Check Status
            // </button>
            // <button data-on-click="log" type="button" class="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm p-1 m-1">
            //   Show Log
            // </button>
            // <button data-on-click="push" type="button" class="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm p-1 m-1">
            //   Commit & Push
            // </button>
      }
    }, 1000)

    logseq.App.onRouteChanged(async () => {
      checkStatus()
    })
    logseq.DB.onChanged(async () => {
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
