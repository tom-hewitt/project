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
  blocks: { [key: string]: executableBlock };
  asts: { Main: ast; [key: string]: ast };
}

/**
 * The structure of code that can be created by the user.
 * The user can't create foreign functions or primitive classes
 */
export interface sourceCode extends code {
  classes: { [key: string]: astClassDef };
  functions: { [key: string]: astFunc };
  asts: { Main: ast; [key: string]: ast };
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
export type executableBlock =
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

export type block = executableBlock | placeholderBlock;

/**
 * A reference to a Block in the code
 */
export type blockRef = {
  blockID: string;
};

interface baseBlock {
  children?: blockRef[];
}

/**
 * A primitive block that evaluates to a boolean object
 */
export interface booleanBlock extends baseBlock {
  opcode: "Boolean";
  value: boolean;
}

/**
 * A primitive block that evaluates to a string object
 */
export interface integerBlock extends baseBlock {
  opcode: "Integer";
  value: number;
}

/**
 * A primitive block that evaluates to a float object
 */
export interface floatBlock extends baseBlock {
  opcode: "Float";
  value: number;
}

/**
 * A primitive block that evaluates to a string object
 */
export interface stringBlock extends baseBlock {
  opcode: "String";
  value: string;
}

/**
 * A primitive block that evaluates to an array object
 */
export interface arrayBlock extends baseBlock {
  opcode: "Array";
  children: blockRef[];
}

/**
 * A block used to construct an instance of a class using its
 * constructor method
 */
export interface constructBlock extends baseBlock {
  opcode: "Construct";
  c: string;
  arguments: { [key: string]: number };
  children: blockRef[];
}

/**
 * A block used to set the object represented by a variable
 */
export interface setVariableBlock extends baseBlock {
  opcode: "Set Variable";
  variable: string;
  children: [blockRef];
}

/**
 * A block used to get the object represented by a variable
 */
export interface getVariableBlock extends baseBlock {
  opcode: "Get Variable";
  variable: string;
}

/**
 * A block used to set an object attribute
 */
export interface setAttributeBlock extends baseBlock {
  opcode: "Set Attribute";
  attribute: string;
  // [Object, To]
  children: [blockRef, blockRef];
}

/**
 * A block used to get an object attribute
 */
export interface getAttributeBlock extends baseBlock {
  opcode: "Get Attribute";
  object: blockRef;
  attribute: string;
}

/**
 * A block that calls a function
 */
export interface functionCallBlock extends baseBlock {
  opcode: "Function Call";
  function: funcRef;
  arguments: { [key: string]: blockRef };
}

/**
 * A block that calls an object method
 */
export interface methodCallBlock extends baseBlock {
  opcode: "Method Call";
  object: blockRef;
  method: string;
  arguments: { [key: string]: blockRef };
}

/**
 * A block that returns from a function
 */
export interface returnBlock extends baseBlock {
  opcode: "Return";
  block?: blockRef;
}

/**
 * A block representing an if statement
 */
export interface ifBlock extends baseBlock {
  opcode: "If";
  condition: blockRef;
  then: astRef;
  else?: astRef;
}

/**
 * A block representing a while loop
 */
export interface whileBlock extends baseBlock {
  opcode: "While";
  condition: blockRef;
  inner: astRef;
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
  /**
   * The array to iterate over
   */
  array: blockRef;
  inner: astRef;
}

/**
 * A block that breaks from a loop
 */
export interface breakBlock extends baseBlock {
  opcode: "Break";
}

/**
 * A block representing an AST to execute on the next frame
 */
export interface doNextFrameBlock extends baseBlock {
  opcode: "Do Next Frame";
  inner: astRef;
}

export interface placeholderBlock extends baseBlock {
  opcode: "Placeholder";
}
