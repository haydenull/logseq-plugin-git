import { debounce, logDebug, logInfo, logWarn } from "./util";
import {
  Button,
  BUTTONS,
  GIT_STATUS,
  SETTING_GRAPH_GIT_ENABLED
} from "./constants";
import {
  checkout,
  commit,
  execGitCommand,
  getGitConfigurations,
  inProgress,
  log,
  pull,
  pullRebase,
  push,
  status,
  sync
} from "./git";
import {
  SimpleCommandCallback,
  SimpleCommandKeybinding
} from "@logseq/libs/dist/LSPlugin";
import {
  loadingEffect,
  setGitStateChange,
  hidePopup,
  showPopup
} from "./styles";

let routeChangedHandler;
let initializing;
let registerCommandCount = 0;
let gitConfiguration;

export function isEnabledInThisWindow() {
  return !!routeChangedHandler;
}

export const checkStatus = async () => {
  logInfo("checkStatus...");
  return loadingEffect(async () => {
    const statusRes = await status(false);
    // sleep for 10 seconds to test slow operation
    // await new Promise(resolve => setTimeout(resolve, 10000));

    const graph = await logseq.App.getCurrentGraph();
    if (graph?.path !== statusRes?.graphPath) {
      logWarn(
        "graph path changed, status is not actual",
        graph?.path,
        statusRes?.graphPath
      );
      return;
    }

    if (!statusRes?.isOk) {
      setGitStateChange(GIT_STATUS.LocalError);
    } else if (statusRes?.stdout === "") {
      logDebug("No changes", statusRes);
      setGitStateChange(GIT_STATUS.LocalOk);
    } else {
      logDebug("Need save", statusRes);
      setGitStateChange(GIT_STATUS.LocalChanges);
    }
    return statusRes;
  });
};

export const isRepoUpTodate = async () => {
  // TODO needs better error handling
  logDebug("git fetch");
  const res = await execGitCommand(["fetch"]);
  logDebug("git fetch =", res);
  if (!res.isOk) {
    return undefined;
  }

  const local = await execGitCommand(["rev-parse", "HEAD"]);
  const remote = await execGitCommand(["rev-parse", "@{u}"]);
  logDebug("local vs. remote after fetch", local.stdout, remote.stdout);

  if (!local.isOk || !remote.isOk) {
    return undefined;
  }

  return local.stdout === remote.stdout;
};

export const checkIsRemoteSynced = async () => {
  logInfo("checkIsSynced...");

  if (inProgress()) {
    logDebug("checkIsSynced Git in progress, skip check");
    return;
  }

  const isSynced = await isRepoUpTodate();

  if (isSynced === undefined) {
    setGitStateChange(GIT_STATUS.RemoteError);
  } else if (isSynced) {
    setGitStateChange(GIT_STATUS.RemoteOk);
  } else {
    setGitStateChange(GIT_STATUS.RemoteChanges);
  }
};

export const checkStatusWithDebounce = debounce(async (perform = true) => {
  if (perform) {
    if (isEnabledInThisWindow()) {
      logDebug("checkStatusWithDebounce = START");
      await loadingEffect(async () => {
        const waitFor = [checkStatus()];
        if (gitConfiguration.hasRemote) {
          // TODO this should be reworked
          waitFor.push(checkIsRemoteSynced());
        }
        await Promise.all(waitFor);
      });
      logDebug("checkStatusWithDebounce = END");
    }
  } else {
    logDebug("clear checkStatusWithDebounce");
  }
}, 2000);

export const operations = {
  enable: debounce(async function () {
    logInfo("user asked to enable git operations on this graph");
    hidePopup();
    await logseq.App.getCurrentGraph();
    await logseq.App.setCurrentGraphConfigs({
      [SETTING_GRAPH_GIT_ENABLED]: true
    });
    await initPluginBasedOnRepoState(true);
  }),
  disable: debounce(async function () {
    logInfo("user asked to disable git operations on this graph");
    hidePopup();
    await logseq.App.getCurrentGraph();
    await logseq.App.setCurrentGraphConfigs({
      [SETTING_GRAPH_GIT_ENABLED]: false
    });
    await initPluginBasedOnRepoState(false);
  }),
  check: debounce(async function () {
    hidePopup();
    await loadingEffect(async () => {
      const status = await checkStatus();
      if (status?.stdout === "") {
        logseq.UI.showMsg("No changes detected.");
      } else {
        logseq.UI.showMsg("Changes detected:\n" + status?.stdout, "success", {
          timeout: 0
        });
      }
    });
  }),
  pull: debounce(async function () {
    console.log("[faiz:] === pull click");
    hidePopup();
    await loadingEffect(async () => {
      await pull(false);
      await checkStatus();
    });
  }),
  pullRebase: debounce(async function () {
    console.log("[faiz:] === pullRebase click");
    hidePopup();
    await loadingEffect(async () => {
      await pullRebase();
      await checkStatus();
    });
  }),
  checkout: debounce(async function () {
    console.log("[faiz:] === checkout click");
    hidePopup();
    await loadingEffect(async () => {
      await checkout();
    });
  }),
  commit: debounce(async function () {
    hidePopup();
    await loadingEffect(async () => {
      await commit();
      await checkStatus();
    });
  }),
  push: debounce(async function () {
    hidePopup();
    await loadingEffect(async () => {
      await push();
      await checkStatus();
    });
  }),
  commitAndPush: debounce(async function () {
    hidePopup();
    await loadingEffect(async () => {
      const status = await checkStatus();
      const changed = status?.stdout !== "";
      if (changed) {
        const res = await commit(
          `[logseq-plugin-git:commit] ${new Date().toISOString()}`
        );
        if (res.exitCode === 0) await push(true);
      }
      await checkStatus();
    });
  }),
  sync: debounce(async function () {
    hidePopup();
    await loadingEffect(async () => {
      await sync();
      // TODO this should be reworked and remote git check should be enforced because it is relevant
      await checkStatusWithDebounce();
    });
  }),
  log: debounce(async function () {
    console.log("[faiz:] === log click");
    hidePopup();
    const res = await log(false);
    logseq.UI.showMsg(res?.stdout, "success", { timeout: 0 });
  }),
  showPopup: debounce(async function () {
    console.log("[faiz:] === showPopup click");
    showPopup();
  }),
  hidePopup: debounce(function () {
    console.log("[faiz:] === hidePopup click");
    hidePopup();
  })
};

const commands: {
  opts: {
    key: string;
    label: string;
    keybinding?: SimpleCommandKeybinding;
  };
  action: SimpleCommandCallback;
}[] = [
  {
    opts: {
      key: "logseq-plugin-git:sync",
      label: "Git Synchronization",
      keybinding: {
        binding: "mod+s",
        mode: "global"
      }
    },
    action: () => {
      if (routeChangedHandler) {
        // git operations are enabled
        operations.sync();
      }
    }
  },
  {
    opts: {
      key: "logseq-plugin-git:commit",
      label: "Git Commit",
      keybinding: {
        binding: "mod+alt+s",
        mode: "global"
      }
    },
    action: () => {
      if (routeChangedHandler) {
        // git operations are enabled
        operations.commit();
      }
    }
  }
];

/**
 * Actions activated with Mod+Shift+P
 * @param enable
 */
function registerCommandPalette(enable: boolean) {
  if (enable) {
    logDebug("registering command palette", registerCommandCount);
    if (registerCommandCount === 0) {
      // TODO register only once because without unregister this creates problem when other graph is loaded
      for (const { action, opts } of commands) {
        logseq.App.registerCommandPalette(opts, action);
      }
    }
    registerCommandCount += 1;
  } else {
    logDebug("un-registering command palette");
    for (const command of commands) {
      // :logseq-problem un-registering command palette - https://github.com/logseq/plugins/issues/12
      // logseq.App.unregisterCommandPalette(command.opts.key);
    }
  }
}

function addMenuButtons(buttons) {
  if (top && buttons?.length) {
    logDebug("adding menu buttons", buttons.length);
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `
          <div class="plugin-git-container">
            <div class="plugin-git-mask"></div>
            <div class="plugin-git-popup flex flex-col">
              ${buttons
                .map(
                  button =>
                    `<button class="ui__button plugin-git-${button?.key} bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm p-1" style="margin: 4px 0; color: #fff;">${button?.title}</button>`
                )
                .join("\n")}
          </div>
          `,
      "text/html"
    );

    // remove .plugin-git-container if exists
    const container = top?.document?.querySelector(".plugin-git-container");
    if (container) {
      logDebug("existing menu container will be replaced");
      top?.document?.body.removeChild(container);
    } else {
      logDebug("first menu container");
    }
    top?.document?.body.appendChild(doc.body.childNodes?.[0]?.cloneNode(true));
    top?.document
      ?.querySelector(".plugin-git-mask")
      ?.addEventListener("click", hidePopup);
    buttons.forEach(button => {
      top?.document
        ?.querySelector(`.plugin-git-${button?.key}`)
        ?.addEventListener("click", operations?.[button!?.event]);
    });
  }
}

async function initPluginBasedOnRepoState(
  forceGitEnabled: boolean | undefined = undefined
) {
  let buttons: Button[];

  // cancel pending operation (onRouteChanged is fired before onCurrentGraphChanged)
  checkStatusWithDebounce(false);

  if (routeChangedHandler) {
    // we need to unregister this event
    logDebug("un-registering routeChangedHandler");
    routeChangedHandler();
    routeChangedHandler = undefined;
  }
  setGitStateChange(GIT_STATUS.Disabled);
  gitConfiguration = await getGitConfigurations(forceGitEnabled);
  if (gitConfiguration.enabled) {
    logInfo("enabling git operations on this graph");
    setGitStateChange(GIT_STATUS.LocalInUse);
    if (gitConfiguration.hasRemote) {
      setGitStateChange(GIT_STATUS.RemoteInUse);
    }
    buttons = (logseq.settings?.buttons as string[])
      ?.map(title => BUTTONS.find(b => b.title === title))
      .filter(Boolean) as Button[];
    buttons = [
      ...buttons,
      { key: "disable", title: "Disable Git actions", event: "disable" }
    ];
    addMenuButtons(buttons);
    registerCommandPalette(true);

    // at this point we doesn't have information about repo state
    setGitStateChange(GIT_STATUS.Unknown);
    loadingEffect(async () => {
      await checkStatusWithDebounce();
    });

    logDebug("registering routeChangedHandler");
    routeChangedHandler = logseq.App.onRouteChanged(async () => {
      logDebug("event onRouteChanged");
      checkStatusWithDebounce();
    });
  } else {
    // plugin was not enabled so we provide only enable action
    logInfo("not enabled on this graph");
    setGitStateChange(GIT_STATUS.Disabled);
    buttons = [
      { key: "enable", title: "Enable Git actions", event: "enable" }
      // { key: "log", title: "Show Log", event: "log" }
    ];
    addMenuButtons(buttons);

    registerCommandPalette(false);
  }
}

/**
 * We need to ensure that all operations are done in right order and not overlapping.
 * @param forceGitEnabled
 */
export function reinitPluginBasedOnRepoState(
  forceGitEnabled: boolean | undefined = undefined
) {
  let currentInit = Promise.resolve();
  if (initializing) {
    logDebug("there is other init in progress, waiting for it to finish");
    currentInit = initializing;
    initializing = undefined;
  }

  initializing = new Promise(resolve => {
    currentInit.then(() => {
      initPluginBasedOnRepoState(forceGitEnabled).then(() => {
        initializing = undefined;
        resolve(true);
      });
    });
  });
}
