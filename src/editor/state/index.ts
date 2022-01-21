import produce from "immer";
import create from "zustand";
import { astRef, block, blockRef, sourceCode } from "../../code";
import { createSourceCode } from "../../code/builder";

export interface Store {
  code: sourceCode;
  moveBlock: (
    oldAST: astRef,
    oldIndex: number,
    newAST: astRef,
    newIndex: number
  ) => void;
  setBlock: (blockRef: blockRef, newBlock: block) => void;
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
      opcode: "Boolean",
      value: true,
    }),
    builder.createBlock({
      opcode: "Integer",
      value: 100,
    }),
    builder.createBlock({
      opcode: "Float",
      value: 0.5,
    }),
    builder.createBlock({
      opcode: "String",
      value: "Hello, World!",
    })
  );
});

export const useStore = create<Store>((set, get) => ({
  code,
  moveBlock: (oldAST, oldIndex, newAST, newIndex) =>
    set(
      produce((store: Store) => {
        store.code.asts[newAST.astID].blocks.splice(
          newIndex,
          0,
          store.code.asts[oldAST.astID].blocks.splice(oldIndex, 1)[0]
        );
      })
    ),
  setBlock: (blockRef: blockRef, newBlock: block) =>
    set(
      produce((store: Store) => {
        store.code.blocks[blockRef.blockID] = newBlock;
      })
    ),
}));
