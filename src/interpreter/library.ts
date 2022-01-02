import { code } from "./";
import { LibraryCodeBuilder } from "./code";

export type library = (builder: LibraryCodeBuilder) => void;

/**
 * Loads the libraries into the given code object
 * @param code the original code
 * @param libraries the libraries to load
 * @returns the code with the libraries loaded
 */
export const loadLibraries = (code: code, ...libraries: library[]) => {
  // For each library to load
  for (const library of libraries) {
    // Build and load the library
    library(new LibraryCodeBuilder(code));
  }
};
