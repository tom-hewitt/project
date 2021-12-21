import { nanoid } from "nanoid";
import { store } from "..";
import { addTab, removeTabId, tab } from "../../editor";
import { command } from "../command";
import { functionId } from "../function";
import { literal, type } from "../literal";
import { sceneObjectId } from "../sceneObject";
import { uniqueName } from "../utils";

export type classId = string;

export interface classDef {
  name: string;
  attributes: { [key: string]: attribute };
  methods: { [key: string]: functionId };
  root?: sceneObjectId;
}

export type attribute = {
  type: type;
  literal?: literal;
};

export interface sceneClass extends classDef {
  root: sceneObjectId;
}

interface createClassOptions {
  name?: string;
  background?: number;
  children?: sceneObjectId[];
}

export const createClass = ({
  name: givenName,
  children = [],
  background = 0x252525,
}: createClassOptions): command => {
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
          children,
          attributes: {
            background,
          },
        };

        // Create Class
        store.project.classes[id] = {
          name,
          attributes: {},
          methods: {},
          root,
        };

        // Create Name
        store.project.names[name] = { id, type: "Class" };

        // New Tab
        const tab: tab = {
          id,
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

        delete store.project.classes[id];

        delete store.project.sceneObjects[root];
      },
    };
  };
};
