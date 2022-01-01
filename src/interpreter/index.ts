import { nanoid } from "nanoid";
import { cloneDeep } from "lodash";
import { standardLibrary } from "./libraries/standard";
import { loadLibraries } from "./library";

/**
 * The structure of code, including libraries
 */
export interface code {
  classes: { [key: string]: primitiveClassDef };
  asts: { [key: string]: ast };
  functions: { [key: string]: func };
  blocks: { [key: string]: block };
}

/**
 * The structure of code that can be executed by the interpreter.
 * Has a Main Function.
 */
export interface executableCode extends code {
  asts: { Main: ast; [key: string]: ast };
}

/**
 * The structure of code that can be created by the user.
 * The user can't create foreign functions or primitive classes
 */
export interface sourceCode extends executableCode {
  classes: { [key: string]: classDef };
  functions: { [key: string]: astFunc };
}

/**
 * A Primitive Class Definition
 * Primitive Classes don't need a constructor because they have their
 * own special block used to create instances
 */
export interface primitiveClassDef {
  name: string;
  super?: string;
  methods: { [key: string]: funcRef };
}

/**
 * A Class Definition that can be created by the user
 */
export interface classDef extends primitiveClassDef {
  methods: {
    Constructor: funcRef;
  };
}

/**
 * A reference to an AST in the code
 */
export type astRef = {
  astID: string;
};

/**
 * An Abstract Syntax Tree containing blocks
 */
export interface ast {
  /**
   * References to the sequence of top-level child blocks within this AST
   */
  blocks: blockRef[];
}

/**
 * A recursive representation of a variable/attribute
 */
export interface variableRef {
  name: string;
  /**
   * The child attribute that this reference is referring to
   */
  attribute?: variableRef;
}

/**
 * A reference to a function in the code
 */
export type funcRef = {
  funcID: string;
};

/**
 * A Function, either with an AST or foreign interface
 */
export type func = astFunc | foreignFunc;

/**
 * A regular function with an AST
 */
export interface astFunc {
  type: "AST";
  ast: astRef;
}

/**
 * A Foreign Function implemented in another language
 */
export interface foreignFunc {
  type: "Foreign";
  execute: (
    args: { [key: string]: obj },
    callMethod: (
      obj: obj,
      method: string,
      args?: { [key: string]: obj }
    ) => obj | null
  ) => obj | null;
}

export type blockArgs = { [key: string]: blockRef };

export type objArgs = { [key: string]: obj };

/**
 * A Block
 */
export type block =
  | booleanBlock
  | stringBlock
  | arrayBlock
  | setBlock
  | getBlock
  | functionCallBlock
  | methodCallBlock
  | returnBlock
  | constructBlock
  | ifBlock
  | whileBlock
  | breakBlock;

export type foreignBlock = booleanBlock | stringBlock | arrayBlock;

/**
 * A reference to a Block in the code
 */
export type blockRef = {
  blockID: string;
};

/**
 * A primitive block that evaluates to a boolean object
 */
export interface booleanBlock {
  opcode: "Boolean";
  value: boolean;
}

/**
 * A primitive block that evaluates to a string object
 */
export interface stringBlock {
  opcode: "String";
  value: string;
}

/**
 * A primitive block that evaluates to an array object
 */
export interface arrayBlock {
  opcode: "Array";
  value: blockRef[];
}

/**
 * A block used to construct an instance of a class using its
 * constructor method
 */
export interface constructBlock {
  opcode: "Construct";
  c: string;
  arguments: { [key: string]: blockRef };
}

/**
 * A block used to set a variable or attribute
 */
export interface setBlock {
  opcode: "Set";
  variable: variableRef;
  to: blockRef;
}

/**
 * A block used to get a variable or attribute
 */
export interface getBlock {
  opcode: "Get";
  variable: variableRef;
}

/**
 * A block that calls a function
 */
export interface functionCallBlock {
  opcode: "Function Call";
  function: funcRef;
  arguments: { [key: string]: blockRef };
}

/**
 * A block that calls an object method
 */
export interface methodCallBlock {
  opcode: "Method Call";
  object: blockRef;
  method: string;
  arguments: { [key: string]: blockRef };
}

/**
 * A block that returns from a function
 */
export interface returnBlock {
  opcode: "Return";
  block?: blockRef;
}

/**
 * A block representing an if statement
 */
export interface ifBlock {
  opcode: "If";
  condition: blockRef;
  then: astRef;
  else?: astRef;
}

/**
 * A block representing a while loop
 */
export interface whileBlock {
  opcode: "While";
  condition: blockRef;
  inner: astRef;
}

/**
 * A block that breaks from a loop
 */
export interface breakBlock {
  opcode: "Break";
}

/**
 * The data needed at runtime to interpret the program
 */
export interface runtime {
  variables: {
    [key: string]: obj;
  };
}

/**
 * The unique ID of a variable during the runtime.
 * Variables are stored by unique ID rather than name because
 * variables in different scopes could have the same name.
 */
export type runtimeID = string;

/**
 * Maps a variable name to it's runtime ID string
 */
export interface scope {
  [key: string]: runtimeID;
}

/**
 * An Object - used to represent everything in the program
 */
export type obj = instanceObj | booleanObj | stringObj | arrayObj;

/**
 * Base superclass for the objects to extend
 */
interface baseObj {
  c: string;
  attributes?: { [key: string]: obj };
}

/**
 * An Instance of a regular class
 */
export interface instanceObj extends baseObj {
  type: "Instance";
}

/**
 * An Object representing a boolean value
 */
export interface booleanObj extends baseObj {
  type: "Boolean";
  c: "Boolean";
  value: boolean;
}

/**
 * An Object representing a string value
 */
export interface stringObj extends baseObj {
  type: "String";
  c: "String";
  value: string;
}

/**
 * An Object representing an array
 */
export interface arrayObj extends baseObj {
  type: "Array";
  c: "Array";
  value: obj[];
}

/**
 * Represents a block that interrupts the regular control flow
 */
export type interrupt = returnInterrupt | breakInterrupt;

/**
 * Interrupt to return a value from a function
 */
export interface returnInterrupt {
  type: "Interrupt";
  interrupt: "Return";
  obj?: obj;
}

/**
 * Interrupt to break a loop
 */
export interface breakInterrupt {
  type: "Interrupt";
  interrupt: "Break";
}

/**
 * Tries to narrow the type of a potential obj to an obj, and
 * throws an error if it isn't one
 * @param obj the potential obj
 * @param err the error message
 * @returns an obj
 */
export const asObj = (
  obj: obj | interrupt | null,
  err: string = `${obj} is not an object`
): obj => {
  if (obj && obj.type !== "Interrupt") {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asBoolean = (
  obj: obj,
  err: string = `${obj.toString()} is not a Boolean`
): booleanObj => {
  if (obj.type === "Boolean") {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asString = (
  obj: obj,
  err: string = `${obj.toString()} is not a String`
): stringObj => {
  if (obj.type === "String") {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asArray = (
  obj: obj,
  err: string = `${obj.toString()} is not an Array`
): arrayObj => {
  if (obj.type === "Array") {
    return obj;
  } else {
    throw new Error(err);
  }
};

export class Interpreter {
  /**
   * The code to interpret
   */
  code: code;

  /**
   * Contains runtime data
   * @property variables - map of variable IDs to objects
   */
  runtime: runtime = {
    variables: {},
  };

  /**
   * Prepares an interpreter to be run
   * @param code the code to interpret
   */
  constructor(code: sourceCode) {
    // Deep clone the source code so it doesn't get altered
    this.code = cloneDeep(code);

    // Load the libraries
    loadLibraries(this.code, standardLibrary);
  }

  /**
   * Runs the code
   */
  run() {
    // Execute the "Main" function, which is the entry point of the
    // program. There is no outer scope because the main function
    // is the outermost scope of the program
    this.evalAST({}, { astID: "Main" });

    return this.runtime;
  }

  /**
   * Evaluates the given AST
   * @param outerScope the scope outside the AST
   * @param astRef reference to the AST to be executed
   */
  evalAST(outerScope: scope, astRef: astRef): interrupt | null {
    // Get the AST from the code
    const ast = this.code.asts[astRef.astID];

    // Make a copy of the scope, so inner scope variables don't
    // get added to the outer scope
    const scope = { ...outerScope };

    // Cleanup any new variables added to the scope inside the AST
    const cleanup = () => {
      for (const [name, id] of Object.entries(scope)) {
        // If the variable it is not also in the outer scope, it
        // must have been introduced inside the AST, so delete it
        if (!(name in outerScope)) {
          this.deleteObject(id);
        }
      }
    };

    // Evaluate each block
    for (const blockRef of ast.blocks) {
      const val = this.evalBlock(blockRef, scope);

      // If there is an interrupt, cleanup and return it
      if (val?.type === "Interrupt") {
        cleanup();
        return val;
      }
    }

    // If there wasn't an interrupt, cleanup after all blocks have
    // been evaluated, and return null
    cleanup();
    return null;
  }

  /**
   * Evaluates the given function, AST or Foreign
   * @param funcRef a reference to the function
   * @param args the argument objects to give to the function
   * @returns an obj or null
   */
  evalFunc(funcRef: funcRef, args: objArgs = {}): obj | null {
    // Get the function from the code
    const func = this.code.functions[funcRef.funcID];

    switch (func.type) {
      case "AST": {
        // Construct the scope to be given to the AST
        // Arguments are passed to the AST by adding them to the scope
        const scope: scope = Object.fromEntries(
          Object.entries(args).map(([name, obj]) => {
            const id = nanoid();
            this.runtime.variables[id] = obj;
            return [name, id];
          })
        );

        // Evaluate the AST
        const val = this.evalAST(scope, func.ast);

        // Cleanup argument variables
        for (const id of Object.values(scope)) {
          delete this.runtime.variables[id];
        }

        // If a value is returned from the AST, return it
        if (val?.interrupt === "Return" && val.obj) {
          return val.obj;
        }

        // If no value is returned, return null
        return null;
      }
      case "Foreign": {
        // Execute the foreign function and return the result
        return func.execute(args, this.evalMethod);
      }
    }
  }

  /**
   * Evaluates the given Block. Blocks can evaluate to an obj,
   * an interrupt, or null.
   * @param blockRef reference to the block to be executed
   * @param scope the scope, containing variables defined at
   * this point in the program
   * @returns an obj, interrupt or null
   */
  evalBlock(blockRef: blockRef, scope: scope = {}): obj | interrupt | null {
    // Get the block from the code
    const block = this.code.blocks[blockRef.blockID];

    if (!block) {
      throw new Error(`Block is undefined: ${blockRef.blockID}`);
    }

    switch (block.opcode) {
      case "Boolean": {
        // Return a boolean object
        return {
          type: "Boolean",
          c: "Boolean",
          value: block.value,
        };
      }
      case "String": {
        // Return a string object
        return {
          type: "String",
          c: "String",
          value: block.value,
        };
      }
      case "Array": {
        return {
          type: "Array",
          c: "Array",
          value: block.value.map((blockRef) =>
            asObj(this.evalBlock(blockRef, scope))
          ),
        };
      }
      case "Construct": {
        return this.constructInstance(
          block.c,
          this.evalArgs(block.arguments, scope)
        );
      }
      case "Set": {
        // Get the runtime ID of the variable to set
        const variableID = this.getVariableID(scope, block.variable);

        // Recursively evaluate the block representing the new value
        const obj = asObj(
          this.evalBlock(block.to, scope),
          `Set variable value didn't evaluate to an obj`
        );

        if (block.variable.attribute) {
          // If it is an attribute rather than a variable, set it
          this.setAttribute(
            this.runtime.variables[variableID],
            block.variable.attribute,
            obj
          );
        } else {
          // If it is a variable, set it
          this.runtime.variables[variableID] = obj;
        }

        return null;
      }
      case "Get": {
        // Get the variable
        const variableID = this.getVariableID(scope, block.variable);
        const variable = this.runtime.variables[variableID];

        if (block.variable.attribute) {
          // If it is an attribute, get it
          return this.getAttribute(variable, block.variable.attribute);
        } else {
          // Otherwise, return the variable
          return variable;
        }
      }
      case "Function Call": {
        // Evaluate the arguments
        const args = this.evalArgs(block.arguments, scope);

        // Evaluate the Function
        return this.evalFunc(block.function, args);
      }
      case "Method Call": {
        // Evaluate the object block
        const obj = asObj(
          this.evalBlock(block.object, scope),
          `Method object didn't evaluate to an obj`
        );

        // Evaluate the arguments
        const args = this.evalArgs(block.arguments, scope);

        // Evaluate the method
        return this.evalMethod(obj, block.method, args);
      }
      case "Return": {
        // If there is a block to return, evaluate it
        if (block.block) {
          const obj = asObj(
            this.evalBlock(block.block, scope),
            `Returned block didn't evaluate to an object`
          );

          // Return a return interrupt with the obj
          return { type: "Interrupt", interrupt: "Return", obj };
        }

        // If not, return a return interrupt with no obj
        return { type: "Interrupt", interrupt: "Return" };
      }
      case "If": {
        // Evaluate the condition block
        const condition = this.evalBlock(block.condition, scope);

        if (condition?.type === "Boolean") {
          if (condition.value) {
            // If the condition is true, evaluate the "then" AST
            // The evaluation must be returned there was a return
            // block executed within
            return this.evalAST(scope, block.then);
          } else {
            // Otherwise, evaluate the "else" AST, if it exists
            if (block.else) {
              return this.evalAST(scope, block.else);
            }
          }

          return null;
        } else {
          // If the condition isn't a boolean, throw an error
          throw new Error(
            `Condition block didn't evaluate to a boolean: ${block}`
          );
        }
      }
      case "While": {
        // Variable to know whether to loop again
        let loop = true;

        while (loop) {
          // Re-evaluate the condition each loop
          const condition = this.evalBlock(block.condition, scope);

          if (condition?.type === "Boolean") {
            if (condition.value) {
              // If the condition is true, evaluate the inner loop AST
              const val = this.evalAST(scope, block.inner);

              if (val?.interrupt === "Break") {
                // If there is a break interrupt, stop looping
                loop = false;
              } else if (val?.interrupt === "Return") {
                // If there is a return interrupt, return it to be handled
                // by the outer function
                return val;
              }
            } else {
              // If the condition is false
              loop = false;
            }
          }
        }

        return null;
      }
      case "Break": {
        return { type: "Interrupt", interrupt: "Break" };
      }
    }
  }

  /**
   * Obtains the runtime ID of the given variable in the given scope,
   * or creates a new ID if the variable doesn't exist
   * @param scope the scope to search within
   * @param variable the variable reference
   * @returns the runtime ID
   */
  getVariableID(scope: scope, variable: variableRef): runtimeID {
    if (variable.name in scope) {
      // If the variable has already been initialized, return the
      // id from the scope
      return scope[variable.name];
    } else {
      // Variable doesn't exist yet, so create it

      // Generate a unique ID and add it to the scope
      const variableID = nanoid();
      scope[variable.name] = variableID;

      // It will be added to the runtime variables in the set block eval

      return variableID;
    }
  }

  /**
   * Gets the child object at the given attribute
   * @param obj the parent object
   * @param attr the attribute
   * @returns the child object
   */
  getAttribute(obj: obj, attr: variableRef): obj {
    // Make sure the object has attributes
    if (obj.attributes) {
      if (attr.attribute) {
        // If we are looking for an attribute of the current attribute,
        // recurse
        return this.getAttribute(obj.attributes[attr.name], attr.attribute);
      } else {
        // Base case
        return obj.attributes[attr.name];
      }
    } else {
      // If the object doesn't have attributes, throw an error
      throw new Error(
        `Can't get attribute because the object has no attributes: ${obj}`
      );
    }
  }

  setAttribute(obj: obj, attr: variableRef, to: obj) {
    // Make sure the object has attributes
    if (obj.attributes) {
      if (attr.attribute) {
        // If we are looking for an attribute of the current attribute,
        // recurse
        this.setAttribute(obj.attributes[attr.name], attr.attribute, to);
      } else {
        // Base case
        obj.attributes[attr.name] = to;
      }
    } else {
      // If the object doesn't have attributes, throw an error
      throw new Error(
        `Can't set attribute because the object has no attributes: ${obj}`
      );
    }
  }

  deleteObject(id: runtimeID) {
    delete this.runtime.variables[id];
  }

  /**
   * Gets a function reference given the class and the method name
   * @param c the class
   * @param method the method name
   * @returns the function reference
   */
  getMethodFunc(
    c: string,
    method: string,
    err: string = `Class ${c} doesn't have a method called ${method}`
  ): funcRef {
    // Gets the class definition
    const classDef = this.code.classes[c];

    // Tries to get the function reference from the class definition.
    // Could fail if the function is defined in a superclass or doesn't exist
    const funcRef = classDef.methods[method];

    if (funcRef) {
      // If the function is defined on that class definition, return the ref
      return funcRef;
    } else {
      if (classDef.super) {
        // Recursively look for the method in the superclass
        return this.getMethodFunc(classDef.super, method, err);
      } else {
        // Throw an error if the method doesn't exist
        throw new Error(err);
      }
    }
  }

  /**
   * Evaluates a method using the given object
   * @param obj the object to call the method on
   * @param method the method name
   * @param args the argument objects
   * @returns
   */
  evalMethod = (obj: obj, method: string, args: objArgs = {}): obj | null => {
    // Look up the right function based on the class and the method name
    const funcRef = this.getMethodFunc(obj.c, method);

    // Add "Self" to the function arguments
    args.Self = obj;

    // Evaluate the function and return
    return this.evalFunc(funcRef, args);
  };

  /**
   * Evaluates a map of block arguments to a map of objects
   * @param args the block arguments
   * @param scope the scope to use
   * @returns a map of objects
   */
  evalArgs(args: blockArgs, scope: scope): objArgs {
    return Object.fromEntries(
      Object.entries(args).map(([name, blockRef]) => {
        // Evaluate each block
        const obj = asObj(
          this.evalBlock(blockRef, scope),
          `Function Parameter didn't evaluate to an object: ${name}`
        );

        // Replace it with the object
        return [name, obj];
      })
    );
  }

  /**
   * Constructs an instance object of the given class
   * @param c the class
   * @param args arguments to give to the constructor
   * @returns
   */
  constructInstance(c: string, args: objArgs): instanceObj {
    // Get the class definition from the code
    const classDef = this.code.classes[c];

    // Throw an error if it doesn't exist
    if (!classDef) {
      throw new Error(`Class doesn't exist: ${c}`);
    }

    // Create the instance, initially with no attributes
    const obj: instanceObj & { attributes: { [key: string]: obj } } = {
      type: "Instance",
      c,
      attributes: {},
    };

    // Call the "Defaults" method, which should set
    // attributes to their default value.
    // This method should be generated by the editor.
    if (classDef.methods.Defaults) {
      this.evalMethod(obj, "Defaults");
    }

    // Call the constructor method
    this.evalMethod(obj, "Constructor", args);

    // Return the instance
    return obj;
  }
}
