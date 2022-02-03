import { useState } from "react";

interface RootProps {
  onClick?: () => void;
  selected?: boolean;
  children?: React.ReactNode;
}

export function Root({ onClick, selected, children }: RootProps) {
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
