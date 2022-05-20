import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BUTTONS, COMMON_STYLE, LOADING_STYLE, SETTINGS_SCHEMA, SHOW_POPUP_STYLE } from './helper/constants'
import { commit, log, push, status } from './helper/git'
import { checkStatus, debounce, getPluginStyle, hidePopup, setPluginStyle, showPopup } from './helper/util'
import './index.css'

const isDevelopment = import.meta.env.DEV

if (isDevelopment) {
  renderApp('browser')
} else {
  console.log('=== logseq-plugin-git loaded ===')
  logseq.ready(() => {

    checkStatus()

    logseq.provideModel({
      check: debounce(async function() {
        console.log('[faiz:] === check click')
        const status = await checkStatus()
        if (status?.stdout === '') {
          logseq.App.showMsg('No changes detected.')
        } else {
          logseq.App.showMsg('Changes detected:\n' + status.stdout, 'error')
        }
        hidePopup()
      }),
      commit: debounce(async function () {
        hidePopup()
        console.log('Committing...')
        await commit(`[logseq-plugin-git:commit] ${new Date().toISOString()}`)
      }),
      push: debounce(async function () {
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        console.log('Pushing...')
        await push()
        console.log('Checking status...')
        checkStatus()
        logseq.App.showMsg('Pushed Successfully!')
      }),
      commitAndPush: debounce(async function () {
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        console.log('Committing...')
        await commit(`[logseq-plugin-git:commit] ${new Date().toISOString()}`)
        console.log('Pushing...')
        await push()
        console.log('Checking status...')
        checkStatus()
        logseq.App.showMsg('Pushed Successfully!')
      }),
      log: debounce(async function() {
        console.log('[faiz:] === log click')
        const res = await log()
        logseq.App.showMsg(res?.stdout, 'error')
        // logseq.App.showMsg(res?.stdout)
        hidePopup()
      }),
      showPopup: debounce(async function() {
        console.log('[faiz:] === showPopup click')
        showPopup()
      }),
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'git',
      template: '<a data-on-click="showPopup" class="button"><i class="ti ti-brand-git"></i></a><div id="plugin-git-content-wrapper"></div>',
    })
    logseq.useSettingsSchema(SETTINGS_SCHEMA)
    setTimeout(() => {
      // setPluginStyle(COMMON_STYLE + SHOW_POPUP_STYLE)
      const buttons = (logseq.settings?.buttons as string[])?.map(title => BUTTONS.find(b => b.title === title))
      console.log('[faiz:] === buttons', buttons, logseq.settings?.buttons)
      if (buttons?.length) {
        logseq.provideUI({
          key: 'git-popup',
          path: '#plugin-git-content-wrapper',
          template: `
            <div class="plugin-git-popup flex flex-col">
              ${buttons.map(button => '<button data-on-click="' + button?.event + '" class="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm p-1 m-1">' + button?.title + '</button>').join('\n')}
            </div>
          `,
        })
      }
    }, 1000)

    logseq.App.onRouteChanged(async () => {
      checkStatus()
    })
    logseq.DB.onChanged(async () => {
      setTimeout(() => {
        checkStatus()
      }, 1000)
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
