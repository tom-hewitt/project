import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { Obj3D } from "../../../3d";
import {
  constructObject,
  createRuntime,
  objRef,
  Runtime,
  RuntimeProvider,
  useObject,
} from "../../../interpreter";
import { useStore } from "../../state";

export function Player() {
  const runtime = useRef<Runtime>({
    code: useStore.getState().code,
    objects: {},
  });

  const programRef = useRef<objRef>();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    programRef.current = constructObject(runtime.current, "Program");

    setLoaded(true);
  }, []);

  return loaded && programRef.current ? (
    <Suspense fallback={<div>loading</div>}>
      <Canvas>
        <RuntimeProvider createStore={createRuntime(runtime.current)}>
          <Program3D objRef={programRef.current} />
        </RuntimeProvider>
        <ambientLight />
      </Canvas>
    </Suspense>
  ) : null;
}

interface Program3DProps {
  objRef: objRef;
}

function Program3D({ objRef }: Program3DProps) {
  const program = useObject(objRef);

  return <Obj3D objRef={program.attributes.Root} />;
}
