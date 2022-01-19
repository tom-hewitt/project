import { Obj } from "../interpreter";

/**
 * The structure of code, including libraries
 */
export interface code {
  classes: { [key: string]: classDef };
  asts: { [key: string]: ast };
  functions: { [key: string]: func };
  blocks: { [key: string]: block };
}

/**
 * The structure of code that can be executed by the interpreter.
 * Has a Main Function.
 */
export interface executableCode extends code {
  classes: { [key: string]: classDef };
  asts: { Main: ast; [key: string]: ast };
}

/**
 * The structure of code that can be created by the user.
 * The user can't create foreign functions or primitive classes
 */
export interface sourceCode extends executableCode {
  classes: { [key: string]: astClassDef };
  functions: { [key: string]: astFunc };
}

export type classDef = astClassDef | foreignClassDef;

/**
 * A Class Definition
 */
export interface astClassDef {
  name: string;
  super?: string;
  type?: "AST";
  methods: { [key: string]: funcRef };
}

/**
 * A foreign class definition
 */
export interface foreignClassDef {
  name: string;
  super?: string;
  type: "Foreign";
  Construct: new () => Obj;
  methods: { [key: string]: funcRef };
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
  execute: executeForeignFunc;
}

export type executeForeignFunc = (
  args: { [key: string]: Obj },
  callbacks: {
    getAttribute: (obj: Obj, attribute: string) => Obj;
    setAttribute: (obj: Obj, attribute: string, to: Obj) => void;
    callMethod: (obj: Obj, method: string, args?: objArgs) => Obj | null;
    callFunction: (funcRef: funcRef, args?: objArgs) => Obj | null;
  }
) => Obj | null;

export type blockArgs = { [key: string]: blockRef };

export type objArgs = { [key: string]: Obj };

/**
 * A Block
 */
export type block =
  | booleanBlock
  | stringBlock
  | integerBlock
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
 * A primitive block that evaluates to a string object
 */
export interface integerBlock {
  opcode: "Integer";
  value: number;
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
 * A block used to set the object represented by a variable
 */
export interface setVariableBlock {
  opcode: "Set Variable";
  variable: string;
  to: blockRef;
}

/**
 * A block used to get the object represented by a variable
 */
export interface getVariableBlock {
  opcode: "Get Variable";
  variable: string;
}

/**
 * A block used to set an object attribute
 */
export interface setAttributeBlock {
  opcode: "Set Attribute";
  object: blockRef;
  attribute: string;
  to: blockRef;
}

/**
 * A block used to get an object attribute
 */
export interface getAttributeBlock {
  opcode: "Get Attribute";
  object: blockRef;
  attribute: string;
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
 * A block representing a for loop.
 */
export interface forBlock {
  opcode: "For";
  /**
   * The name of the variable to create to represent the
   * current item in the array
   */
  variable: string;
  /**
   * The array to iterate over
   */
  array: blockRef;
  inner: astRef;
}

/**
 * A block that breaks from a loop
 */
export interface breakBlock {
  opcode: "Break";
}

/**
 * A block representing an AST to execute on the next frame
 */
export interface doNextFrameBlock {
  opcode: "Do Next Frame";
  inner: astRef;
}
