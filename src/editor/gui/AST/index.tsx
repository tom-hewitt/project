import { astRef } from "../../../code";
import { useStore } from "../../state";
import Block from "../Block";
import { astStyle } from "./styles.css";

interface ASTProps {
  astRef: astRef;
}

export default function AST({ astRef: { astID } }: ASTProps) {
  const ast = useStore((store) => store.code.asts[astID]);

  console.log(ast);

  return (
    <div className={astStyle}>
      {ast.blocks.map((ref) => (
        <Block blockRef={ref} key={ref.blockID} />
      ))}
    </div>
  );
}
