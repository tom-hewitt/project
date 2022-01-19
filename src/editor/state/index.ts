import create from "zustand";
import { sourceCode } from "../../code";
import { createSourceCode } from "../../code/builder";

export interface Store {
  code: sourceCode;
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
    })
  );
});

export const useStore = create<Store>((set, get) => ({
  code,
}));
