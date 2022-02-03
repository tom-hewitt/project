import * as THREE from "three";
import { library } from ".";

export const library3D: library = (builder) => {
  builder
    .createClass({
      name: "3D Object",
      super: "Object",
      attributes: {
        Children: builder.createAttribute(
          "Object",
          builder.createBlock({
            opcode: "Array",
            children: [],
            return: { c: "Array", generics: { item: { c: "3D Object" } } },
          })
        ),
      },
      methods: {
        Constructor: builder.createMethod(
          "Object",
          "Constructor",
          ["Children", "Position"],
          // Set the Children attribute
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "Children",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Object" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Children",
                return: { c: "Array", generics: { item: { c: "3D Object" } } },
              }),
            ],
          }),
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "Position",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Object" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Position",
                return: { c: "3D Vector" },
              }),
            ],
          })
        ),
      },
    })
    .createClass({
      name: "3D Model",
      super: "3D Object",
      attributes: {
        Name: {
          inheritedFrom: "Model",
          blockRef: { type: "Placeholder", return: { c: "String" } },
        },
      },
      methods: {
        Constructor: builder.createMethod(
          "3D Mesh",
          "Constructor",
          ["Name", "Children", "Position"],
          builder.createBlock({
            opcode: "Method Call",
            c: "3D Object",
            method: "Constructor",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Mesh" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Children",
                return: { c: "Array", generics: { item: { c: "3D Object" } } },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Position",
                return: { c: "3D Vector" },
              }),
            ],
          }),
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "Name",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Mesh" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Name",
                return: { c: "String" },
              }),
            ],
          })
        ),
      },
    })
    .createClass({
      name: "3D Plane",
      super: "3D Object",
      attributes: {},
      methods: {},
    })
    .createClass({
      name: "3D Box",
      super: "3D Object",
      attributes: {
        Size: {
          inheritedFrom: "3D Box",
          blockRef: {
            type: "Placeholder",
            return: { c: "3D Vector" },
          },
        },
      },
      methods: {
        Constructor: builder.createMethod(
          "3D Box",
          "Constructor",
          ["Children", "Position", "Size"],
          builder.createBlock({
            opcode: "Method Call",
            c: "3D Object",
            method: "Constructor",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Mesh" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Children",
                return: { c: "Array", generics: { item: { c: "3D Object" } } },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Position",
                return: { c: "3D Vector" },
              }),
            ],
          }),
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "Size",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Mesh" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Size",
                return: { c: "3D Vector" },
              }),
            ],
          })
        ),
      },
    })
    .createClass({
      name: "3D Vector",
      super: "Object",
      attributes: {},
      methods: {
        Constructor: builder.createMethod(
          "3D Vector",
          "Constructor",
          ["x", "y", "z"],
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "x",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Vector" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "x",
                return: { c: "Float" },
              }),
            ],
          }),
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "y",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Vector" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "y",
                return: { c: "Float" },
              }),
            ],
          }),
          builder.createBlock({
            opcode: "Set Attribute",
            attribute: "z",
            children: [
              builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
                return: { c: "3D Vector" },
              }),
              builder.createBlock({
                opcode: "Get Variable",
                variable: "z",
                return: { c: "Float" },
              }),
            ],
          })
        ),
      },
    });
};
