import { ACTIVE_STYLE, GIT_STATUS, INACTIVE_STYLE } from "./constants";
import { debounce, logDebug, logWarn } from "./util";

let gitStatus = 0;
let loadingCount = 0;
let popupLeft = 0;
let popupTop = 0;

const COMMON_STYLE = `
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

const DISABLED_STYLE = `
#injected-ui-item-git-logseq-git::after {
  display: none;
}
#injected-ui-item-git-logseq-git .ti-brand-git:before {
  color: var(--color-level-4);
}`;

const REMOTE_OK_STYLE = `#injected-ui-item-git-logseq-git::before {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: var(--ls-color-file-sync-idle);
  left: 4px;
  top: 6px;
}`;
const REMOTE_CHANGED_OR_ERROR_STYLE = `#injected-ui-item-git-logseq-git::before {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: var(--ls-color-file-sync-pending);
  left: 4px;
  top: 6px;
}`;

const LOCAL_OK_STYLE = `#injected-ui-item-git-logseq-git::after {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: var(--ls-color-file-sync-idle);
  right: 4px;
  top: 6px;
}
`;
const LOCAL_CHANGED_OR_ERROR_STYLE = `
#injected-ui-item-git-logseq-git::after {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: var(--ls-color-file-sync-pending);
  right: 4px;
  top: 6px;
}
`;

export const SHOW_POPUP_STYLE = () => `
.plugin-git-container {
  display: block;
}
.plugin-git-popup{
  left:${popupLeft}px;
  top:${popupTop}px;
}
`;

export const LOADING_STYLE = `
#injected-ui-item-git-logseq-git .ti-brand-git:before {
  animation: blinker 1s linear infinite;
}
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
`;

export const setGitStateChange = (statusChange: GIT_STATUS) => {
  switch (statusChange) {
    case GIT_STATUS.Disabled:
      gitStatus = 0;
      break;
    case GIT_STATUS.LocalInUse:
    case GIT_STATUS.RemoteInUse:
      gitStatus = gitStatus | statusChange;
      break;
    case GIT_STATUS.LocalChanges:
      gitStatus = gitStatus | (statusChange & ~GIT_STATUS.LocalError);
      break;
    case GIT_STATUS.LocalOk:
      gitStatus = gitStatus & ~GIT_STATUS.LocalChanges & ~GIT_STATUS.LocalError;
      break;
    case GIT_STATUS.LocalError:
      gitStatus = gitStatus | (statusChange & ~GIT_STATUS.LocalChanges);
      break;
    case GIT_STATUS.RemoteChanges:
      gitStatus = gitStatus | (statusChange & ~GIT_STATUS.RemoteError);
      break;
    case GIT_STATUS.RemoteOk:
      gitStatus =
        gitStatus & ~GIT_STATUS.RemoteChanges & ~GIT_STATUS.RemoteError;
      break;
    case GIT_STATUS.RemoteError:
      gitStatus = gitStatus | (statusChange & ~GIT_STATUS.RemoteChanges);
      break;
  }

  logDebug("setGitStateChange =", GIT_STATUS[statusChange], gitStatus);
  setStatusToStyle();
};

const setStatusToStyle = () => {
  if ((gitStatus & GIT_STATUS.LocalInUse) === 0) {
    _setPluginStyle(DISABLED_STYLE);
    return;
  }

  let localStyle = LOCAL_OK_STYLE;
  if (
    gitStatus & GIT_STATUS.LocalChanges ||
    gitStatus & GIT_STATUS.LocalError
  ) {
    // TODO add style for error state
    localStyle = LOCAL_CHANGED_OR_ERROR_STYLE;
  }

  let remoteStyle = "";
  if (gitStatus & GIT_STATUS.RemoteInUse) {
    if (
      gitStatus & GIT_STATUS.RemoteChanges ||
      gitStatus & GIT_STATUS.RemoteError
    ) {
      // TODO add style for error state
      remoteStyle = REMOTE_CHANGED_OR_ERROR_STYLE;
    } else {
      remoteStyle = REMOTE_OK_STYLE;
    }
  }

  _setPluginStyle(`${localStyle}\n${remoteStyle}`);
};

export const _setPluginStyle = (style: string) => {
  const addStyle: string[] = [];

  if (gitStatus & GIT_STATUS.MenuOpen) {
    addStyle.push(SHOW_POPUP_STYLE());
  }

  if (gitStatus & GIT_STATUS.Loading) {
    addStyle.push(LOADING_STYLE);
  }

  logseq.provideStyle({
    key: "git",
    style: `${COMMON_STYLE}\n${style}\n${addStyle.join("\n")}`
  });
};

const loadingStart = () => {
  loadingCount += 1;
  if (loadingCount === 1) {
    logDebug("loading = START");
    gitStatus = gitStatus | GIT_STATUS.Loading;
    setStatusToStyle();
  }
};

const loadingEnd = () => {
  loadingCount -= 1;
  if (loadingCount === 0) {
    logDebug("loading = END");
    gitStatus = gitStatus & ~GIT_STATUS.Loading;
    setStatusToStyle();
  }
};
export const loadingEffect = async fn => {
  let ret;
  loadingStart();
  try {
    ret = await fn();
  } finally {
    loadingEnd();
  }
  return ret;
};

export const showPopup = () => {
  logDebug("showPopup");
  logseq.UI.queryElementRect("#logseq-git--git").then(triggerIconRect => {
    // logDebug("triggerIconRect", triggerIconRect);
    if (!triggerIconRect) return;
    const popupWidth = 120 + 10 * 2;
    popupLeft =
      triggerIconRect.left + triggerIconRect.width / 2 - popupWidth / 2;
    popupTop = triggerIconRect.top + triggerIconRect.height;
    gitStatus = gitStatus | GIT_STATUS.MenuOpen;
    setStatusToStyle();
  });
};
export const hidePopup = () => {
  logDebug("hidePopup");
  gitStatus = gitStatus & ~GIT_STATUS.MenuOpen;
  setStatusToStyle();
};
