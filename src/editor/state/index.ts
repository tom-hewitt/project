import produce from "immer";
import { range } from "lodash";
import { nanoid } from "nanoid";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { astRef, block, blockRef, sourceCode } from "../../code";
import { createSourceCode } from "../../code/builder";

export interface Store {
  code: sourceCode;
  dropBlock: (dragData: BlockData, dropData: BlockData) => void;
  setBlock: (blockRef: blockRef, newBlock: block) => void;
  createBlock: (block: block, id: string) => void;
}

// const code: sourceCode = createSourceCode((builder) => {
//   builder.addToMain(
//     builder.createBlock({
//       opcode: "Construct",
//       c: "3D Renderer",
//       arguments: {
//         Root: builder.createBlock({
//           opcode: "Construct",
//           c: "3D Object",
//           arguments: {
//             Children: builder.createBlock({
//               opcode: "Array",
//               value: [],
//             }),
//           },
//         }),
//       },
//     })
//   );
// });

const code: sourceCode = createSourceCode((builder) => {
  builder.addToMain(
    builder.createBlock({
      opcode: "Array",
      children: [
        builder.createBlock({
          opcode: "Integer",
          value: 0,
        }),
        builder.createBlock({
          opcode: "Integer",
          value: 1,
        }),
        builder.createBlock({
          opcode: "Integer",
          value: 2,
        }),
      ],
    })
  );
});

export type BlockData = ASTBlockData | ChildBlockData;

export interface ASTBlockData {
  type: "AST Block";
  blockRef: blockRef;
  astRef: astRef;
  index: number;
}

export interface ChildBlockData {
  type: "Child Block";
  parent: blockRef;
  blockRef: blockRef;
  index: number;
}

const removeBlock = (store: Store, data: BlockData): blockRef => {
  switch (data.type) {
    case "AST Block": {
      return store.code.asts[data.astRef.astID].blocks.splice(data.index, 1)[0];
    }
    case "Child Block": {
      const parent = store.code.blocks[data.parent.blockID];
      if (parent.children) {
        const blockID = parent.children[data.index].blockID;

        const placeholderID = nanoid();

        store.code.blocks[placeholderID] = {
          opcode: "Placeholder",
        };

        parent.children[data.index].blockID = placeholderID;

        console.log(blockID);

        return { blockID };
      } else {
        throw new Error();
      }
    }
  }
};

const insertBlock = (store: Store, data: BlockData, block: blockRef) => {
  switch (data.type) {
    case "AST Block": {
      store.code.asts[data.astRef.astID].blocks.splice(data.index, 0, block);
      break;
    }
    case "Child Block": {
      const parent = store.code.blocks[data.parent.blockID];
      if (parent.children) {
        parent.children[data.index] = block;
      }
    }
  }
};

export const useStore = create<Store>(
  devtools((set) => ({
    code,
    dropBlock: (dragData: BlockData, dropData: BlockData) =>
      set(
        produce((store: Store) => {
          console.log(removeBlock(store, dragData));

          // insertBlock(dropData, removeBlock(dragData));
        })
      ),
    setBlock: (blockRef, newBlock) =>
      set(
        produce((store: Store) => {
          store.code.blocks[blockRef.blockID] = newBlock;
        })
      ),
    createBlock: (block, id) =>
      set(
        produce((store: Store) => {
          store.code.blocks[id] = block;
        })
      ),
  }))
);
