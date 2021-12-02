import { nanoid } from "nanoid";
import { store } from "..";
import { classId } from "../class";
import { Command } from "../command";

export type sceneObjectId = string;

export type sceneObject = rootObject | meshObject | instanceObject;

interface baseSceneObject {
  id: string;
  name: string;
  parent?: sceneObjectId;
  children: sceneObjectId[];
}

export interface rootObject extends baseSceneObject {
  type: "Root";
}

export interface childSceneObject extends baseSceneObject {
  parent: sceneObjectId;
}

export interface meshObject extends childSceneObject {
  type: "Mesh";
  model: model;
}

export interface instanceObject extends childSceneObject {
  type: "Instance";
  class: classId;
}

export type model = string;

export class CreateObjectCommand extends Command {
  object: sceneObject & { parent: sceneObjectId };

  constructor(object: sceneObject & { parent: sceneObjectId }) {
    super(`Create Object "${object.name}"`);

    this.object = object;
  }

  execute(store: store) {
    store.project.sceneObjects[this.object.id] = this.object;

    store.project.sceneObjects[this.object.parent].children.push(
      this.object.id
    );
  }
  undo(store: store) {
    store.project.sceneObjects[this.object.parent].children =
      store.project.sceneObjects[this.object.parent].children.filter(
        (val) => val !== this.object.id
      );

    delete store.project.sceneObjects[this.object.id];
  }
}

export class CreateInstanceCommand extends CreateObjectCommand {
  constructor(classId: classId, parent: sceneObjectId) {
    const id = nanoid();

    super({
      id,
      type: "Instance",
      name: "Instance",
      class: classId,
      parent,
      children: [],
    });
  }
}

export class CreateMeshCommand extends CreateObjectCommand {
  constructor(model: string, parent: sceneObjectId) {
    const id = nanoid();

    super({
      id,
      type: "Mesh",
      model,
      parent,
      name: model,
      children: [],
    });
  }
}

export class ReparentObjectCommand extends Command {
  id: sceneObjectId;
  oldParent?: sceneObjectId;
  parent: sceneObjectId;

  constructor(id: sceneObjectId, parent: sceneObjectId) {
    super("Reparent object");

    console.log(id, parent);

    this.id = id;

    this.parent = parent;
  }

  execute(store: store) {
    const object = store.project.sceneObjects[this.id];

    if (object.parent) {
      store.project.sceneObjects[object.parent].children =
        store.project.sceneObjects[object.parent].children.filter(
          (val) => val !== this.id
        );

      this.oldParent = object.parent;

      object.parent = this.parent;

      store.project.sceneObjects[this.parent].children = [
        ...store.project.sceneObjects[this.parent].children,
        this.id,
      ];
    }
  }
  undo(store: store) {
    store.project.sceneObjects[this.parent].children =
      store.project.sceneObjects[this.parent].children.filter(
        (val) => val !== this.id
      );

    const object = store.project.sceneObjects[this.id];

    object.parent = this.oldParent;

    if (this.oldParent) {
      store.project.sceneObjects[this.oldParent].children.push(this.id);
    }
  }
}
