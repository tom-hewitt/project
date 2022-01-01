import { nanoid } from "nanoid";
import { project, store } from "..";
import { addTab, removeTabId, tab } from "../../state";
import { command, commandData } from "../command";
import { functionId } from "../function";
import { type } from "../type";
import { sceneObjectId } from "../sceneObject";
import { uniqueName } from "../utils";
import { blockId, expression } from "../blocks";

export type classId = string;

export interface classDef {
  id: classId;
  name: string;
  parent?: classId;
  attributes: { [key: string]: attribute };
  methods: { [key: string]: functionId };
}

export type attribute = {
  id: string;
  name: string;
  inheritedFrom: classId;
  overridenBy?: classId;
  type: type;
  block?: blockId;
};

interface createClassData {
  id?: string;
  name: string;
  parent?: string;
  attributes?: { [key: string]: attribute };
  methods?: { [key: string]: functionId };
}

export const createClass = (
  project: project,
  {
    id = nanoid(),
    name,
    parent,
    attributes = {},
    methods = {},
  }: createClassData
) => {
  project.classes[id] = {
    id,
    name,
    parent,
    attributes,
    methods,
  };

  return id;
};

export const getAttributes = (
  project: project,
  classId: classId
): { [key: string]: attribute } => {
  const classDef = project.classes[classId];

  return classDef.parent
    ? { ...getAttributes(project, classDef.parent), ...classDef.attributes }
    : { ...classDef.attributes };
};

interface createAttributeData {
  id?: string;
  name: string;
  type: type;
  block?: blockId;
}

export const createAttribute = (
  project: project,
  classId: classId,
  { id = nanoid(), name, type, block }: createAttributeData
) => {
  project.classes[classId].attributes[id] = {
    id,
    name,
    type,
    inheritedFrom: classId,
  };

  return id;
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
