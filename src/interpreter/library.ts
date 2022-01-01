import { nanoid } from "nanoid";
import { block, code, func, funcRef } from "./";

/**
 * A Class defined in a library.
 * Functions and Blocks can be referred to directly, instead of by ID
 */
export interface libraryClass {
  name: string;
  super?: string;
  methods: {
    [key: string]: func;
  };
}

/**
 * An Attribute in a Library Class
 * Blocks can be referred to directly instead of by ID
 */
export interface libraryAttribute {
  name: string;
  default?: block;
}

/**
 * The structure of a library
 */
export interface library {
  classes: {
    [key: string]: libraryClass;
  };
  functions: {
    [key: string]: func;
  };
}

/**
 * Loads the libraries into the given code object
 * @param code the original code
 * @param libraries the libraries to load
 * @returns the code with the libraries loaded
 */
export const loadLibraries = (code: code, ...libraries: library[]) => {
  // For each library to load
  for (const library of libraries) {
    // Add all the standalone functions from the library
    for (const funcID in library.functions) {
      code.functions[funcID] = library.functions[funcID];
    }

    // Convert the library classes to regular classes and add them
    for (const [classID, classDef] of Object.entries(library.classes)) {
      code.classes[classID] = {
        name: classDef.name,
        super: classDef.super,
        // Convert the library methods to regular methods
        methods: Object.fromEntries(
          Object.entries(classDef.methods).map(
            ([name, func]): [string, funcRef] => {
              const funcID = nanoid();
              // Add the function to the code
              code.functions[funcID] = func;

              // Return the method with the function replaced by its ID
              return [name, { funcID }];
            }
          )
        ),
      };
    }
  }
};
