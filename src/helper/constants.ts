export const INACTIVE_STYLE = `
#injected-ui-item-git-logseq-plugin-git::after {
  display: none;
}
`
export const ACTIVE_STYLE = `
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

export const LOADING_STYLE = `
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
  background-color: #ffee6f;
  right: 8px;
  top: 6px;
}
`