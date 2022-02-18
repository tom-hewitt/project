import produce from "immer";
import { nanoid } from "nanoid";
import create from "zustand";
import createContext from "zustand/context";
import { childBlockRef, code, funcRef, method } from "../code";

export interface Runtime {
  code: code;
  objects: Objects;
}

interface RuntimeStore extends Runtime {
  update: (callback: (runtime: Runtime) => void) => void;
}

interface Objects {
  [key: string]: obj;
}

export interface obj {
  c: string;
  attributes: {
    [key: string]: objRef;
  };
  value?: any;
  refCount: number;
}

export interface objRef {
  type: "Reference";
  objID: string;
}

interface scope {
  [key: string]: objRef;
}

type interrupt = returnInterrupt | breakInterrupt;

interface returnInterrupt {
  type: "Interrupt";
  interrupt: "Return";
  objRef?: objRef;
}

interface breakInterrupt {
  type: "Interrupt";
  interrupt: "Break";
}

const { Provider: RuntimeProvider, useStore: useRuntime } =
  createContext<RuntimeStore>();

const createRuntime = (initial: Runtime) => () =>
  create<RuntimeStore>(() => ({
    ...initial,
    update: () => {},
  }));

export { RuntimeProvider, useRuntime, createRuntime };

export const useObject = (objRef: objRef) =>
  useRuntime((store) => store.objects[objRef.objID]);

export const constructObject = (
  runtime: Runtime,
  c: string,
  attributes: { [key: string]: objRef } = {},
  value: any = undefined
): objRef => {
  const objID = nanoid();

  const obj = {
    c,
    attributes,
    value,
    refCount: 0,
  };

  for (const [name, attribute] of Object.entries(
    runtime.code.classes[c].attributes
  )) {
    if (attribute.blockRef.type === "Concrete") {
      obj.attributes[name] = asObjRef(evalBlock(runtime, attribute.blockRef));
    }
  }

  runtime.objects[objID] = obj;

  return { type: "Reference", objID };
};

const addReference = (runtime: Runtime, objRef: objRef) => {
  const obj = getObject(runtime, objRef);
  obj.refCount++;
};

const removeReference = (runtime: Runtime, objRef: objRef) => {
  const obj = getObject(runtime, objRef);
  obj.refCount--;

  if (obj.refCount === 0) {
    console.log(
      `DEALLOCATE: ${JSON.stringify(runtime.objects[objRef.objID], null, 2)}`
    );
    // delete runtime.objects[objRef.objID];
  }
};

export const getObject = (runtime: Runtime, objRef: objRef): obj => {
  return runtime.objects[objRef.objID];
};

export const asObjRef = (objRef: objRef | interrupt | null): objRef => {
  if (!objRef || objRef.type === "Interrupt") {
    throw new Error(`${JSON.stringify(objRef)} is not an objRef`);
  }

  return objRef;
};

export const evalBlock = (
  runtime: Runtime,
  blockRef: childBlockRef,
  scope: scope = {}
): objRef | interrupt | null => {
  if (blockRef.type === "Placeholder") {
    throw new Error("Can't execute placeholder block");
  }

  if (blockRef.type === "Abstract") {
    throw new Error("Can't execute abstract block");
  }

  const block = runtime.code.blocks[blockRef.blockID];

  if (!block) {
    throw new Error(`Block is undefined: ${blockRef.blockID}`);
  }

  switch (block.opcode) {
    case "Sequence": {
      // for (const objRef of Object.values(scope)) {
      //   addReference(runtime, objRef);
      // }

      const deallocate = () => {
        for (const objRef of Object.values(scope)) {
          removeReference(runtime, objRef);
        }
      };

      for (const blockRef of block.children) {
        const val = evalBlock(runtime, blockRef, scope);

        if (val && val.type === "Interrupt") {
          // deallocate();
          return val;
        }
      }

      // deallocate();
      return null;
    }
    case "Boolean": {
      // Return a boolean object
      return constructObject(runtime, "Boolean", {}, block.value);
    }
    case "Integer": {
      // Return an integer object
      return constructObject(runtime, "Integer", {}, block.value);
    }
    case "Float": {
      return constructObject(runtime, "Float", {}, block.value);
    }
    case "String": {
      // Return a string object
      return constructObject(runtime, "String", {}, block.value);
    }
    case "Array": {
      // Evaluate the items
      const items = block.children.map((blockRef) =>
        evalBlock(runtime, blockRef)
      );

      // Return an array object
      return constructObject(runtime, "Array", {}, items);
    }
    case "Construct": {
      const objRef = constructObject(runtime, block.c);

      const obj = getObject(runtime, objRef);

      // Evaluate the arguments
      const args = block.children.map((blockRef) => {
        const objRef = evalBlock(runtime, blockRef, scope);
        return asObjRef(objRef);
      });

      evalMethod(runtime, objRef, block.c, "Constructor", args);

      return objRef;
    }
    case "Set Variable": {
      // Recursively evaluate the block representing the new value
      const objRef = asObjRef(evalBlock(runtime, block.children[0], scope));

      // Increase the reference count
      addReference(runtime, objRef);

      // Set the variable
      scope[block.variable] = objRef;

      return null;
    }
    case "Get Variable": {
      // Return the runtime object
      return scope[block.variable];
    }
    case "Set Attribute": {
      const objRef = asObjRef(evalBlock(runtime, block.children[0], scope));

      const obj = getObject(runtime, objRef);

      const toRef = asObjRef(evalBlock(runtime, block.children[1], scope));

      if (obj.attributes[block.attribute] !== toRef) {
        addReference(runtime, toRef);

        obj.attributes[block.attribute] = toRef;
      }

      return null;
    }
    case "Get Attribute": {
      const objRef = asObjRef(evalBlock(runtime, block.children[0], scope));

      const obj = getObject(runtime, objRef);

      return obj.attributes[block.attribute];
    }
    case "Function Call": {
      // Evaluate the arguments
      const argArray = block.children.map((blockRef) =>
        asObjRef(evalBlock(runtime, blockRef, scope))
      );

      const func = runtime.code.functions[block.function.funcID];

      const args: { [key: string]: objRef } = {};

      for (let i = 0; i < func.params.length; i++) {
        args[func.params[i]] = argArray[i];
      }

      // Evaluate the Function
      return evalFunc(runtime, block.function, args);
    }
    case "Method Call": {
      // Evaluate the object block
      const objRef = asObjRef(evalBlock(runtime, block.children[0], scope));

      // Evaluate the arguments
      const args = block.children
        .slice(1)
        .map((blockRef) => asObjRef(evalBlock(runtime, blockRef, scope)));

      // Evaluate the method
      return evalMethod(runtime, objRef, block.c, block.method, args);
    }
    case "Return": {
      // If there is a block to return, evaluate it
      if (block.children?.[0]) {
        const objRef = asObjRef(evalBlock(runtime, block.children[0], scope));

        // Return a return interrupt with the obj
        return { type: "Interrupt", interrupt: "Return", objRef };
      }

      // If not, return a return interrupt with no obj
      return { type: "Interrupt", interrupt: "Return" };
    }
    case "If": {
      // Evaluate the condition block
      const condition = getObject(
        runtime,
        asObjRef(evalBlock(runtime, block.children[0], scope))
      );

      if (condition.value) {
        // If the condition is true, evaluate the "then" AST
        return evalBlock(runtime, block.children[1], scope);
      } else {
        // Otherwise, evaluate the "else" AST, if it exists
        if (block.children[2]) {
          return evalBlock(runtime, block.children[2], scope);
        }
      }

      return null;
    }
    case "While": {
      while (true) {
        // Re-evaluate the condition each loop
        const condition = getObject(
          runtime,
          asObjRef(evalBlock(runtime, block.children[0], scope))
        );

        if (condition.value) {
          // If the condition is true, evaluate the inner loop AST
          const val = evalBlock(runtime, block.children[0], scope);

          if (val && "interrupt" in val) {
            if (val.interrupt === "Break") {
              // If there is a break interrupt, break from the loop
              break;
            } else if (val.interrupt === "Return") {
              // If there is a return interrupt, break from the loop
              // and return the interrupt
              return val;
            }
          }
        } else {
          // If the condition is false, break from the loop
          break;
        }
      }

      return null;
    }
    case "For": {
      const array: objRef[] = getObject(
        runtime,
        asObjRef(evalBlock(runtime, block.children[0], scope))
      ).value;

      // For each item in the array
      for (const obj of array) {
        // Evaluate the inner loop AST, with the variable for the current object
        const val = evalBlock(runtime, block.children[1], {
          ...scope,
          [block.variable]: obj,
        });

        if (val && "interrupt" in val) {
          if (val.interrupt === "Break") {
            // If there is a break interrupt, break from the loop
            break;
          } else if (val.interrupt === "Return") {
            // If there is a return interrupt, break from the loop
            // and return the interrupt
            return val;
          }
        }
      }

      return null;
    }
    case "Break": {
      return { type: "Interrupt", interrupt: "Break" };
    }
    case "Do Next Frame": {
      // // Executes on the next available screen repaint
      // requestAnimationFrame((time: number) => {
      //   // Create the time elapsed variable
      //   const innerScope: scope = {
      //     ...scope,
      //     "Elapsed Time": new IntegerObj(time),
      //   };

      //   // Evaluate the inner AST
      //   this.evalAST(innerScope, block.inner);
      // });

      return null;
    }
  }
};

const evalFunc = (
  runtime: Runtime,
  funcRef: funcRef,
  args: { [key: string]: objRef }
): objRef | null => {
  const func = runtime.code.functions[funcRef.funcID];

  if (func.type === "AST") {
    const val = evalBlock(runtime, func.block, args);

    if (val && "interrupt" in val) {
      if (val.interrupt === "Return" && val.objRef) {
        return val.objRef;
      }
    }
  }

  return null;
};

export const getMethods = (
  code: code,
  c: string
): { [key: string]: method } => {
  const classDef = code.classes[c];

  if (classDef.super) {
    return {
      ...getMethods(code, classDef.super),
      ...classDef.methods,
    };
  } else {
    return classDef.methods;
  }
};

const evalMethod = (
  runtime: Runtime,
  Self: objRef,
  c: string,
  name: string,
  argArray: objRef[]
): objRef | null => {
  const obj = getObject(runtime, Self);

  const { funcRef } = getMethods(runtime.code, c)[name];

  const func = runtime.code.functions[funcRef.funcID];

  const args: { [key: string]: objRef } = {};

  for (let i = 0; i < func.params.length; i++) {
    args[func.params[i]] = argArray[i];
  }

  return evalFunc(runtime, funcRef, { Self, ...args });
};
