import produce from "immer";
import { cloneDeep } from "lodash";
import { nanoid } from "nanoid";
import create from "zustand";
import { devtools } from "zustand/middleware";
import {
  block,
  childBlockRef,
  classDef,
  concreteBlockRef,
  funcRef,
  sourceCode,
  typeDef,
} from "../../code";
import { loadLibraries } from "../../interpreter/library";
import { library3D } from "../../libraries/3d";
import { standardLibrary } from "../../libraries/standard";
import { typeColors } from "../../styles/typeColors";
import { code } from "./code";

loadLibraries(code, standardLibrary, library3D);

export interface Store {
  code: sourceCode;
  userClasses: string[];
  dropBlock: (dragData: BlockData, dropData: BlockData) => void;
  deleteBlock: (data: BlockData) => void;
  setBlock: (blockRef: childBlockRef, newBlock: block) => void;
}

export const useStore = create<Store>(
  devtools((set) => ({
    code,
    userClasses: ["Program", "Level", "Character"],
    dropBlock: (dragData: BlockData, dropData: BlockData) =>
      set(
        produce((store: Store) => {
          insertBlock(store, dropData, removeBlock(store, dragData));
        })
      ),
    deleteBlock: (data: BlockData) =>
      set(
        produce((store: Store) => {
          removeBlock(store, data);
        })
      ),
    setBlock: (blockRef, newBlock) =>
      set(
        produce((store: Store) => {
          if (blockRef.type === "Concrete") {
            store.code.blocks[blockRef.blockID] = newBlock;
          } else {
            throw new Error();
          }
        })
      ),
  }))
);

export type BlockData =
  | ChildBlockData
  | PaletteBlockData
  | FunctionBlockData
  | AttributeBlockData;

export interface ChildBlockData {
  type: "Child Block";
  parent: concreteBlockRef;
  blockRef: childBlockRef;
  index: number;
}

export interface PaletteBlockData {
  type: "Palette Block";
  block: block;
}

export interface FunctionBlockData {
  type: "Function Block";
  blockRef: concreteBlockRef;
}

export interface AttributeBlockData {
  type: "Attribute Block";
  blockRef: childBlockRef;
  c: string;
  attribute: string;
}

const removeBlock = (store: Store, data: BlockData): string => {
  switch (data.type) {
    case "Attribute Block": {
      const attributeBlockRef =
        store.code.classes[data.c].attributes[data.attribute].blockRef;

      if (attributeBlockRef.type === "Placeholder") {
        throw new Error();
      }

      const blockID = attributeBlockRef.blockID;

      store.code.classes[data.c].attributes[data.attribute].blockRef = {
        type: "Placeholder",
        return: attributeBlockRef.return,
      };

      return blockID;
    }
    case "Function Block": {
      throw new Error();
    }
    case "Child Block": {
      const parent = store.code.blocks[data.parent.blockID];

      switch (parent.opcode) {
        case "Sequence":
        case "Array": {
          const blockRef = parent.children.splice(data.index, 1)[0];

          if (blockRef.type === "Placeholder") {
            throw new Error("Unreachable");
          }

          return blockRef.blockID;
        }
        default: {
          if (parent.children) {
            const blockRef = parent.children[data.index];

            if (blockRef.type === "Concrete") {
              const typeDef = parent.children[data.index].return;

              parent.children[data.index] = {
                type: "Placeholder",
                return: typeDef,
              };

              return blockRef.blockID;
            }
          }
          throw new Error();
        }
      }
    }
    case "Palette Block": {
      const blockID = nanoid();

      store.code.blocks[blockID] = cloneDeep(data.block);

      return blockID;
    }
  }
};

const inferType = (type: typeDef, destination: typeDef) => {
  if (type.inferrable) {
    type.c = destination.c;
    type.inferrable = false;
  }

  if (type.generics && destination.generics) {
    for (const [name, generic] of Object.entries(type.generics)) {
      inferType(generic, destination.generics[name]);
    }
  }
};

const insertBlock = (store: Store, data: BlockData, blockID: string) => {
  switch (data.type) {
    case "Attribute Block": {
      const dragBlock = store.code.blocks[blockID];

      if (dragBlock.return && data.blockRef.return) {
        inferType(dragBlock.return, data.blockRef.return);
      }

      store.code.classes[data.c].attributes[data.attribute] = {
        inheritedFrom: data.c,
        blockRef: {
          type: "Concrete",
          blockID,
          return: data.blockRef.return,
        },
      };

      return;
    }
    case "Function Block": {
      const block = store.code.blocks[data.blockRef.blockID];

      if (block.opcode === "Sequence") {
        block.children.push({ type: "Concrete", blockID });

        return;
      } else {
        throw new Error();
      }
    }
    case "Child Block": {
      const parent = store.code.blocks[data.parent.blockID];

      switch (parent.opcode) {
        case "Sequence": {
          parent.children.splice(data.index, 0, {
            type: "Concrete",
            blockID,
          });

          break;
        }
        case "Array": {
          if (!(data.blockRef.type === "Placeholder")) {
            const dragBlock = store.code.blocks[blockID];

            if (!dragBlock.return) {
              throw new Error();
            }

            inferType(dragBlock.return, parent.return.generics.item);

            parent.children.splice(data.index, 0, {
              type: "Concrete",
              blockID,
              return: dragBlock.return,
            });

            break;
          }
        }
        default:
          {
            if (parent.children) {
              if (data.blockRef.type === "Placeholder") {
                if (data.blockRef.sequence) {
                  const sequenceID = nanoid();

                  store.code.blocks[sequenceID] = {
                    opcode: "Sequence",
                    children: [{ type: "Concrete", blockID }],
                  };

                  parent.children[data.index] = {
                    type: "Concrete",
                    blockID: sequenceID,
                  };

                  return;
                }
              } else {
                const destinationBlock =
                  store.code.blocks[data.blockRef.blockID];

                if (destinationBlock.opcode === "Sequence") {
                  destinationBlock.children.push({ type: "Concrete", blockID });

                  return;
                }
              }

              const dragBlock = store.code.blocks[blockID];

              if (dragBlock.return && data.blockRef.return) {
                inferType(dragBlock.return, data.blockRef.return);
              }

              parent.children[data.index] = {
                type: "Concrete",
                blockID,
                return: dragBlock.return,
              };
            }
          }

          break;
      }
    }
  }
};

export const useClass = (id: string) => {
  return useStore((store) => store.code.classes[id]);
};

export const useFunc = (funcRef: funcRef) => {
  return useStore((store) => store.code.functions[funcRef.funcID]);
};

export const useClassColor = (c: string | undefined) => {
  return useStore((store) => {
    const recurse = (c: string): string => {
      const color = typeColors[c];

      if (color) {
        return color;
      } else {
        const classDef = store.code.classes[c];

        if (!classDef) {
          console.warn(`${c} doesn't exist`);

          return "red";
        }

        if (classDef.super) {
          return recurse(classDef.super);
        } else {
          return "#D6D6D6";
        }
      }
    };

    return c ? recurse(c) : undefined;
  });
};
