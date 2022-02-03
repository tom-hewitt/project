import { code } from "../code";
import { LibraryCodeBuilder } from "../code/builder";

export type library = (builder: LibraryCodeBuilder) => void;

export const libraryCode: code = {
  classes: {},
  functions: {},
  blocks: {},
};

export function getLibraryClass(libraries: library[]) {}
