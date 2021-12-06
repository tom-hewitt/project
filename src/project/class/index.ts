import { nanoid } from "nanoid";
import { store } from "..";
import { addTab, removeTabId, tab } from "../../editor";
import { Command } from "../command";
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

export class CreateClassCommand extends Command {
  id: string;
  root: string;
  name?: string;
  open = true;

  constructor(name?: string) {
    super("Create Class");

    this.id = nanoid();
    this.root = nanoid();

    this.name = name;
  }

  execute(store: store) {
    // Create Root
    store.project.sceneObjects[this.root] = {
      id: this.root,
      name: "Root",
      type: "Root",
      children: [],
    };

    if (!this.name) {
      this.name = uniqueName(store.project.names.classes, "My Class");
    }

    // Create Class
    store.project.sceneClasses[this.id] = {
      name: this.name,
      methods: {},
      root: this.root,
    };

    // Create Name
    store.project.names.classes[this.name] = this.id;

    // New Tab
    const tab: tab = {
      type: "Class",
      id: this.id,
    };

    if (this.open) {
      addTab(store, tab);
    }
  }

  undo(store: store) {
    this.open = removeTabId(store, this.id);

    if (!this.name) {
      throw new Error();
    }

    delete store.project.names.classes[this.name];

    delete store.project.sceneClasses[this.id];

    delete store.project.sceneObjects[this.root];
  }
}
