import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export enum GIT_STATUS {
  Disabled = -1,
  Unknown, // TODO
  LocalInUse = 1,
  RemoteInUse = 2,
  LocalChanges = 4,
  LocalOk = 5,
  LocalError = 8,
  RemoteChanges = 16,
  RemoteOk = 17,
  RemoteError = 32,
  Loading = 64,
  MenuOpen = 128
}
export const SETTING_GRAPH_GIT_ENABLED = "plugin-git/enabled";

export const INACTIVE_STYLE = "INACTIVE";
export const UNKNOWN_STYLE = INACTIVE_STYLE;
export const ACTIVE_STYLE = "ACTIVE";

export type Button = {
  key: string;
  title: string;
  event: string;
};

export const BUTTONS: Button[] = [
  { key: "status", title: "Check Status", event: "check" },
  { key: "log", title: "Show Log", event: "log" },
  { key: "pull", title: "Pull", event: "pull" },
  { key: "pullRebase", title: "Pull Rebase", event: "pullRebase" },
  { key: "checkout", title: "Checkout", event: "checkout" },
  { key: "commit", title: "Commit", event: "commit" },
  { key: "push", title: "Push", event: "push" },
  { key: "commitAndPush", title: "Commit & Push", event: "commitAndPush" },
  { key: "sync", title: "Synchronization", event: "sync" }
];

export const SETTINGS_SCHEMA: SettingSchemaDesc[] = [
  {
    key: "buttons",
    title: "Buttons",
    type: "enum",
    default: ["Check Status", "Show Log", "Commit", "Sync"], // TODO sync ?
    description: "Select buttons to show",
    enumPicker: "checkbox",
    enumChoices: BUTTONS.map(({ title }) => title)
  },
  {
    key: "checkWhenDBChanged",
    title: "Check Status when DB Changed",
    type: "boolean",
    default: true,
    description: "Check status when DB changed, restart logseq to take effect"
  },
  {
    key: "autoCheckSynced", // TODO how does it work?
    title: "Auto Check If Synced",
    type: "boolean",
    default: false,
    description:
      "Automatically check if the local version is the same as the remote"
  },
  {
    key: "autoPush",
    title: "Auto Push",
    type: "boolean",
    default: false,
    description: "Auto push when logseq hide"
  }
];
