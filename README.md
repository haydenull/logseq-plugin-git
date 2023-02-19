# logseq-plugin-git
> git plugin for logseq

[![latest release version](https://img.shields.io/github/v/release/haydenull/logseq-plugin-git)](https://github.com/haydenull/logseq-plugin-git/releases)
[![License](https://img.shields.io/github/license/haydenull/logseq-plugin-git?color=blue)](https://github.com/haydenull/logseq-plugin-git/blob/main/LICENSE)

Logseq Git Plugin is a plugin for Logseq that provides easy access to common git commands, and helps you keep your notes synchronized with a remote git repository.

With this plugin, you can:

- Know explicitly if there are unsaved notes in the current repository and if they are synchronized with the remote repository. When there are unsaved files locally, the plugin will show a red indicator in the toolbar icon.
- Quickly commit changes to notes. The plugin provides shortcut keys (mod+s) to perform commit&push operations.
- Provide buttons to quickly execute common commands. Click the plugin icon, and the drop-down menu will show you some buttons to help you quickly execute commands (you can specify the desired buttons in the settings).
- Prompt you if you have synchronized with the remote repository. The plugin automatically detects if the current repository is up-to-date and prompts when logseq starts and other times.

## Installation

Install from the Logseq Plugin Store

## Shortcuts
The plugin provides a shortcut key (mod+s) to quickly commit and push changes to the remote repository.

## Toolbar Icon

- icon: everything is up-to-date.
- icon with red dot: there are unsaved files locally.
- icon with blinking red dot: the plugin is committing or pushing changes to the remote repository.

## Commands

The drop-down menu shows the following commands:
- Check Status: check the status of the current repository.
- Show Log: show the log of the current repository.
- Pull: pull changes from the remote repository.
- Pull Rebase: pull changes from the remote repository and rebase.
- Commit: commit changes to the current repository.
- Push: push changes to the remote repository.
- Commit & Push: commit changes and push to the remote repository.

## Demo
![demo](./demo.png)

