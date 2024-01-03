import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { GIT_STATUS, SETTINGS_SCHEMA } from "./helper/constants";
import { logDebug, logInfo } from "./helper/util";
import {
  checkStatusWithDebounce,
  operations,
  reinitPluginBasedOnRepoState
} from "./helper/actions";
import "./index.css";
import { setGitStateChange } from "./helper/styles";

// TODO: patch logseq Git command for the temporary fix solution
// https://github.com/haydenull/logseq-plugin-git/issues/48
try {
  // @ts-ignore
  top.logseq.sdk.git.exec_command(["status"]);
} catch (e) {
  // @ts-ignore
  logseq.Git["execCommand"] = async function (args: string[]) {
    const ret = await logseq.App.execGitCommand(args);
    return { exitCode: ret == undefined ? 1 : 0, stdout: ret };
  };
}

const isDevelopment = import.meta.env.DEV;

if (isDevelopment) {
  renderApp("browser");
} else {
  logInfo("=== loaded ===");
  logseq.ready(() => {
    logseq.provideModel(operations);

    // add toolbar button
    logseq.App.registerUIItem("toolbar", {
      key: "git",
      template:
        '<a data-on-click="showPopup" class="button"><i class="ti ti-brand-git"></i></a><div id="plugin-git-content-wrapper"></div>'
    });

    logseq.useSettingsSchema(SETTINGS_SCHEMA);

    // at this point we doesn't have information about repo state
    setGitStateChange(GIT_STATUS.Unknown);

    reinitPluginBasedOnRepoState();

    logDebug("hooking to onCurrentGraphChanged");
    logseq.App.onCurrentGraphChanged(() => {
      logInfo("onCurrentGraphChanged requires reinit");
      reinitPluginBasedOnRepoState();
    });

    logDebug("hooking to visibilitychange");
    if (top) {
      // TODO should be moved into initPluginBasedOnRepoState
      top?.document?.addEventListener("visibilitychange", async () => {
        const visibilityState = top?.document?.visibilityState;

        logInfo("visibilityState has changed to", visibilityState);
        if (visibilityState === "visible") {
          // if (logseq.settings?.autoCheckSynced) checkIsSynced();
          checkStatusWithDebounce();
        } else if (visibilityState === "hidden") {
          // logseq.UI.showMsg(`Page is hidden: ${new Date()}`, 'success', { timeout: 0 })
          // noChange void
          // changed commit push
          if (logseq.settings?.autoPush) {
            logInfo("autoPush is enabled, saving...");
            operations.sync();
          }
        }
      });
    }
    /*
    if (logseq.settings?.checkWhenDBChanged) {
      console.log("[k2s:] === will check state when DB was changed");
      logseq.DB.onChanged(({ blocks, txData, txMeta }) => {
        console.log("[k2s:] === DB.onChanged", txData);
        // checkStatusWithDebounce();
      });
    }
*/
    /*
    if (logseq.settings?.autoCheckSynced) {
      logInfo("[k2s:] === first checkIsSynced");
      checkIsSynced();
    }

     */
    // checkStatusWithDebounce();
  });
}

function renderApp(env: string) {
  ReactDOM.render(
    <React.StrictMode>
      <App env={env} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}
