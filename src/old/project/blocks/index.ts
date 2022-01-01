import { nanoid } from "nanoid";
import { project } from "..";
import { type } from "../type";

export type blockId = string;

export type block = constructorBlock | arrayBlock;

export interface baseBlock {
  type: string;
  return?: type;
}

export interface expression {
  return: type;
  block: blockId;
}

export interface functionCallBlock extends baseBlock {
  type: "Function Call";
  args: { [key: string]: expression };
}

export interface constructorBlock extends baseBlock {
  type: "Constructor";
  args: { [key: string]: expression };
  return: type;
}

export interface booleanBlock extends baseBlock {
  type: "Boolean";
  value: boolean;
  return: {
    c: "Boolean";
  };
}

export interface integerBlock extends baseBlock {
  type: "Integer";
  value: number;
  return: {
    c: "Integer";
  };
}

export interface floatBlock extends baseBlock {
  type: "Float";
  value: number;
  return: {
    c: "Float";
  };
}

export interface stringBlock extends baseBlock {
  type: "String";
  value: string;
  return: {
    c: "String";
  };
}

export interface optionalBlock extends baseBlock {
  type: "Optional";
  return: {
    c: "Optional";
    generics: { Value: type };
  };
}

export interface arrayBlock extends baseBlock {
  type: "Array";
  value: expression[];
  return: {
    c: "Array";
    generics: { Item: type };
  };
}

export interface hashmapBlock extends baseBlock {
  type: "HashMap";
  value: Map<string | number, expression>;
  return: {
    c: "HashMap";
    generics: { Key: { c: "Integer" | "Integer" | "Float" }; Value: type };
  };
}

export interface hashsetBlock extends baseBlock {
  type: "HashSet";
  value: Set<string | number>;
  return: {
    c: "HashSet";
    generics: { Key: { c: "Integer" | "Integer" | "Float" } };
  };
}

export const createBlock = (project: project, block: block) => {
  const id = nanoid();

  project.blocks[id] = block;

  return id;
};

export const createArrayBlock = (Item: type): arrayBlock => {
  return {
    type: "Array",
    value: [],
    return: {
      c: "Array",
      generics: { Item },
    },
  };
};
