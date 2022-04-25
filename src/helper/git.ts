// https://logseq.github.io/plugins/interfaces/IAppProxy.html#execGitCommand
import type { IGitResult } from "@logseq/libs/dist/LSPlugin.user"

export const status = async () => {
  // git status --porcelain | awk '{print $2}'
  // git status --porcelain | wc -l
  const res =  await logseq.Git.execCommand(['status', '--porcelain'])
  console.log('[faiz:] === status', res)
  // changed files    staged files
  return res
}

// log with git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
export const log = async (): Promise<IGitResult> => {
  // git log --pretty=format:"%h %s" -n 1
  // git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
  // return await logseq.App.execGitCommand(['log', '--pretty=format:"%h %s"'])
  return await logseq.Git.execCommand(['log', '--pretty=format:"%h %ad | %s [%an]"', '--date=format:"%Y-%m-%d %H:%M:%S"', '--name-status'])
}

// git commit
export const commit = async (message: string): Promise<IGitResult> => {
  await logseq.Git.execCommand(['add', '.'])
  // git commit -m "message"
  return await logseq.Git.execCommand(['commit', '-m', message])
}

// push
export const push = async (): Promise<IGitResult> => {
  // git push
  return await logseq.Git.execCommand(['push'])
}