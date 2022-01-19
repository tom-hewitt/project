import { cloneDeep } from "lodash";
import { library, loadLibraries } from "./library";
import {
  astRef,
  blockArgs,
  blockRef,
  code,
  funcRef,
  objArgs,
  sourceCode,
} from "../code";

/**
 * Maps a variable name to it's runtime ID string
 */
export interface scope {
  [key: string]: Obj;
}

/**
 * An Object - used to represent everything in the program
 */
export abstract class Obj {
  attributes: { [key: string]: Obj } = {};

  abstract getClass(): string;
}

/**
 * An Instance of a regular class
 */
export class Instance extends Obj {
  c: string;

  constructor(c: string) {
    super();
    this.c = c;
  }

  getClass = () => this.c;
}

/**
 * An Object representing a boolean value
 */
export class BooleanObj extends Obj {
  value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }

  getClass = () => "Boolean";
}

/**
 * An Object representing a string value
 */
export class StringObj extends Obj {
  value: string;

  constructor(value: string) {
    super();

    this.value = value;
  }

  getClass = () => "String";
}

/**
 * An object representing an integer value
 */
export class IntegerObj extends Obj {
  value: number;

  constructor(value: number) {
    super();

    this.value = value;
  }

  getClass = () => "Integer";
}

/**
 * An Object representing an array
 */
export class ArrayObj extends Obj {
  value: Obj[];

  constructor(value: Obj[]) {
    super();

    this.value = value;
  }

  getClass = () => "Array";
}

/**
 * Represents a block that interrupts the regular control flow
 */

export abstract class Interrupt {}

/**
 * Interrupt to return a value from a function
 */
export class ReturnInterrupt extends Interrupt {
  obj: Obj;

  constructor(obj: Obj) {
    super();
    this.obj = obj;
  }
}

/**
 * Interrupt to break a loop
 */
export class BreakInterrupt extends Interrupt {}

/**
 * Tries to narrow the type of a potential obj to an obj, and
 * throws an error if it isn't one
 * @param obj the potential obj
 * @param err the error message
 * @returns an obj
 */
export const asObj = (
  obj: Obj | Interrupt | null,
  err: string = `${obj} is not an object`
): Obj => {
  if (obj instanceof Obj) {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asBoolean = (
  obj: Obj,
  err: string = `${obj.toString()} is not a Boolean`
): BooleanObj => {
  if (obj instanceof BooleanObj) {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asString = (
  obj: Obj,
  err: string = `${obj.toString()} is not a String`
): StringObj => {
  if (obj instanceof StringObj) {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asInteger = (
  obj: Obj,
  err: string = `${obj.toString()} is not an Integer`
): IntegerObj => {
  if (obj instanceof IntegerObj) {
    return obj;
  } else {
    throw new Error(err);
  }
};

export const asArray = (
  obj: Obj,
  err: string = `${obj.toString()} is not an Array`
): ArrayObj => {
  if (obj instanceof ArrayObj) {
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
   * Prepares an interpreter to be run
   * @param code the code to interpret
   */
  constructor(code: sourceCode, ...libraries: library[]) {
    // Deep clone the source code so it doesn't get altered
    this.code = cloneDeep(code);

    // Load the libraries
    loadLibraries(this.code, ...libraries);
  }

  /**
   * Runs the code
   */
  run = () => {
    // Execute the "Main" function, which is the entry point of the
    // program. There is no outer scope because the main function
    // is the outermost scope of the program
    this.evalAST({}, { astID: "Main" });
  };

  /**
   * Evaluates the given AST
   * @param outerScope the scope outside the AST
   * @param astRef reference to the AST to be executed
   */
  evalAST = (outerScope: scope, astRef: astRef): Interrupt | null => {
    // Get the AST from the code
    const ast = this.code.asts[astRef.astID];

    // Make a copy of the scope, so inner scope variables don't
    // get added to the outer scope
    const scope = { ...outerScope };

    // Evaluate each block
    for (const blockRef of ast.blocks) {
      const val = this.evalBlock(blockRef, scope);

      // If there is an interrupt, return it
      if (val instanceof Interrupt) {
        return val;
      }
    }

    // If there wasn't an interrupt, return null
    return null;
  };

  /**
   * Evaluates the given function, AST or Foreign
   * @param funcRef a reference to the function
   * @param args the argument objects to give to the function
   * @returns an obj or null
   */
  evalFunc = (funcRef: funcRef, args: objArgs = {}): Obj | null => {
    // Get the function from the code
    const func = this.code.functions[funcRef.funcID];

    switch (func.type) {
      case "AST": {
        // Evaluate the AST with the args as scope
        const val = this.evalAST(args, func.ast);

        // If a value is returned from the AST, return it
        if (val instanceof ReturnInterrupt && val.obj) {
          return val.obj;
        }

        // If no value is returned, return null
        return null;
      }
      case "Foreign": {
        // Execute the foreign function and return the result
        return func.execute(args, {
          getAttribute: this.getAttribute,
          setAttribute: this.setAttribute,
          callFunction: this.evalFunc,
          callMethod: this.evalMethod,
        });
      }
    }
  };

  /**
   * Evaluates the given Block. Blocks can evaluate to an obj,
   * an interrupt, or null.
   * @param blockRef reference to the block to be executed
   * @param scope the scope, containing variables defined at
   * this point in the program
   * @returns an obj, interrupt or null
   */
  evalBlock = (
    blockRef: blockRef,
    scope: scope = {}
  ): Obj | Interrupt | null => {
    // Get the block from the code
    const block = this.code.blocks[blockRef.blockID];

    if (!block) {
      throw new Error(`Block is undefined: ${blockRef.blockID}`);
    }

    switch (block.opcode) {
      case "Boolean": {
        // Return a boolean object
        return new BooleanObj(block.value);
      }
      case "String": {
        // Return a string object
        return new StringObj(block.value);
      }
      case "Integer": {
        // Return an integer object
        return new IntegerObj(block.value);
      }
      case "Array": {
        // Evaluate the items
        const items = block.value.map((blockRef) =>
          asObj(this.evalBlock(blockRef, scope))
        );

        // Return an array object
        return new ArrayObj(items);
      }
      case "Construct": {
        return this.constructInstance(
          block.c,
          this.evalArgs(block.arguments, scope)
        );
      }
      case "Set Variable": {
        // Recursively evaluate the block representing the new value
        const obj = asObj(
          this.evalBlock(block.to, scope),
          `Set variable value didn't evaluate to an obj`
        );

        // Set the variable
        scope[block.variable] = obj;

        return null;
      }
      case "Get Variable": {
        // Return the runtime object
        return scope[block.variable];
      }
      case "Set Attribute": {
        const obj = asObj(this.evalBlock(block.object, scope));

        const to = asObj(this.evalBlock(block.to, scope));

        this.setAttribute(obj, block.attribute, to);

        return null;
      }
      case "Get Attribute": {
        const obj = asObj(this.evalBlock(block.object, scope));

        return this.getAttribute(obj, block.attribute);
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
          `Method object didn't evaluate to an obj in block: ${JSON.stringify(
            block
          )}`
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
        const condition = asBoolean(
          asObj(this.evalBlock(block.condition, scope))
        );

        if (condition.value) {
          // If the condition is true, evaluate the "then" AST
          return this.evalAST(scope, block.then);
        } else {
          // Otherwise, evaluate the "else" AST, if it exists
          if (block.else) {
            return this.evalAST(scope, block.else);
          }
        }

        return null;
      }
      case "While": {
        while (true) {
          // Re-evaluate the condition each loop
          const condition = asBoolean(
            asObj(this.evalBlock(block.condition, scope))
          );

          if (condition.value) {
            // If the condition is true, evaluate the inner loop AST
            const val = this.evalAST(scope, block.inner);

            if (val instanceof BreakInterrupt) {
              // If there is a break interrupt, break from the loop
              break;
            } else if (val instanceof ReturnInterrupt) {
              // If there is a return interrupt, break from the loop
              // and return the interrupt
              return val;
            }
          } else {
            // If the condition is false, break from the loop
            break;
          }
        }

        return null;
      }
      case "For": {
        const array = asArray(asObj(this.evalBlock(block.array, scope))).value;

        // For each item in the array
        for (const obj of array) {
          // Create a variable for the current object
          const loopScope = {
            ...scope,
            [block.variable]: obj,
          };

          // Evaluate the inner loop AST
          const val = this.evalAST(loopScope, block.inner);

          if (val instanceof BreakInterrupt) {
            // If there is a break interrupt, break from the loop
            break;
          } else if (val instanceof ReturnInterrupt) {
            // If there is a return interrupt, break from the loop
            // and return the interrupt
            return val;
          }
        }

        return null;
      }
      case "Break": {
        return { type: "Interrupt", interrupt: "Break" };
      }
      case "Do Next Frame": {
        // Executes on the next available screen repaint
        requestAnimationFrame((time: number) => {
          // Create the time elapsed variable
          const innerScope: scope = {
            ...scope,
            "Elapsed Time": new IntegerObj(time),
          };

          // Evaluate the inner AST
          this.evalAST(innerScope, block.inner);
        });

        return null;
      }
    }
  };

  /**
   * Gets the child object at the given attribute
   * @param obj the parent object
   * @param attr the attribute
   * @returns the child object
   */
  getAttribute = (obj: Obj, attr: string): Obj => {
    // Make sure the attribute exists
    if (attr in obj.attributes) {
      // Get the attribute
      return obj.attributes[attr];
    } else {
      // If the attribute doesn't exist
      throw new Error(`Object doesn't have attribute ${attr}: ${obj}`);
    }
  };

  setAttribute = (obj: Obj, attr: string, to: Obj) => {
    // Set the attribute
    obj.attributes[attr] = to;
  };

  /**
   * Gets a function reference given the class and the method name
   * @param c the class
   * @param method the method name
   * @returns the function reference
   */
  getMethodFunc = (
    c: string,
    method: string,
    err: string = `Class ${c} doesn't have a method called ${method}`
  ): funcRef => {
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
  };

  /**
   * Evaluates a method using the given object
   * @param obj the object to call the method on
   * @param method the method name
   * @param args the argument objects
   * @returns
   */
  evalMethod = (obj: Obj, method: string, args: objArgs = {}): Obj | null => {
    // Look up the right function based on the class and the method name
    const funcRef = this.getMethodFunc(obj.getClass(), method);

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
  evalArgs = (args: blockArgs, scope: scope): objArgs => {
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
  };

  /**
   * Constructs an instance object of the given class
   * @param c the class
   * @param args arguments to give to the constructor
   * @returns
   */
  constructInstance = (c: string, args: objArgs): Obj => {
    // Get the class definition from the code
    const classDef = this.code.classes[c];

    // Throw an error if it doesn't exist
    if (!classDef) {
      throw new Error(`Class doesn't exist: ${c}`);
    }

    // Get the right class to construct.
    // If it is a foreign class definition, it will have a
    // special class
    const Construct =
      classDef.type === "Foreign" ? classDef.Construct : Instance;

    // Create the instance, initially with no attributes
    const obj = new Construct(c);

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
  };
}
