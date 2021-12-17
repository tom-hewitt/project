import { SetState } from "zustand";
import produce from "immer";
import { store } from "../project";

export interface editor {
  openTabs: { [key: string]: tab };
  closedTabs: string[];
  tabs: string[];
  selectedTab?: number;
  openTab: (id: string) => void;
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
  closedTabs: [],
  tabs: [],
  selectedTab: 0,
  openTab: (id) => {
    set(
      produce((editor: editor) => {
        if (id in editor.openTabs) {
          editor.selectedTab = editor.tabs.findIndex((val) => val === id);
        } else {
          addTab(editor, { id });
        }
        editor.closedTabs = editor.closedTabs.filter((val) => val !== id);
      })
    );
  },
  selectTab: (index) => {
    set({ selectedTab: index });
  },
  closeTab: (index) => {
    set(
      produce((editor: editor) => {
        const id = editor.tabs[index];
        removeTab(editor, index);

        editor.closedTabs.push(id);
      })
    );
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

export type tab = {
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
