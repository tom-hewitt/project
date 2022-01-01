import { store } from ".";

export type command = (store: store) => commandData;

export type commandData = {
  action: string;
  execute: (store: store) => void;
  undo: (store: store) => void;
};
