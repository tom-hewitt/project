import * as THREE from "three";
import { Obj } from "../interpreter";
import { createClass } from "../old/project/class";
import { library } from "../interpreter/library";

/**
 * 3D Renderer foreign class
 */
export class Renderer3D extends Obj {
  // The 3D scene to render
  scene = new THREE.Scene();

  // The WebGL renderer
  renderer: THREE.WebGLRenderer;

  // The camera to use when rendering
  camera: THREE.Camera;

  constructor(canvas: HTMLCanvasElement) {
    super();

    // Setup the camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Setup the renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  getClass = () => "3D Renderer";

  /**
   * Renders the 3D scene
   */
  render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Sets the root as the only child of the three.js scene
   * @param obj the root object
   */
  setThreeRoot = (obj: Obj3D) => {
    this.scene.children = [obj.three];
  };
}

/**
 * 3D Object foreign class
 */
export class Obj3D extends Obj {
  three = new THREE.Object3D();

  getClass = () => "3D Object";
}

export class Mesh extends Obj3D {
  three: THREE.Mesh = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );

  getClass = () => "Mesh";
}

export class Light extends Obj3D {
  three: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff);

  getClass = () => "Light";
}

/**
 * Tries to narrow the class of an object to a 3D renderer,
 * and throws an error if it can't
 * @param obj the object
 * @returns the 3D renderer instance
 */
const as3DRenderer = (obj: Obj) => {
  if (obj instanceof Renderer3D) {
    return obj;
  } else {
    throw new Error();
  }
};

/**
 * Tries to narrow the class of an object to a 3D object,
 * and throws an error if it can't
 * @param obj the object
 * @returns the 3D object instance
 */
const as3DObject = (obj: Obj) => {
  if (obj instanceof Obj3D) {
    return obj;
  } else {
    throw new Error();
  }
};

export const library3D =
  (canvas: HTMLCanvasElement): library =>
  (builder) => {
    builder
      .createClass({
        name: "3D Renderer",
        super: "Object",
        type: "Foreign",
        // Passes the HTML canvas to the renderer
        Construct: class CanvasRenderer3D extends Renderer3D {
          constructor() {
            super(canvas);
          }
        },
        methods: {
          Constructor: builder.createMethod(
            // Set the Root attribute
            builder.createBlock({
              opcode: "Method Call",
              object: builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
              }),
              method: "Set Root",
              arguments: {
                Value: builder.createBlock({
                  opcode: "Get Variable",
                  variable: "Root",
                }),
              },
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
            // Call the render method
            builder.createBlock({
              opcode: "Method Call",
              object: builder.createBlock({
                opcode: "Get Variable",
                variable: "Self",
              }),
              method: "Render",
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
          Render: builder.createForeignMethod(({ Self }) => {
            const self = as3DRenderer(Self);

            self.render();

            return null;
          }),
          "Set Root": builder.createForeignMethod(({ Self, Value }) => {
            const self = as3DRenderer(Self);

            const root = as3DObject(Value);

            self.attributes.Root = root;

            self.setThreeRoot(root);

            return null;
          }),
        },
      })
      .createClass({
        name: "3D Object",
        super: "Object",
        type: "Foreign",
        Construct: Obj3D,
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
          "Add Child": builder.createForeignMethod(({ Self, Child }) => {
            const self = as3DObject(Self);
            const child = as3DObject(Child);

            self.three.add(child.three);

            return null;
          }),
        },
      })
      .createClass({
        name: "Mesh",
        super: "3D Object",
        type: "Foreign",
        Construct: Mesh,
        methods: {
          Constructor: builder.createMethod(),
        },
      });
  };
