import { GetState, SetState } from "zustand";
import produce from "immer";
import { store } from "../project";

export interface editor {
  openTabs: { [key: string]: tab };
  closedClasses: () => string[];
  tabs: string[];
  selectedTabIndex?: number;
  selectedTab: () => tab | undefined;
  openTab: (id: string) => void;
  selectTab: (index: number) => void;
  closeTab: (index: number) => void;
  closeId: (id: string) => void;

  libraryOpen: boolean;
  toggleLibrary: () => void;

  selectedObject: string | null;
  selectObject: (object: string | null) => void;
}

export const createEditor = (
  set: SetState<store>,
  get: GetState<store>
): editor => ({
  openTabs: {},
  closedClasses: () => {
    const editor = get();
    const closedClassMap = { ...editor.project.classes };
    const tabs = editor.tabs;

    for (const id of tabs) {
      delete closedClassMap[id];
    }

    delete closedClassMap.Scene;

    return Object.keys(closedClassMap);
  },
  tabs: [],
  selectedTabIndex: undefined,
  selectedTab: () => {
    const editor = get();
    return editor.selectedTabIndex !== undefined
      ? editor.openTabs[editor.tabs[editor.selectedTabIndex]]
      : undefined;
  },
  openTab: (id) => {
    set(
      produce((editor: editor) => {
        if (id in editor.openTabs) {
          editor.selectedTabIndex = editor.tabs.findIndex((val) => val === id);
        } else {
          addTab(editor, { id });
        }
      })
    );
  },
  selectTab: (index) => {
    set({ selectedTabIndex: index });
  },
  closeTab: (index) => {
    set(
      produce((editor: editor) => {
        const id = editor.tabs[index];
        removeTab(editor, index);
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
  editor.selectedTabIndex = editor.tabs.length - 1;
};

export const removeTab = (editor: editor, index: number) => {
  const id = editor.tabs[index];

  editor.tabs = [
    ...editor.tabs.slice(0, index),
    ...editor.tabs.slice(index + 1),
  ];
  editor.selectedTabIndex =
    editor.selectedTabIndex === undefined
      ? 0
      : editor.selectedTabIndex < index || editor.selectedTabIndex === 0
      ? editor.selectedTabIndex
      : editor.selectedTabIndex - 1;

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
