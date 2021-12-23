import create from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";
import { command, commandData } from "./command";
import { classDef, createClass, sceneClass } from "./class";
import { func } from "./function";
import { sceneObject } from "./sceneObject";
import { createEditor, editor } from "../editor";
import { toast } from "react-hot-toast";
import { ast } from "./ast";
import { block } from "./blocks";

export interface name {
  id: string;
  type: "Class" | "Level";
}

export interface project {
  classes: { [key: string]: classDef };
  functions: { [key: string]: func };
  asts: { [key: string]: ast };
  blocks: { [key: string]: block };
  sceneObjects: { [key: string]: sceneObject };
  names: {
    [key: string]: name;
  };
}

export const initialProject: project = {
  classes: {
    Scene: {
      id: "Scene",
      name: "Scene",
      attributes: {
        Scene: { name: "Scene", inheritedFrom: "Scene", type: "3D Scene" },
      },
      methods: {},
    },
  },
  functions: {},
  asts: {},
  blocks: {},
  sceneObjects: {},
  names: {},
};

function defaultProject() {
  return produce((store: store) => {
    createClass({ name: "Level 1", children: [], background: 0xc4c4c4 })(
      store
    ).execute(store);
  });
}

export interface state {
  project: project;
  history: commandData[];
  index: number;
  canUndo: boolean;
  canRedo: boolean;
  execute: (command: command) => void;
  undo: () => void;
  redo: () => void;
}

export interface store extends state, editor {}

export const useStore = create<store>(
  devtools((set, get) => ({
    ...createEditor(set, get),

    project: initialProject,
    history: [],
    index: 0,
    canUndo: false,
    canRedo: false,
    execute: (c: command) => {
      set(
        produce((store: store) => {
          const command = c(store);

          command.execute(store);

          toast(command.action);

          store.history = [...store.history.slice(0, store.index), command];
          ++store.index;

          store.canUndo = true;
          store.canRedo = false;
        })
      );
    },
    undo: () => {
      set(
        produce((store: store) => {
          if (store.canUndo) {
            const command = store.history[store.index - 1];

            command.undo(store);

            toast(`Undo ${command.action}`);

            --store.index;

            store.canRedo = true;
            store.canUndo = store.index > 0;
          } else {
            toast("Nothing to undo");
          }
        })
      );
    },
    redo: () => {
      set(
        produce((store: store) => {
          if (store.canRedo) {
            const command = store.history[store.index];

            command.execute(store);

            toast(`Redo ${command.action}`);

            ++store.index;

            store.canUndo = true;
            store.canRedo = store.index < store.history.length;
          } else {
            toast("Nothing to redo");
          }
        })
      );
    },
  }))
);

useStore.setState(defaultProject());
