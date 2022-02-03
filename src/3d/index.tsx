import { useGLTF } from "@react-three/drei";
import { obj, objRef, useObject, useRuntime } from "../interpreter";

interface Obj3DArrayProps {
  obj: obj;
}

export function Obj3DArray({ obj }: Obj3DArrayProps) {
  return (
    <>
      {obj.value.map((child: objRef) => (
        <Obj3D objRef={child} key={child.objID} />
      ))}
    </>
  );
}

export const useVectorObj = (objRef: objRef): [number, number, number] => {
  const vector = useObject(objRef);

  const x = useObject(vector.attributes.x);
  const y = useObject(vector.attributes.y);
  const z = useObject(vector.attributes.z);

  return [x.value, y.value, z.value];
};

export const useStringObj = (objRef: objRef): string => {
  return useObject(objRef).value;
};

interface Obj3DProps {
  objRef: objRef;
}

export function Obj3D({ objRef }: Obj3DProps) {
  const obj = useRuntime((store) => store.objects[objRef.objID]);

  const position = useVectorObj(obj.attributes.Position);

  const children = useObject(obj.attributes.Children);

  switch (obj.c) {
    case "3D Plane": {
      return (
        <>
          <Plane position={position} />
          <Obj3DArray obj={children} />
        </>
      );
    }
    case "3D Box": {
      return (
        <>
          <Box obj={obj} position={position} />
          <Obj3DArray obj={children} />
        </>
      );
    }
    case "3D Model": {
      return (
        <>
          <Model obj={obj} position={position} />
          <Obj3DArray obj={children} />
        </>
      );
    }
    default: {
      return <Obj3DArray obj={children} />;
    }
  }
}

interface PlaneProps {
  position: [number, number, number];
}

function Plane({ position }: PlaneProps) {
  return (
    <mesh position={position} rotation={[Math.PI / -2, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color="green" />
    </mesh>
  );
}

interface BoxProps {
  obj: obj;
  position: [number, number, number];
}

function Box({ obj, position }: BoxProps) {
  const size = useVectorObj(obj.attributes.Size);

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial />
    </mesh>
  );
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

interface ModelProps {
  obj: obj;
  position: [number, number, number];
}

export function Model({ obj, position }: ModelProps) {
  const name = useStringObj(obj.attributes.Name);

  const url = urls[name];
  const { scene } = useGLTF(url);

  return <primitive object={scene} position={position} />;
}
