import { nanoid } from "nanoid";
import { store } from "..";
import { addTab, tab, removeTabId } from "../../editor";
import { sceneClass } from "../class";
import { Command } from "../command";
import { uniqueName } from "../utils";

export type levelId = string;

export interface level extends sceneClass {}

export class CreateLevelCommand extends Command {
  id: string;
  root: string;
  cube: string;
  name?: string;
  open = true;

  constructor(name?: string) {
    super("Create Level");
    this.id = nanoid();
    this.root = nanoid();
    this.cube = nanoid();

    this.name = name;
  }

  execute = (store: store) => {
    // Create Default Cube
    store.project.sceneObjects[this.cube] = {
      id: this.cube,
      name: "Cube",
      type: "Mesh",
      model: "Box",
      parent: this.root,
      children: [],
    };

    // Create Root
    store.project.sceneObjects[this.root] = {
      id: this.root,
      name: "Root",
      type: "Root",
      children: [this.cube],
    };

    if (!this.name) {
      this.name = uniqueName(store.project.names.levels, "My Level");
    }

    // Create Name
    store.project.names.levels[this.name] = this.id;

    // Create Level
    store.project.levels[this.id] = {
      name: this.name,
      methods: {},
      root: this.root,
    };

    // New Tab
    const tab: tab = {
      type: "Level",
      id: this.id,
    };

    if (this.open) {
      addTab(store, tab);
    }
  };

  undo = (store: store) => {
    this.open = removeTabId(store, this.id);

    if (!this.name) {
      throw new Error();
    }

    delete store.project.names.classes[this.name];

    delete store.project.levels[this.id];

    delete store.project.sceneObjects[this.root];

    delete store.project.sceneObjects[this.cube];
  };
}
