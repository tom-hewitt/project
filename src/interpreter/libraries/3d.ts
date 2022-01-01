import { library } from "../library";

export const library3D: library = {
  classes: {
    "3D Renderer": {
      name: "Renderer 3D",
      methods: {
        "Set Root Object": {
          type: "Foreign",
          execute: ({ Self }) => {
            return null;
          },
        },
      },
    },
    "3D Object": {
      name: "Object 3D",
      methods: {},
    },
    "Primitive 3D Object": {
      name: "Primitive Object 3D",
      methods: {},
    },
  },
  functions: {},
};
