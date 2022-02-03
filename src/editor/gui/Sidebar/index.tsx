import { ReactNode } from "react";
import { ClassIcon, PlayIcon } from "../common/icons";
import { sidebarButtonStyle, sidebarStyle } from "./styles.css";

interface SidebarProps {
  goHome: () => void;
  play: () => void;
}

export function Sidebar({ goHome, play }: SidebarProps) {
  return (
    <div className={sidebarStyle}>
      <SidebarButton onClick={goHome}>
        <ClassIcon />
      </SidebarButton>
      <SidebarButton onClick={play}>
        <PlayIcon />
      </SidebarButton>
    </div>
  );
}

interface SidebarButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

function SidebarButton({ children, onClick }: SidebarButtonProps) {
  return (
    <div className={sidebarButtonStyle} onClick={onClick}>
      {children}
    </div>
  );
}
