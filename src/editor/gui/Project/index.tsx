import { useRef, useState } from "react";
import { sourceCode } from "../../../code";
import { createSourceCode } from "../../../code/builder";
import { Interpreter } from "../../../interpreter";
import { library3D } from "../../../libraries/3d";
import { standardLibrary } from "../../../libraries/standard";
import { DragOverlay } from "../../dragger/dnd";
import AST from "../AST";
import { Block } from "../Block";
import { AutogrowInput } from "../common/input";

// const source: sourceCode = createSourceCode((builder) => {
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

// export default function Project() {
//   const canvas = useRef<HTMLCanvasElement>(null);

//   return (
//     <div className="App">
//       <div style={{ display: "flex", flexDirection: "column" }}>
//         <button
//           onClick={() =>
//             new Interpreter(
//               source,
//               standardLibrary,
//               library3D(canvas.current!)
//             ).run()
//           }
//         >
//           Run
//         </button>
//         <canvas ref={canvas} />
//       </div>
//     </div>
//   );
// }

export default function Project() {
  return (
    <>
      <AST astRef={{ astID: "Main" }} />
      <DragOverlay>
        {({ data }) => <Block blockRef={data.data.blockRef} />}
      </DragOverlay>
    </>
  );
}
