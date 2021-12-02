import { useStore } from "../../../project";
import { model, sceneObject } from "../../../project/sceneObject";
import { useGLTF } from "@react-three/drei";
import React, {
  forwardRef,
  Suspense,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

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

interface RootProps {
  onClick?: () => void;
  selected?: boolean;
  children?: React.ReactNode;
}

function Root({ onClick, selected, children }: RootProps) {
  const [group, setGroup] = useState<THREE.Group>();

  return (
    <>
      {group && selected ? <boxHelper args={[group, 0xd6d6d6]} /> : null}
      <group ref={setGroup} onClick={onClick}>
        {children}
      </group>
    </>
  );
}

interface InstanceProps {
  classId: string;
  selected?: boolean;
  onClick?: () => void;
}

function Instance({ classId, selected, onClick }: InstanceProps) {
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

interface MeshProps {
  model: model;
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Mesh({ model, selected, children, onClick }: MeshProps) {
  switch (model) {
    case "Box": {
      return (
        <Box onClick={onClick} selected={selected}>
          {children}
        </Box>
      );
    }
    default: {
      return (
        <Model model={model} selected={selected} onClick={onClick}>
          {children}
        </Model>
      );
    }
  }
}

interface BoxProps {
  onClick?: () => void;
  selected?: boolean;
  children?: React.ReactNode;
}

function Box({ onClick, selected, children }: BoxProps) {
  const [mesh, setMesh] = useState<THREE.Mesh>();

  return (
    <group>
      {mesh && selected ? <boxHelper args={[mesh, 0xd6d6d6]} /> : null}
      <mesh onClick={onClick} ref={setMesh}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={"hotpink"} />
      </mesh>
      {children}
    </group>
  );
}

interface ModelProps {
  model: string;
  selected?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const urls: { [key: string]: string } = {
  Duck: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/duck/model.gltf",
  "Beech Tree":
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-beech/model.gltf",
  "Lime Tree":
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-lime/model.gltf",
  "Spruce Tree":
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf",
  Rock: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/rock/model.gltf",
  "Small Menhir":
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/small-menhir/model.gltf",
  "Medium Menhir":
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/medium-menhir/model.gltf",
  "Large Menhir":
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/large-menhir/model.gltf",
  Spaceship:
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/low-poly-spaceship/model.gltf",
};

export const modelCategories = [
  {
    name: "Nature",
    models: [
      "Beech Tree",
      "Lime Tree",
      "Spruce Tree",
      "Rock",
      "Small Menhir",
      "Medium Menhir",
      "Large Menhir",
    ],
  },
  {
    name: "Space",
    models: ["Spaceship"],
  },
  {
    name: "Animals",
    models: ["Duck"],
  },
];

export function Model({ model, selected, children, onClick }: ModelProps) {
  const url = urls[model];

  if (!url) {
    throw new Error(`${model} is not a model`);
  }

  const { scene } = useGLTF(url);
  const copiedScene = useMemo(() => scene.clone(), [scene]);

  const box = useMemo(() => {
    return new THREE.BoxHelper(copiedScene, new THREE.Color(0xd6d6d6));
  }, [copiedScene]);

  return (
    <group>
      {selected ? <primitive object={box} /> : null}
      <primitive object={copiedScene} onClick={onClick} />
      {children}
    </group>
  );
}
