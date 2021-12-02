import create, { SetState, GetState } from "zustand";
import produce from "immer";
import { levelId } from "../project/level";
import { classId } from "../project/class";
import { store } from "../project";

export interface editor {
  openTabs: { [key: string]: tab };
  tabs: string[];
  selectedTab?: number;
  openTab: (id: string, type: tabType) => void;
  selectTab: (index: number) => void;
  closeTab: (index: number) => void;
  closeId: (id: string) => void;

  libraryOpen: boolean;
  toggleLibrary: () => void;

  selectedObject: string | null;
  selectObject: (object: string | null) => void;
}

export const createEditor = (set: SetState<store>): editor => ({
  openTabs: {},
  tabs: [],
  selectedTab: 0,
  openTab: (id, type) => {
    set(
      produce((editor: editor) => {
        if (id in editor.openTabs) {
          editor.selectedTab = editor.tabs.findIndex((val) => val === id);
        } else {
          addTab(editor, { type, id });
        }
      })
    );
  },
  selectTab: (index) => {
    set({ selectedTab: index });
  },
  closeTab: (index) => {
    set(produce((editor: editor) => removeTab(editor, index)));
  },
  closeId: (id: string) => {
    set(produce((editor: editor) => removeTabId(editor, id)));
  },

  libraryOpen: false,
  toggleLibrary: () => {
    set((editor) => ({ libraryOpen: !editor.libraryOpen }));
  },

  selectedObject: null,
  selectObject: (object) => {
    set({ selectedObject: object });
  },
});

export type tabType = "Level" | "Class";

export type tab = {
  type: tabType;
  id: string;
};

export const addTab = (editor: editor, tab: tab) => {
  editor.openTabs[tab.id] = tab;
  editor.tabs = [...editor.tabs, tab.id];
  editor.selectedTab = editor.tabs.length - 1;
};

export const removeTab = (editor: editor, index: number) => {
  const id = editor.tabs[index];

  editor.tabs = [
    ...editor.tabs.slice(0, index),
    ...editor.tabs.slice(index + 1),
  ];
  editor.selectedTab =
    editor.selectedTab === undefined
      ? 0
      : editor.selectedTab < index || editor.selectedTab === 0
      ? editor.selectedTab
      : editor.selectedTab - 1;

  delete editor.openTabs[id];
};

export const removeTabId = (editor: editor, id: string) => {
  const index = editor.tabs.findIndex((tab) => tab === id);

  if (index !== -1) {
    removeTab(editor, index);
  }

  delete editor.openTabs[id];

  return index !== -1;
};
