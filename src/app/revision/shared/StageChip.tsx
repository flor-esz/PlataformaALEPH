import React from "react";

const C = {
  border: "#DCE3EB",
  textMuted: "#6B7A8D",
  steel3: "#3E6E9E",
  ambar2: "#F6EBD6",
  ambarTexto: "#8A5A12",
};

type StageChipState = "pending" | "active" | "readonly";

interface StageChipProps {
  stage: 1 | 2 | 3 | 4;
  label: string;
  state: StageChipState;
}

function getChipStyle(stage: 1 | 2 | 3 | 4, state: StageChipState): React.CSSProperties {
  if (state === "readonly") {
    return { backgroundColor: C.border, color: C.textMuted };
  }
  if (stage === 4) {
    return { backgroundColor: C.ambar2, color: C.ambarTexto };
  }
  // stage 2 (and 1/3 active/pending default)
  return { backgroundColor: `${C.steel3}22`, color: C.steel3 };
}

export function StageChip({ stage, label, state }: StageChipProps) {
  return (
    <span
      style={{
        ...getChipStyle(stage, state),
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 9999,
        padding: "4px 10px",
        whiteSpace: "nowrap",
      }}
    >
      Etapa {stage} · {label}
    </span>
  );
}

export default StageChip;
