import React from "react";
import type { LucideIcon } from "lucide-react";

const C = {
  border: "#DCE3EB",
  steel4: "#26456B",
  verde1: "#3B6D11",
  critico: "#C75450",
};

type IconActionButtonVariant = "default" | "green" | "red" | "disabled";

interface IconActionButtonProps {
  icon: LucideIcon;
  tooltip?: string;
  variant?: IconActionButtonVariant;
  onClick?: () => void;
}

const variantStyles: Record<IconActionButtonVariant, { bg: string; color: string }> = {
  default:  { bg: C.steel4,  color: "#ffffff" },
  green:    { bg: C.verde1,  color: "#ffffff" },
  red:      { bg: C.critico, color: "#ffffff" },
  disabled: { bg: `${C.border}cc`, color: C.border },
};

export function IconActionButton({ icon: Icon, tooltip, variant = "default", onClick }: IconActionButtonProps) {
  const { bg, color } = variantStyles[variant];
  const isDisabled = variant === "disabled";

  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: bg,
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        flexShrink: 0,
        outline: "none",
        transition: "opacity 0.15s",
      }}
    >
      <Icon size={15} color={color} strokeWidth={2} />
    </button>
  );
}

export default IconActionButton;
