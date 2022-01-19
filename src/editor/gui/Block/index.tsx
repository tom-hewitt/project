import { useStore } from "../../state";
import { blockRef } from "../../../code";
import { blockStyle } from "./styles.css";
import { text } from "../../../styles/globals.css";
import ObjectIcon from "../common/icons";
import { typeColors } from "../../../styles/typeColors";

interface BlockProps {
  blockRef: blockRef;
}

export default function Block({ blockRef: { blockID } }: BlockProps) {
  const block = useStore((store) => store.code.blocks[blockID]);

  switch (block.opcode) {
    case "Boolean": {
      return (
        <div className={blockStyle} style={{ borderColor: typeColors.Boolean }}>
          <ObjectIcon color={typeColors.Boolean} />
          <span className={text}>{block.value ? "true" : "false"}</span>
        </div>
      );
    }
    default: {
      return <div>unimplemented</div>;
    }
  }
}
