import { useGLTF } from "@react-three/drei";
import { useMemo, useState } from "react";
import { model } from "../../project/sceneObject";
import * as THREE from "three";

interface MeshProps {
  model: model;
  selected?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Mesh({ model, selected, children, onClick }: MeshProps) {
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
