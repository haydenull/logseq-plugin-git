// https://logseq.github.io/plugins/interfaces/IAppProxy.html#execGitCommand
import type { IGitResult } from "@logseq/libs/dist/LSPlugin.user"

let _inProgress: Promise<IGitResult> | undefined = undefined

export const execGitCommand = async (args: string[]) : Promise<IGitResult> => {
  if (_inProgress) await _inProgress

  let res
  try {
    const currentGitFolder = (await logseq.App.getCurrentGraph())?.path
    const runArgs = currentGitFolder ? ['-C', currentGitFolder, ...args] : args
    _inProgress = logseq.Git.execCommand(runArgs)
    res = await _inProgress
  } finally {
    _inProgress = undefined
  }
    return res
}

export const inProgress = () => _inProgress

export const status = async (showRes = true): Promise<IGitResult> => {
  // git status --porcelain | awk '{print $2}'
  // git status --porcelain | wc -l
  const res =  await execGitCommand(['status', '--porcelain'])
  console.log('[faiz:] === git status', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git status success')
    } else {
      logseq.UI.showMsg(`Git status failed\n${res.stderr}`, 'error')
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
  return res
}

// log with git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
export const log = async (showRes = true): Promise<IGitResult> => {
  // git log --pretty=format:"%h %s" -n 1
  // git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
  // return await logseq.App.execGitCommand(['log', '--pretty=format:"%h %s"'])
  const res = await execGitCommand(['log', '--pretty=format:"%h %ad | %s [%an]"', '--date=format:"%Y-%m-%d %H:%M:%S"', '--name-status'])
  console.log('[faiz:] === git log', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git log success')
    } else {
      logseq.UI.showMsg(`Git log failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git pull
export const pull = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(['pull'])
  console.log('[faiz:] === git pull', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git pull success')
    } else {
      logseq.UI.showMsg(`Git pull failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git pull --rebase
export const pullRebase = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(['pull', '--rebase'])
  console.log('[faiz:] === git pull --rebase', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git pull --rebase success')
    } else {
      logseq.UI.showMsg(`Git pull --rebase failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git checkout .
export const checkout = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(['checkout', '.'])
  console.log('[faiz:] === git checkout .', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git checkout success')
    } else {
      logseq.UI.showMsg(`Git checkout failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git commit
export const commit = async (showRes = true, message: string): Promise<IGitResult> => {
  await execGitCommand(['add', '.'])
  // git commit -m "message"
  const res = await execGitCommand(['commit', '-m', message])
  console.log('[faiz:] === git commit', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git commit success')
    } else {
      logseq.UI.showMsg(`Git commit failed\n${res.stdout || res.stderr}`, 'error')
    }
  }
  return res
}

// push
export const push = async (showRes = true): Promise<IGitResult> => {
  // git push
  const res = await execGitCommand(['push'])
  console.log('[faiz:] === git push', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git push success')
    } else {
      logseq.UI.showMsg(`Git push failed\n${res.stderr}`, 'error')
    }
  }
  return res
}
