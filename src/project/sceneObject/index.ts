import { nanoid } from "nanoid";
import { store } from "..";
import { classId } from "../class";
import { command } from "../command";

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

export const createObject = (
  object: sceneObject & { parent: sceneObjectId }
): command => {
  return (store: store) => {
    return {
      action: `Create Object "${object.name}"`,
      execute: (store: store) => {
        store.project.sceneObjects[object.id] = object;

        store.project.sceneObjects[object.parent].children.push(object.id);
      },
      undo: (store: store) => {
        store.project.sceneObjects[object.parent].children =
          store.project.sceneObjects[object.parent].children.filter(
            (val) => val !== object.id
          );

        delete store.project.sceneObjects[object.id];
      },
    };
  };
};

export const createInstance = (
  classId: classId,
  parent: sceneObjectId
): command => {
  const id = nanoid();

  return createObject({
    id,
    type: "Instance",
    name: "Instance",
    class: classId,
    parent,
    children: [],
  });
};

export const createMesh = (model: string, parent: sceneObjectId): command => {
  const id = nanoid();

  return createObject({
    id,
    type: "Mesh",
    model,
    parent,
    name: model,
    children: [],
  });
};

export const reparentObject = (
  id: sceneObjectId,
  parent: sceneObjectId
): command => {
  return (store: store) => {
    const object = store.project.sceneObjects[id];

    if (!object.parent) {
      throw new Error("Object with no parent!");
    }

    const oldParent = object.parent;
    return {
      action: "Reparent Object",
      execute: (store: store) => {
        // Remove from old parent's children array
        store.project.sceneObjects[oldParent].children =
          store.project.sceneObjects[oldParent].children.filter(
            (val) => val !== id
          );

        // Set new parent
        object.parent = parent;

        // Add to new parent's children array
        store.project.sceneObjects[parent].children.push(id);
      },
      undo: (store: store) => {
        // Remove from new parent's children array
        store.project.sceneObjects[parent].children =
          store.project.sceneObjects[parent].children.filter(
            (val) => val !== id
          );

        // Set old parent again
        object.parent = oldParent;

        // Add to old parent's children array
        store.project.sceneObjects[oldParent].children.push(id);
      },
    };
  };
};
