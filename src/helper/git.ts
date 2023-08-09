// https://logseq.github.io/plugins/interfaces/IAppProxy.html#execGitCommand
import type { IGitResult } from "@logseq/libs/dist/LSPlugin.user";
import { logDebug } from "./util";
import { SETTING_GRAPH_GIT_ENABLED } from "./constants";

let _inProgress: Promise<IGitResult> | undefined = undefined;

type GitConfig = {
  enabled: boolean;
  hasRemote: boolean;
};

/**
 *
 * @param forceGitEnabled this would not be needed if change in graph config would be reflected corrctly :logseq-problem
 */
export const getGitConfigurations = async (
  forceGitEnabled: boolean | undefined
) => {
  let hasRemote = false;
  let enabled = forceGitEnabled || false;

  // this is important, otherwise getCurrentGraphConfigs() will not return correct value :logseq-problem
  const graph = await logseq.App.getCurrentGraph();
  logDebug("working with current graph", graph?.name, graph?.path);

  if (forceGitEnabled === undefined) {
    enabled = await logseq.App.getCurrentGraphConfigs(
      SETTING_GRAPH_GIT_ENABLED
    );
  }

  if (enabled) {
    // lets find out about remote
    const res = await execGitCommand(["remote"]);
    hasRemote = res?.stdout?.trim().length > 0;
  }

  return {
    enabled,
    hasRemote
  };
};

export type IGitResultExtended = IGitResult & {
  graphPath: string;
  isOk: boolean;
};

export const execGitCommand = async (
  args: string[]
): Promise<IGitResultExtended> => {
  if (_inProgress) await _inProgress;

  let res;
  try {
    const currentGitFolder = (await logseq.App.getCurrentGraph())?.path;
    const runArgs = currentGitFolder ? ["-C", currentGitFolder, ...args] : args;
    // the graph may switch in time of execution, so we need to remember on what graph was git command executed
    _inProgress = logseq.Git.execCommand(runArgs).then(gitResult => ({
      ...gitResult,
      graphPath: currentGitFolder,
      isOk: gitResult.exitCode === 0
    }));
    res = await _inProgress;
  } finally {
    _inProgress = undefined;
  }
  return res;
};

export const inProgress = () => _inProgress;

export const status = async (showRes = true): Promise<IGitResultExtended> => {
  // git status --porcelain | awk '{print $2}'
  // git status --porcelain | wc -l
  const res = await execGitCommand(["status", "--porcelain"]);
  console.log("[faiz:] === git status", res);
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg("Git status success");
    } else {
      logseq.UI.showMsg(`Git status failed\n${res.stderr}`, "error");
    }
  }
  /**
   * res
   * modify
   * {
   *  exitCode: 0,
   *  stderr: '',
   *  stdout: 'M foo.md\n?? bar.md\n',
   * }
   * ahead & uptodate & behind
   * {
   * exitCode: 0,
   * stderr: '',
   * stdout: '',
   * }
   */
  // changed files    staged files
  return res;
};

// log with git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
export const log = async (showRes = true): Promise<IGitResult> => {
  // git log --pretty=format:"%h %s" -n 1
  // git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
  // return await logseq.App.execGitCommand(['log', '--pretty=format:"%h %s"'])
  const res = await execGitCommand([
    "log",
    '--pretty=format:"%h %ad | %s [%an]"',
    '--date=format:"%Y-%m-%d %H:%M:%S"',
    "--name-status"
  ]);
  console.log("[faiz:] === git log", res);
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg("Git log success");
    } else {
      logseq.UI.showMsg(`Git log failed\n${res.stderr}`, "error");
    }
  }
  return res;
};

// git pull
export const pull = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(["pull"]);
  console.log("[faiz:] === git pull", res);
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg("Git pull success");
    } else {
      logseq.UI.showMsg(`Git pull failed\n${res.stderr}`, "error");
    }
  }
  return res;
};

// git pull --rebase
export const pullRebase = async (
  showRes = true
): Promise<IGitResultExtended> => {
  logDebug("git pull --rebase");
  const res = await execGitCommand(["pull", "--rebase"]);
  logDebug("git pull =", res);
  if (!res.isOk) {
    if (
      (res.stdout || res.stderr).includes(
        "There is no tracking information for the current branch."
      )
    ) {
      res.isOk = true;
    } else {
      logseq.UI.showMsg(
        `Git pull --rebase failed\n${res.stdout || res.stderr}`,
        "error"
      );
    }
  }
  return res;
};

// git checkout .
export const checkout = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(["checkout", "."]);
  console.log("[faiz:] === git checkout .", res);
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg("Git checkout success");
    } else {
      logseq.UI.showMsg(`Git checkout failed\n${res.stderr}`, "error");
    }
  }
  return res;
};

// git commit
export const commit = async (showRes = true): Promise<IGitResultExtended> => {
  logDebug("git add .");
  await execGitCommand(["add", "."]);

  // // build better commit message
  // const namesRes = await execGitCommand([
  //   "diff",
  //   "--name-only",
  //   "HEAD~1..HEAD"
  // ]);
  // if (!namesRes.isOk) {
  //   return namesRes;
  // }
  // const message = ["-m", namesRes.stdout.split("\n").join(", ")];
  const message = ["--allow-empty-message", "-m", ""];

  logDebug("git commit .");
  const res = await execGitCommand(["commit", ...message]);
  logDebug("git commit =", res);

  if (!res.isOk) {
    if (res.stdout.includes("nothing to commit, working tree clean")) {
      // committing without changes is ok for us
      res.isOk = true;
    } else {
      if (showRes) {
        logseq.UI.showMsg(
          `Git commit failed\n${res.stdout || res.stderr}`,
          "error"
        );
      }
    }
  }

  return res;
};

// push
export const push = async (showRes = true): Promise<IGitResultExtended> => {
  logDebug("git push");
  const res = await execGitCommand(["push"]);
  logDebug("git push =", res);
  if (!res.isOk) {
    if (
      (res.stdout || res.stderr).includes("No configured push destination.")
    ) {
      res.isOk = true;
    } else {
      logseq.UI.showMsg(
        `Git push failed\n${res.stdout || res.stderr}`,
        "error"
      );
    }
  }
  return res;
};

export const sync = async (): Promise<IGitResult> => {
  logDebug("sync");
  // local commit_message=$(git diff --name-only HEAD~1..HEAD)
  let res = await commit();
  if (res.isOk) {
    res = await pullRebase();
    if (
      res.isOk /*&&
      !(res.stdout || res.stderr).includes(
        "There is no tracking information for the current branch."
      )*/
    ) {
      res = await push();
    }

    if (!res.isOk) {
      logseq.UI.showMsg(`Git sync failed.`, "error");
    }
  }

  return res;
};
