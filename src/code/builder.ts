import { nanoid } from "nanoid";
import {
  astRef,
  block,
  blockRef,
  classDef,
  code,
  executeForeignFunc,
  foreignClassDef,
  funcRef,
  sourceCode,
} from ".";

/**
 * Class to help build code by hand
 */
export class CodeBuilder<
  C extends classDef | foreignClassDef = classDef | foreignClassDef
> {
  code: code = {
    classes: {},
    asts: {},
    functions: {},
    blocks: {},
  };

  createClass = (classDef: C): this => {
    this.code.classes[classDef.name] = classDef;

    return this;
  };

  createAST = (...blocks: blockRef[]): astRef => {
    const astID = nanoid();

    this.code.asts[astID] = { blocks };

    return { astID };
  };

  createFunction = (name: string, ...blocks: blockRef[]): this => {
    this.code.functions[name] = { type: "AST", ast: this.createAST(...blocks) };

    return this;
  };

  createMethod = (...blocks: blockRef[]): funcRef => {
    const funcID = nanoid();

    this.createFunction(funcID, ...blocks);

    return { funcID };
  };

  createBlock = (block: block): blockRef => {
    const blockID = nanoid();

    this.code.blocks[blockID] = block;

    return { blockID };
  };
}

export class LibraryCodeBuilder extends CodeBuilder {
  constructor(code: code) {
    super();
    this.code = code;
  }

  createForeignFunc = (name: string, execute: executeForeignFunc): this => {
    this.code.functions[name] = {
      type: "Foreign",
      execute,
    };

    return this;
  };

  createForeignMethod = (execute: executeForeignFunc): funcRef => {
    const funcID = nanoid();

    this.createForeignFunc(funcID, execute);

    return { funcID };
  };
}

export class SourceCodeBuilder extends CodeBuilder<classDef> {
  code: sourceCode = {
    classes: {},
    asts: {
      Main: { blocks: [] },
    },
    functions: {},
    blocks: {},
  };

  constructor() {
    super();
  }

  addToMain = (...blocks: blockRef[]) => {
    this.code.asts.Main.blocks.push(...blocks);
  };
}

export const createSourceCode = (
  build: (builder: SourceCodeBuilder) => void
) => {
  const builder = new SourceCodeBuilder();

  build(builder);

  return builder.code;
};
