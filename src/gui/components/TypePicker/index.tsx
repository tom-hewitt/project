import { type } from "../../../project/type";
import { TypeText } from "../TypeText";

interface TypePickerProps {
  type: type;
  onChange: (type: type) => void;
}
