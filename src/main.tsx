import '@logseq/libs'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BUTTONS, COMMON_STYLE, LOADING_STYLE, SETTINGS_SCHEMA, SHOW_POPUP_STYLE } from './helper/constants'
import { checkout, commit, log, pull, pullRebase, push, status } from './helper/git'
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
      pull: debounce(async function() {
        console.log('[faiz:] === pull click')
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        await pull(false)
        checkStatus()
      }),
      pullRebase: debounce(async function() {
        console.log('[faiz:] === pullRebase click')
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        await pullRebase()
        checkStatus()
      }),
      checkout: debounce(async function() {
        console.log('[faiz:] === checkout click')
        hidePopup()
        checkout()
      }),
      commit: debounce(async function () {
        hidePopup()
        commit(true, `[logseq-plugin-git:commit] ${new Date().toISOString()}`)
      }),
      push: debounce(async function () {
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        await push()
        checkStatus()
      }),
      commitAndPush: debounce(async function () {
        setPluginStyle(LOADING_STYLE)
        hidePopup()
        await commit(true, `[logseq-plugin-git:commit] ${new Date().toISOString()}`)
        await push(true)
        checkStatus()
      }),
      log: debounce(async function() {
        console.log('[faiz:] === log click')
        const res = await log(false)
        logseq.App.showMsg(res?.stdout, 'error')
        hidePopup()
      }),
      showPopup: debounce(async function() {
        console.log('[faiz:] === showPopup click')
        showPopup()
      }),
      hidePopup: debounce(function() {
        console.log('[faiz:] === hidePopup click')
        hidePopup()
      }),
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'git',
      template: '<a data-on-click="showPopup" class="button"><i class="ti ti-brand-git"></i></a><div id="plugin-git-content-wrapper"></div>',
    })
    logseq.useSettingsSchema(SETTINGS_SCHEMA)
    setTimeout(() => {
      const buttons = (logseq.settings?.buttons as string[])?.map(title => BUTTONS.find(b => b.title === title))
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
    if (logseq.settings?.checkWhenDBChanged) {
      logseq.DB.onChanged(async () => {
        console.log('[faiz:git] === logseq.DB.onChanged')
        setTimeout(() => {
          checkStatus()
        }, 1000)
      })
    }


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
