import {
  ACTIVE_STYLE,
  HIDE_POPUP_STYLE,
  INACTIVE_STYLE,
  SHOW_POPUP_STYLE,
} from "./constants";
import { status, inProgress, execGitCommand } from "./git";

export const checkStatus = async () => {
  console.log("Checking status...");
  const statusRes = await status(false);
  if (statusRes?.stdout === "") {
    console.log("No changes", statusRes);
    setPluginStyle(INACTIVE_STYLE);
  } else {
    console.log("Need save", statusRes);
    setPluginStyle(ACTIVE_STYLE);
  }
  return statusRes;
};

let pluginStyle = "";
export const setPluginStyle = (style: string) => {
  pluginStyle = style;
  logseq.provideStyle({ key: "git", style });
};
export const getPluginStyle = () => pluginStyle;

export const showPopup = () => {
  const _style = getPluginStyle();
  logseq.UI.queryElementRect("#logseq-git--git").then((triggerIconRect) => {
    console.log("[faiz:] === triggerIconRect", triggerIconRect);
    if (!triggerIconRect) return;
    const popupWidth = 120 + 10 * 2;
    const left =
      triggerIconRect.left + triggerIconRect.width / 2 - popupWidth / 2;
    const top = triggerIconRect.top + triggerIconRect.height;
    const _style = getPluginStyle();
    setPluginStyle(
      `${_style}\n.plugin-git-popup{left:${left}px;top:${top}px;}`
    );
  });
  setPluginStyle(`${_style}\n${SHOW_POPUP_STYLE}`);
};
export const hidePopup = () => {
  const _style = getPluginStyle();
  setPluginStyle(`${_style}\n${HIDE_POPUP_STYLE}`);
};

export const debounce = (fn, wait: number = 100, environment?: any) => {
  let timer = null;
  return function () {
    // @ts-ignore
    const context = environment || this;
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // @ts-ignore
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, wait);
  };
};

export const checkStatusWithDebounce = debounce(() => {
  checkStatus();
}, 2000);

export const isRepoUpTodate = async () => {
  await execGitCommand(["fetch"]);
  const local = await execGitCommand(["rev-parse", "HEAD"]);
  const remote = await execGitCommand(["rev-parse", "@{u}"]);
  logseq.UI.showMsg(`${local.stdout} === ${remote.stdout}`, "success", { timeout: 30 });
  return local.stdout === remote.stdout;
};

export const checkIsSynced = async () => {
  if (inProgress()) {
    console.log("[faiz:] === checkIsSynced Git in progress, skip check");
    return
  }

  const isSynced = await isRepoUpTodate();
  if (!isSynced)
    logseq.UI.showMsg(
      `The current repository is not synchronized with the remote repository, please check.`,
      "warning",
      { timeout: 0 }
    );
};
