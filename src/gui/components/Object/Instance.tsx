import { SceneObject } from ".";
import { useStore } from "../../../project";

interface InstanceProps {
  classId: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Instance({ classId, selected, onClick }: InstanceProps) {
  try {
    const classDef = useStore((store) => store.project.sceneClasses[classId]);

    if (classDef.root) {
      return (
        <SceneObject id={classDef.root} onClick={onClick} selected={selected} />
      );
    } else {
      throw new Error(`Class with id "${classId}"" is not a scene class`);
    }
  } catch {
    throw new Error(`Instance: Class with id "${classId}" doesn't exist`);
  }
}
