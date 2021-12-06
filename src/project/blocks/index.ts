export type blockId = string;

export interface block {}

interface baseBlock {
  id: blockId;
}

export interface setVariableBlock extends baseBlock {}
