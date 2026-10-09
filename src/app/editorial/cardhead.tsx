import React from "react";
import { defFor } from "./defs";
import { InfoBtn } from "./info";

export function CardHead({
  title,
  sub,
  children,
  tall,
  ctlLeft,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
  tall?: boolean;
  ctlLeft?: boolean;
}) {
  return (
    <div className={"chead" + (tall ? " tall" : "") + (ctlLeft ? " ctl-left" : "")}>
      <h3 className="ctitle">
        <span className="t" title={title}>
          {title}
        </span>
        {defFor(title) ? <InfoBtn def={defFor(title)} /> : null}
      </h3>
      <div className="crow2">
        {sub ? (
          <p className="csub" title={sub}>
            {sub}
          </p>
        ) : null}
      </div>
      {children ? <div className="mini-ctl">{children}</div> : null}
    </div>
  );
}
