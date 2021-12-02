import create, { SetState } from "zustand";
import { devtools } from "zustand/middleware";
import produce from "immer";
import { Command } from "./command";
import { level } from "./level";
import { sceneClass } from "./class";
import { func } from "./function";
import { sceneObject } from "./sceneObject";
import { createEditor, editor } from "../editor";
import { toast } from "react-hot-toast";
import { RedoIcon, UndoIcon } from "../gui/components/Toolbar";

export interface project {
  sceneClasses: { [key: string]: sceneClass };
  levels: { [key: string]: level };
  functions: { [key: string]: func };
  asts: {};
  sceneObjects: { [key: string]: sceneObject };
  names: {
    classes: {
      [key: string]: string;
    };
    levels: {
      [key: string]: string;
    };
  };
}

export const initialProject: project = {
  sceneClasses: {},
  levels: {},
  functions: {},
  asts: {},
  sceneObjects: {},
  names: {
    classes: {},
    levels: {},
  },
};

export interface state {
  project: project;
  history: Command[];
  index: number;
  canUndo: boolean;
  canRedo: boolean;
  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
}

export interface store extends state, editor {}

export const useStore = create<store>(
  devtools((set) => ({
    ...createEditor(set),

    project: initialProject,
    history: [],
    index: 0,
    canUndo: false,
    canRedo: false,
    execute: (command: Command) => {
      set(
        produce((store: store) => {
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
