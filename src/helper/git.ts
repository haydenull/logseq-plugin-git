// https://logseq.github.io/plugins/interfaces/IAppProxy.html#execGitCommand

export const status = async () => {
  // git status --porcelain | awk '{print $2}'
  // git status --porcelain | wc -l
  const res =  await logseq.App.execGitCommand(['status', '--porcelain'])
  console.log('[faiz:] === status', res)
  // changed files    staged files
}

// log with git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
export const log = async (): Promise<string> => {
  // git log --pretty=format:"%h %s" -n 1
  // git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
  // return await logseq.App.execGitCommand(['log', '--pretty=format:"%h %s"'])
  return await logseq.App.execGitCommand(['log', '--pretty=format:"%h %ad | %s%d [%an]"', '--date=short'])
}

// git commit
export const commit = async (message: string): Promise<string> => {
  // git commit -m "message"
  return await logseq.App.execGitCommand(['commit', '-m', message])
}

// push
export const push = async (): Promise<string> => {
  // git push
  return await logseq.App.execGitCommand(['push'])
}