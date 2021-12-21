import { sceneObjectId } from "../sceneObject";

export type type = "Vector 3D" | "3D Scene";

export type literal = literalVector3D;

export interface literalVector3D {
  type: "Vector 3D";
  value: vector3d;
}

export interface literal3DScene {
  type: "3D Scene";
  value: sceneObjectId;
}
