import { useStore } from "../../old/project";
import { sceneObject } from "../../old/project/sceneObject";
import React, { Suspense } from "react";
import { Root } from "./Root";
import { Instance } from "./Instance";
import { Mesh } from "./Mesh";

interface SceneObjectProps {
  id: string;
  selected?: boolean;
  onClick?: () => void;
}

export function SceneObject({ id, selected, onClick }: SceneObjectProps) {
  try {
    const object = useStore((store) => store.project.sceneObjects[id]);

    return (
      <Object object={object} id={id} onClick={onClick} selected={selected}>
        {object.children?.map((id) => (
          <SceneObject id={id} key={id} />
        ))}
      </Object>
    );
  } catch {
    throw new Error(`SceneObject with id "${id}" doesn't exist`);
  }
}

interface ObjectProps {
  id: string;
  object: sceneObject;
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Object({ id, object, selected, children, onClick }: ObjectProps) {
  const select = useStore((store) => store.selectObject);

  const isSelected = useStore((store) => store.selectedObject === id);

  selected = selected !== undefined ? selected : isSelected;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      select(id);
    }
  };

  switch (object.type) {
    case "Root": {
      return (
        <Root onClick={onClick} selected={selected}>
          {children}
        </Root>
      );
    }
    case "Instance": {
      return (
        <Instance
          classId={object.class}
          onClick={handleClick}
          selected={selected}
        />
      );
    }
    case "Mesh": {
      return (
        <Suspense fallback={<group />}>
          <Mesh model={object.model} selected={selected} onClick={handleClick}>
            {children}
          </Mesh>
        </Suspense>
      );
    }
  }
}
