import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const COMMON_STYLE = `
.ui-items-container[data-type=toolbar] > .list-wrap {
  overflow: visible;
}
#injected-ui-item-git-logseq-git {
  position: relative;
}
.plugin-git-container {
  display: none;
}
.plugin-git-container .plugin-git-mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 99;
}
.plugin-git-container .plugin-git-popup {
  position: fixed;
  z-index: 99;
  background-color: var(--ls-secondary-background-color);
  padding: 10px;
  border-radius: .375rem;
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05);
  box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
}
.plugin-git-container .plugin-git-popup::before {
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
`;

export const SHOW_POPUP_STYLE = `
.plugin-git-container {
  display: block;
}
`;
export const HIDE_POPUP_STYLE = `
.plugin-git-container {
  display: none;
}
`;

export const INACTIVE_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-git::after {
  display: none;
}
`;
export const ACTIVE_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-git::after {
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
`;

export const LOADING_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-git::after {
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
`;

export const BUTTONS = [
  { key: "status", title: "Check Status", event: "check" },
  { key: "log", title: "Show Log", event: "log" },
  { key: "pull", title: "Pull", event: "pull" },
  { key: "pullRebase", title: "Pull Rebase", event: "pullRebase" },
  { key: "checkout", title: "Checkout", event: "checkout" },
  { key: "commit", title: "Commit", event: "commit" },
  { key: "push", title: "Push", event: "push" },
  { key: "commitAndPush", title: "Commit & Push", event: "commitAndPush" },
];

export const SETTINGS_SCHEMA: SettingSchemaDesc[] = [
  {
    key: "buttons",
    title: "Buttons",
    type: "enum",
    default: ["Check Status", "Show Log", "Pull Rebase", "Commit & Push"],
    description: "Select buttons to show",
    enumPicker: "checkbox",
    enumChoices: BUTTONS.map(({ title }) => title),
  },
  {
    key: "checkWhenDBChanged",
    title: "Check Status when DB Changed",
    type: "boolean",
    default: true,
    description: "Check status when DB changed, restart logseq to take effect",
  },
  {
    key: "autoCheckSynced",
    title: "Auto Check If Synced",
    type: "boolean",
    default: false,
    description:
      "Automatically check if the local version is the same as the remote",
  },
  {
    key: "autoPush",
    title: "Auto Push",
    type: "boolean",
    default: false,
    description: "Auto push when logseq hide",
  },
];
