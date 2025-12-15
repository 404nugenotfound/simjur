"use client";

import { ParentSize } from "@visx/responsive";
import PieChart from "./PieChart"; // file panjang yang bta kirim tadi

export default function VisxPieResponsive() {
  return (
    <div className="w-full h-72 flex-1">
      <ParentSize>
        {({ width, height }) =>
          width > 0 && height > 0 ? (
            <PieChart
              width={width}
              height={height}
              animate
            />
          ) : null
        }
      </ParentSize>
    </div>
  );
}
