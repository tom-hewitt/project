import { nanoid } from "nanoid";
import { store } from "..";
import { addTab, removeTabId, tab } from "../../editor";
import { command } from "../command";
import { functionId } from "../function";
import { sceneObjectId } from "../sceneObject";
import { uniqueName } from "../utils";

export type classId = string;

export interface classDef {
  name: string;

  methods: { [key: string]: functionId };

  root?: sceneObjectId;
}

export interface sceneClass extends classDef {
  root: sceneObjectId;
}

export const createClass = (givenName?: string): command => {
  return (store: store) => {
    const name = givenName
      ? givenName
      : uniqueName(store.project.names, "My Class");
    const id = nanoid();
    const root = nanoid();
    let open = true;

    return {
      action: `Create Class "${name}""`,
      execute: (store: store) => {
        // Create Root
        store.project.sceneObjects[root] = {
          id: root,
          name: "Root",
          type: "Root",
          children: [],
        };

        // Create Class
        store.project.sceneClasses[id] = {
          name: name,
          methods: {},
          root: root,
        };

        // Create Name
        store.project.names[name] = { id, type: "Class" };

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

        delete store.project.sceneClasses[id];

        delete store.project.sceneObjects[root];
      },
    };
  };
};
