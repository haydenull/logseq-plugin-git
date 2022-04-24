export const COMMON_STYLE = `
#injected-ui-item-git-logseq-plugin-git {
  position: relative;
}
#injected-ui-item-git-logseq-plugin-git #git--logseq-plugin-git {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
}
#injected-ui-item-git-logseq-plugin-git #git--logseq-plugin-git::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 8px 10px 8px;
  border-color: transparent transparent green transparent;
}
`

export const SHOW_POPUP_STYLE = `
#injected-ui-item-git-logseq-plugin-git #git--logseq-plugin-git {
  display: block;
}
`
export const HIDE_POPUP_STYLE = `
#injected-ui-item-git-logseq-plugin-git .plugin-git-popup {
  display: none;
}
`

export const INACTIVE_STYLE = `
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