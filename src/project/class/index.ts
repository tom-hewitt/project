import { nanoid } from "nanoid";
import { store } from "..";
import { addTab, removeTabId, tab } from "../../editor";
import { command } from "../command";
import { functionId } from "../function";
import { baseLiteral, literal } from "../literal";
import { type } from "../type";
import { sceneObjectId } from "../sceneObject";
import { uniqueName } from "../utils";

export type classId = string;

export interface classDef {
  id: classId;
  name: string;
  parent?: classId;
  attributes: { [key: string]: attribute };
  methods: { [key: string]: functionId };
}

export type attribute<T extends type = type> = {
  id: string;
  name: string;
  inheritedFrom: classId;
  overridenBy?: classId;
  type: T;
  literal?: literal & baseLiteral & T;
};

export interface sceneClass extends classDef {
  root: sceneObjectId;
}

interface createClassOptions {
  name?: string;
  background?: number;
  children?: sceneObjectId[];
}

export const createClass = ({
  name: givenName,
  children = [],
  background = 0x252525,
}: createClassOptions): command => {
  return (store: store) => {
    const name = givenName
      ? givenName
      : uniqueName(store.project.names, "My Class");
    const id = nanoid();
    const root = nanoid();
    let open = true;

    return {
      action: `Create Class "${name}""`,
      execute: (store: store) => {
        // Create Root
        store.project.sceneObjects[root] = {
          id: root,
          name: "Root",
          type: "Root",
          children,
          attributes: {
            background,
          },
        };

        // Create Class
        store.project.classes[id] = {
          id,
          name,
          parent: "Object 3D",
          attributes: {
            Children: {
              id: "Children",
              name: "Children",
              inheritedFrom: "Object 3D",
              type: {
                type: "Array",
                itemType: {
                  type: "Object Reference",
                  objectClass: "Object 3D",
                },
              },
              literal: {
                type: "Array",
                itemType: {
                  type: "Object Reference",
                  objectClass: "Object 3D",
                },
                value: [
                  {
                    type: "Object Reference",
                    objectClass: "Object 3D",
                    value: root,
                  },
                ],
              },
            },
          },
          methods: {},
        };

        // Create Name
        store.project.names[name] = { id, type: "Class" };

        // New Tab
        const tab: tab = {
          id,
        };

        if (open) {
          addTab(store, tab);
        }
      },
      undo: (store: store) => {
        open = removeTabId(store, id);

        if (!name) {
          throw new Error();
        }

        delete store.project.names[name];

        delete store.project.classes[id];

        delete store.project.sceneObjects[root];
      },
    };
  };
};

export const getAttributes = (
  store: store,
  classId: classId
): { [key: string]: attribute } => {
  const classDef = store.project.classes[classId];

  return classDef.parent
    ? { ...getAttributes(store, classDef.parent), ...classDef.attributes }
    : { ...classDef.attributes };
};

export const createAttribute = (
  classId: classId,
  name: string,
  type: type
): command => {
  return () => {
    const id = nanoid();
    return {
      action: `Create Attribute "${name}"`,
      execute: (store: store) => {
        store.project.classes[classId].attributes[id] = {
          id,
          name,
          type,
          inheritedFrom: classId,
        };
      },
      undo: (store: store) => {
        delete store.project.classes[classId].attributes[id];
      },
    };
  };
};

export const renameAttribute = (
  classId: classId,
  attributeId: string,
  name: string
): command => {
  return (store: store) => {
    const nameBefore =
      store.project.classes[classId].attributes[attributeId].name;

    return {
      action: `Rename attribute to "${name}"`,
      execute: (store: store) => {
        store.project.classes[classId].attributes[attributeId].name = name;
      },
      undo: () => {
        store.project.classes[classId].attributes[attributeId].name =
          nameBefore;
      },
    };
  };
};
