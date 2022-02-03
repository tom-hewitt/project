import { createArrayBlock } from "../project/blocks";
import { library } from "../project/library";

export const library3d: library = {
  classes: {
    "Object 3D": {
      id: "Object 3D",
      name: "Object 3D",
      attributes: {
        Children: {
          id: "Children",
          name: "Children",
          inheritedFrom: "Object 3D",
          type: {
            c: "Array",
            generics: { Item: { c: "Object 3D" } },
          },
          block: "constructChildrenArray",
        },
      },
      methods: {},
    },
    Renderer: {
      id: "Renderer",
      name: "Renderer",
      attributes: {
        Root: {
          id: "Root",
          name: "Root",
          inheritedFrom: "Renderer",
          type: { c: "Object 3D" },
        },
      },
      methods: {},
    },
  },
  blocks: {
    constructChildrenArray: createArrayBlock({ c: "Object 3D" }),
  },
};
