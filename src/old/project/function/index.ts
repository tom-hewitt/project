import { astId } from "../ast";

export type functionId = string;

export interface func {
  name: string;
  ast: astId;
}

export interface nativeFunc {
  name: string;
  function: Function;
}
