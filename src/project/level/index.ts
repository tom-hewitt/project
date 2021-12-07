import { nanoid } from "nanoid";
import { store } from "..";
import { addTab, tab, removeTabId } from "../../editor";
import { sceneClass } from "../class";
import { command } from "../command";
import { uniqueName } from "../utils";

export type levelId = string;

export interface level extends sceneClass {}

export const createLevel = (givenName?: string): command => {
  return (store: store) => {
    const name = givenName
      ? givenName
      : uniqueName(store.project.names, "My Level");
    const id = nanoid();
    const root = nanoid();
    let open = true;

    return {
      action: `Create Level "${name}""`,
      execute: (store: store) => {
        // Create Root
        store.project.sceneObjects[root] = {
          id: root,
          name: "Root",
          type: "Root",
          children: [],
        };

        // Create Level
        store.project.levels[id] = {
          name: name,
          methods: {},
          root: root,
        };

        // Create Name
        store.project.names[name] = { id, type: "Level" };

        // New Tab
        const tab: tab = {
          type: "Class",
          id: id,
        };

        if (open) {
          addTab(store, tab);
        }
      },
      undo: (store: store) => {
        open = removeTabId(store, id);

        if (!name) {
          throw new Error();
        }

        delete store.project.names[name];

        delete store.project.levels[id];

        delete store.project.sceneObjects[root];
      },
    };
  };
};
