export type obj = booleanObj | integerObj | arrayObj | object3DObj;

export interface objs {
  [key: string]: obj;
}

export interface booleanObj {
  c: "Boolean";
  value: boolean;
}

export interface integerObj {
  c: "Integer";
  value: number;
}

export interface arrayObj {
  c: "Array";
  value: obj[];
}

export interface object3DObj {
  c: "Object 3d";
  attributes: {
    children: object3DObj[];
  };
}
