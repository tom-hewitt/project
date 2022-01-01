import { SceneObject } from ".";
import { useStore } from "../../old/project";
import { getAttributes } from "../../old/project/class";

interface InstanceProps {
  classId: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Instance({ classId, selected, onClick }: InstanceProps) {
  try {
    const attributes = useStore((store) => getAttributes(store, classId));

    if (
      attributes.Scene &&
      attributes.Scene.literal?.type === "Object Reference" &&
      attributes.Scene.literal.objectClass === "Object 3D"
    ) {
      return (
        <SceneObject
          id={attributes.Scene.literal.value}
          onClick={onClick}
          selected={selected}
        />
      );
    } else {
      throw new Error(`Class with id "${classId}"" is not a scene class`);
    }
  } catch {
    throw new Error(`Instance: Class with id "${classId}" doesn't exist`);
  }
}
