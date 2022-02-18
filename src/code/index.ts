import { obj } from "../interpreter";

/**
 * The structure of code, including libraries
 */
export interface code {
  classes: { [key: string]: classDef };
  functions: { [key: string]: func };
  blocks: { [key: string]: block };
}
/**
 * The structure of code that can be executed by the interpreter.
 * Has a Main Function.
 */
export interface executableCode extends code {
  blocks: { [key: string]: executableBlock };
}

/**
 * The structure of code that can be created by the user.
 * The user can't create foreign functions or primitive classes
 */
export interface sourceCode extends code {
  classes: { Program: classDef; [key: string]: classDef };
  functions: { [key: string]: blockFunc };
}

/**
 * A Class Definition
 */
export interface classDef {
  name: string;
  super?: string;
  methods: { [key: string]: method };
  attributes: { [key: string]: attribute };
}

export interface attribute {
  inheritedFrom: string;
  blockRef: childBlockRef;
}

export interface method {
  inheritedFrom: string;
  funcRef: funcRef;
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
export type func = blockFunc | foreignFunc;

/**
 * A regular function made up of blocks
 */
export interface blockFunc {
  type: "AST";
  block: concreteBlockRef;
  name: string;
  params: string[];
}

/**
 * A Foreign Function implemented in another language
 */
export interface foreignFunc {
  name: string;
  type: "Foreign";
  execute: executeForeignFunc;
  params: string[];
}

export type executeForeignFunc = (
  args: { [key: string]: obj },
  callbacks: {
    getAttribute: (obj: obj, attribute: string) => obj;
    setAttribute: (obj: obj, attribute: string, to: obj) => void;
    callMethod: (obj: obj, method: string, args?: objArgs) => obj | null;
    callFunction: (funcRef: funcRef, args?: objArgs) => obj | null;
  }
) => obj | null;

export type blockArgs = { [key: string]: childBlockRef };

export type objArgs = { [key: string]: obj };

export type typeDef = {
  c: string;
  generics?: { [key: string]: typeDef };
  inferrable?: boolean;
};

export type block = executableBlock;

/**
 * A Block
 */
export type executableBlock =
  | sequenceBlock
  | booleanBlock
  | integerBlock
  | floatBlock
  | stringBlock
  | arrayBlock
  | setVariableBlock
  | getVariableBlock
  | setAttributeBlock
  | getAttributeBlock
  | functionCallBlock
  | methodCallBlock
  | returnBlock
  | constructBlock
  | ifBlock
  | whileBlock
  | forBlock
  | breakBlock
  | doNextFrameBlock;

/**
 * A reference to a Block in the code
 */
export type childBlockRef =
  | concreteBlockRef
  | abstractBlockRef
  | placeholderChildBlockRef;

export interface concreteBlockRef {
  type: "Concrete";
  blockID: string;
  return?: typeDef;
}

export interface abstractBlockRef {
  type: "Abstract";
  block: block;
  return?: typeDef;
}

export interface placeholderChildBlockRef {
  type: "Placeholder";
  return?: typeDef;
}

interface baseBlock {
  children?: childBlockRef[];
  return?: typeDef;
}

export interface sequenceBlock extends baseBlock {
  opcode: "Sequence";
  children: concreteBlockRef[];
  return?: undefined;
}

/**
 * A primitive block that evaluates to a boolean object
 */
export interface booleanBlock extends baseBlock {
  opcode: "Boolean";
  value: boolean;
  return: {
    c: "Boolean";
    inferrable?: false;
    generics?: undefined;
  };
}

/**
 * A primitive block that evaluates to a string object
 */
export interface integerBlock extends baseBlock {
  opcode: "Integer";
  value: number;
  return: {
    c: "Integer";
    inferrable?: false;
    generics?: undefined;
  };
}

/**
 * A primitive block that evaluates to a float object
 */
export interface floatBlock extends baseBlock {
  opcode: "Float";
  value: number;
  return: {
    c: "Float";
    inferrable?: false;
    generics?: undefined;
  };
}

/**
 * A primitive block that evaluates to a string object
 */
export interface stringBlock extends baseBlock {
  opcode: "String";
  value: string;
  return: {
    c: "String";
    inferrable?: false;
    generics?: undefined;
  };
}

/**
 * A primitive block that evaluates to an array object
 */
export interface arrayBlock extends baseBlock {
  opcode: "Array";
  children: childBlockRef[];
  return: {
    c: "Array";
    generics: { item: typeDef };
    inferrable?: false;
  };
}

/**
 * A block used to construct an instance of a class using its
 * constructor method
 */
export interface constructBlock extends baseBlock {
  opcode: "Construct";
  c: string;
  children: childBlockRef[];
  return: typeDef;
}

/**
 * A block used to set the object represented by a variable
 */
export interface setVariableBlock extends baseBlock {
  opcode: "Set Variable";
  variable: string;
  children: [childBlockRef];
  return?: undefined;
}

/**
 * A block used to get the object represented by a variable
 */
export interface getVariableBlock extends baseBlock {
  opcode: "Get Variable";
  variable: string;
  return: typeDef;
}

/**
 * A block used to set an object attribute
 */
export interface setAttributeBlock extends baseBlock {
  opcode: "Set Attribute";
  attribute: string;
  // [Object, To]
  children: [childBlockRef, childBlockRef];
  return?: undefined;
}

/**
 * A block used to get an object attribute
 */
export interface getAttributeBlock extends baseBlock {
  opcode: "Get Attribute";
  attribute: string;
  children: [childBlockRef];
  return: typeDef;
}

/**
 * A block that calls a function
 */
export interface functionCallBlock extends baseBlock {
  opcode: "Function Call";
  function: funcRef;
  arguments: { [key: string]: number };
  children: childBlockRef[];
}

/**
 * A block that calls an object method
 */
export interface methodCallBlock extends baseBlock {
  opcode: "Method Call";
  c: string;
  method: string;
  // [Object, ...args]
  children: childBlockRef[];
}

/**
 * A block that returns from a function
 */
export interface returnBlock extends baseBlock {
  opcode: "Return";
  children?: [childBlockRef];
  return?: undefined;
}

/**
 * A block representing an if statement
 */
export interface ifBlock extends baseBlock {
  opcode: "If";
  // [condition, then, else]
  children: [childBlockRef, childBlockRef, childBlockRef];
  return?: undefined;
}

/**
 * A block representing a while loop
 */
export interface whileBlock extends baseBlock {
  opcode: "While";
  // [condition, inner loop]
  children: [childBlockRef, childBlockRef];
  return?: undefined;
}

/**
 * A block representing a for loop.
 */
export interface forBlock extends baseBlock {
  opcode: "For";
  /**
   * The name of the variable to create to represent the
   * current item in the array
   */
  variable: string;
  // [array, inner loop]
  children: [childBlockRef, childBlockRef];
  return?: undefined;
}

/**
 * A block that breaks from a loop
 */
export interface breakBlock extends baseBlock {
  opcode: "Break";
  return?: undefined;
}

/**
 * A block representing an AST to execute on the next frame
 */
export interface doNextFrameBlock extends baseBlock {
  opcode: "Do Next Frame";
  // [inner block]
  children: [childBlockRef];
  return?: undefined;
}
