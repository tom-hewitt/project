import { Interpreter, sourceCode } from "../../../interpreter";
import { createSourceCode } from "../../../interpreter/code";
import { library3D } from "../../../interpreter/libraries/3d";
import { standardLibrary } from "../../../interpreter/libraries/standard";

const source: sourceCode = createSourceCode((builder) => {
  builder.addToMain(
    builder.createBlock({
      opcode: "Construct",
      c: "3D Renderer",
      arguments: {
        Root: builder.createBlock({
          opcode: "Construct",
          c: "3D Object",
          arguments: {
            Children: builder.createBlock({
              opcode: "Array",
              value: [
                builder.createBlock({
                  opcode: "Construct",
                  c: "3D Object",
                  arguments: {
                    Children: builder.createBlock({
                      opcode: "Array",
                      value: [],
                    }),
                  },
                }),
              ],
            }),
          },
        }),
      },
    })
  );
});

export default function Project() {
  return (
    <div className="App">
      <h1>Interpreter</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "50px",
        }}
      >
        <pre>{JSON.stringify(source, null, 2)}</pre>
        <button
          onClick={() =>
            new Interpreter(source, standardLibrary, library3D).run()
          }
        >
          Run
        </button>
      </div>
    </div>
  );
}
