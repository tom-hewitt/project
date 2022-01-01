import { nanoid } from "nanoid";
import { store, useStore } from "..";
import { classId } from "../class";
import { command } from "../command";
import { current } from "immer";

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
  attributes: { background: number };
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

export const deleteObject = (id: sceneObjectId): command => {
  let object: sceneObject;
  let index: number;

  return () => {
    return {
      action: `Delete Object`,
      execute: (store: store) => {
        object = current(store.project.sceneObjects[id]);

        if (object.parent) {
          index = store.project.sceneObjects[object.parent].children.findIndex(
            (val) => val === id
          );

          store.project.sceneObjects[object.parent].children.splice(index, 1);
        }

        delete store.project.sceneObjects[id];
      },
      undo: (store: store) => {
        store.project.sceneObjects[id] = object;

        if (object.parent) {
          store.project.sceneObjects[object.parent].children.splice(
            index,
            0,
            id
          );
        }
      },
    };
  };
};

export const createInstance = (
  classId: classId,
  parent: sceneObjectId
): command => {
  const id = nanoid();

  const name = useStore.getState().project.classes[classId].name;

  return createObject({
    id,
    type: "Instance",
    name,
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
        const object = store.project.sceneObjects[id];

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

        const object = store.project.sceneObjects[id];

        // Set old parent again
        object.parent = oldParent;

        // Add to old parent's children array
        store.project.sceneObjects[oldParent].children.push(id);
      },
    };
  };
};
