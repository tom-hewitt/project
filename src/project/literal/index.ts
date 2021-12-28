import { classId } from "../class";
import { objectId } from "../object";
import { sceneObjectId } from "../sceneObject";
import { arrayType, objectReferenceType, primitiveType, type } from "../type";

export type literal = literalVector3D | literalObjectReference | literalArray;

export type typedLiteral<T extends type> = baseLiteral & T;

export interface baseLiteral {
  value: unknown;
}

export interface literalVector3D extends primitiveType, baseLiteral {
  value: vector3d;
}

export interface literalObjectReference
  extends objectReferenceType,
    baseLiteral {
  value: objectId;
}

export interface literalArray<T extends type = type>
  extends arrayType,
    baseLiteral {
  itemType: T;
  value: typedLiteral<T>[];
}
