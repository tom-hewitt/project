import { classDef } from ".";

export interface nativeClass extends classDef {
  native: {
    [key: string]: unknown;
  };
}
