import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"

export const COMMON_STYLE = `
#injected-ui-item-git-logseq-plugin-git {
  position: relative;
}
#injected-ui-item-git-logseq-plugin-git #logseq-plugin-git--git #plugin-git-content-wrapper {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--ls-secondary-background-color);
  padding: 10px;
  border-radius: .375rem;
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05);
  box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
  display: none;
}
#injected-ui-item-git-logseq-plugin-git #logseq-plugin-git--git #plugin-git-content-wrapper::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 10px 8px 10px;
  border-color: transparent transparent var(--ls-secondary-background-color) transparent;
}
`

export const SHOW_POPUP_STYLE = `
#injected-ui-item-git-logseq-plugin-git #logseq-plugin-git--git #plugin-git-content-wrapper {
  display: block;
}
`
export const HIDE_POPUP_STYLE = `
#injected-ui-item-git-logseq-plugin-git #logseq-plugin-git--git #plugin-git-content-wrapper {
  display: none;
}
`

export const INACTIVE_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-plugin-git::after {
  display: none;
}
`
export const ACTIVE_STYLE = `
${COMMON_STYLE}
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

export const LOADING_STYLE = `
${COMMON_STYLE}
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
  animation: blink 1s linear infinite;
}
@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
`

export const BUTTONS = [
  { key: 'status', title: 'Check Status', event: 'check' },
  { key: 'log', title: 'Show Log', event: 'log' },
  { key: 'commit', title: 'Commit', event: 'commit' },
  { key: 'push', title: 'Push', event: 'push' },
  { key: 'commitAndPush', title: 'Commit & Push', event: 'commitAndPush' },
]

export const SETTINGS_SCHEMA: SettingSchemaDesc[] = [
  {
    key: 'buttons',
    title: 'Buttons',
    type: 'enum',
    default: ['Check Status', 'Show Log', 'Commit & Push'],
    description: 'Select buttons to show',
    enumPicker: 'checkbox',
    enumChoices: BUTTONS.map(({ title }) => title),
  }
]