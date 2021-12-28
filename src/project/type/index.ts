import { classId } from "../class";

export type type = primitiveType | objectReferenceType | arrayType;

export type primitive =
  | "Boolean"
  | "Integer"
  | "Float"
  | "String"
  | "Vector 3D";

export interface primitiveType {
  type: "Primitive";
  primitive: primitive;
}

export interface objectReferenceType {
  type: "Object Reference";
  objectClass: classId;
}

export interface arrayType {
  type: "Array";
  itemType: type;
}
