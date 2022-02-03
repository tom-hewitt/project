import { nanoid } from "nanoid";
import {
  executableBlock,
  classDef,
  code,
  executeForeignFunc,
  funcRef,
  sourceCode,
  func,
  concreteBlockRef,
  method,
  attribute,
} from ".";

/**
 * Class to help build code by hand
 */
export class CodeBuilder {
  code: code = {
    classes: {},
    functions: {},
    blocks: {},
  };

  createClass = (classDef: classDef): this => {
    this.code.classes[classDef.name] = classDef;

    return this;
  };

  createFunction = (func: func, id?: string): this => {
    id = id ? id : func.name;

    this.code.functions[id] = func;

    return this;
  };

  createMethod = (
    inheritedFrom: string,
    name: string,
    params: string[],
    ...blocks: concreteBlockRef[]
  ): method => {
    const funcID = nanoid();

    const block = this.createSequence(...blocks);

    this.createFunction(
      {
        name,
        type: "AST",
        params,
        block,
      },
      funcID
    );

    return { inheritedFrom, funcRef: { funcID } };
  };

  createAttribute = (
    inheritedFrom: string,
    blockRef: concreteBlockRef
  ): attribute => {
    return {
      inheritedFrom,
      blockRef,
    };
  };

  createBlock = (block: executableBlock): concreteBlockRef => {
    const blockID = nanoid();

    this.code.blocks[blockID] = block;

    return { type: "Concrete", blockID, return: block.return };
  };

  createSequence = (...children: concreteBlockRef[]): concreteBlockRef => {
    return this.createBlock({
      opcode: "Sequence",
      children,
    });
  };
}

export class LibraryCodeBuilder extends CodeBuilder {
  constructor(code: code) {
    super();
    this.code = code;
  }

  createForeignFunc = (
    name: string,
    params: string[],
    execute: executeForeignFunc
  ): this => {
    this.code.functions[name] = {
      name,
      type: "Foreign",
      params,
      execute,
    };

    return this;
  };

  createForeignMethod = (
    inheritedFrom: string,
    params: string[],
    execute: executeForeignFunc
  ): method => {
    const funcID = nanoid();

    this.createForeignFunc(funcID, params, execute);

    return { inheritedFrom, funcRef: { funcID } };
  };
}

export class SourceCodeBuilder extends CodeBuilder {
  code: sourceCode = {
    classes: {
      Program: {
        name: "Project",
        attributes: {},
        methods: {
          Main: this.createMethod("Project", "Main", []),
        },
      },
    },
    functions: {},
    blocks: {},
  };
}

export const createSourceCode = (
  build: (builder: SourceCodeBuilder) => void
) => {
  const builder = new SourceCodeBuilder();

  build(builder);

  return builder.code;
};
