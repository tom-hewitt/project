import { library } from "../library";

export const library3D: library = (builder) => {
  builder
    .createClass({
      name: "3D Renderer",
      super: "Object",
      methods: {
        Constructor: builder.createMethod(
          // Set the Root attribute
          builder.createBlock({
            opcode: "Set Attribute",
            object: builder.createBlock({
              opcode: "Get Variable",
              variable: "Self",
            }),
            attribute: "Root",
            to: builder.createBlock({
              opcode: "Get Variable",
              variable: "Root",
            }),
          }),
          // Call Update
          builder.createBlock({
            opcode: "Method Call",
            object: builder.createBlock({
              opcode: "Get Variable",
              variable: "Self",
            }),
            method: "Update",
            arguments: {},
          })
        ),
        Update: builder.createMethod(
          // Call Update on the Root 3D Object
          builder.createBlock({
            opcode: "Method Call",
            object: builder.createBlock({
              opcode: "Get Attribute",
              object: builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
              }),
              attribute: "Root",
            }),
            method: "Update",
            arguments: {},
          }),
          // Execute the Update Method on Self next frame
          builder.createBlock({
            opcode: "Do Next Frame",
            inner: builder.createAST(
              builder.createBlock({
                opcode: "Method Call",
                object: builder.createBlock({
                  opcode: "Get Variable",
                  variable: "Self",
                }),
                method: "Update",
                arguments: {},
              })
            ),
          })
        ),
      },
    })
    .createClass({
      name: "3D Object",
      super: "Object",
      methods: {
        Constructor: builder.createMethod(
          // Set the Children attribute
          builder.createBlock({
            opcode: "Set Attribute",
            object: builder.createBlock({
              opcode: "Get Variable",
              variable: "Self",
            }),
            attribute: "Children",
            to: builder.createBlock({
              opcode: "Get Variable",
              variable: "Children",
            }),
          })
        ),
        Update: builder.createMethod(
          // Print Self
          builder.createBlock({
            opcode: "Function Call",
            function: { funcID: "Print" },
            arguments: {
              Value: builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
              }),
            },
          }),
          // Loop over children, calling update on each
          builder.createBlock({
            opcode: "For",
            variable: "Child",
            array: builder.createBlock({
              opcode: "Get Attribute",
              object: builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
              }),
              attribute: "Children",
            }),
            inner: builder.createAST(
              builder.createBlock({
                opcode: "Method Call",
                object: builder.createBlock({
                  opcode: "Get Variable",
                  variable: "Child",
                }),
                method: "Update",
                arguments: {},
              })
            ),
          })
        ),
      },
    });
};
