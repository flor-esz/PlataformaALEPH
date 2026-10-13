import React from "react";
import { defFor } from "./defs";
import { InfoBtn } from "./info";

export function CardHead({
  title,
  sub,
  children,
  tall,
  ctlLeft,
  noInfo,
  def,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
  tall?: boolean;
  ctlLeft?: boolean;
  noInfo?: boolean;
  def?: any;
}) {
  return (
    <div
      className={"chead" + (tall ? " tall" : "") + (ctlLeft ? " ctl-left" : "")}
    >
      <h3 className="ctitle">
        <span className="t" title={title}>
          {title}
        </span>
        {!noInfo && (def || defFor(title)) ? (
          <InfoBtn def={def || defFor(title)} />
        ) : null}
      </h3>
      {sub || tall ? (
        <div className="crow2">
          {sub ? (
            <p className="csub" title={sub}>
              {sub}
            </p>
          ) : null}
        </div>
      ) : null}
      {children ? <div className="mini-ctl">{children}</div> : null}
    </div>
  );
}
