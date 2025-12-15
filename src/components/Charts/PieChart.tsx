"use client";

/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState } from "react";
import type { ProvidedProps, PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import {
  GradientPinkBlue,
  GradientPurpleOrange,
  GradientDarkgreenGreen,
} from "@visx/gradient";
import type { LetterFrequency } from "@visx/mock-data/lib/mocks/letterFrequency";
import { letterFrequency, browserUsage } from "@visx/mock-data";
import { animated, useTransition, interpolate } from "@react-spring/web";
import { DashboardContext } from "../../context/DashboardContext";
import { useContext } from "react";

// ----------------------------
// TYPES & FIXES
// ----------------------------

// ambil tipe mentah dari mock-data
type BrowserUsageRaw = (typeof browserUsage)[0];

// ambil semua key kecuali "date"
const browserNames = Object.keys(browserUsage[0]).filter(
  (key) => key !== "date"
) as (keyof BrowserUsageRaw)[];

// type final untuk data browsers
interface BrowserUsage {
  label: string;
  usage: number;
}

const letters: LetterFrequency[] = letterFrequency.slice(0, 4);

// konversi ke array
const browsers: BrowserUsage[] = browserNames.map((name) => ({
  label: String(name),
  usage: Number(browserUsage[0][name] ?? 0),
}));

// accessor
const usage = (d: BrowserUsage) => d.usage;
const frequency = (d: LetterFrequency) => d.frequency;

// ----------------------------
// COLOR SCALE
// ----------------------------
const getBrowserColor = scaleOrdinal({
  domain: browserNames.map(String),
  range: [
    "rgba(255,255,255,0.7)",
    "rgba(255,255,255,0.6)",
    "rgba(255,255,255,0.5)",
    "rgba(255,255,255,0.4)",
    "rgba(255,255,255,0.3)",
    "rgba(255,255,255,0.2)",
    "rgba(255,255,255,0.1)",
  ],
});

const getLetterFrequencyColor = scaleOrdinal({
  domain: letters.map((l) => l.letter),
  range: [
    "rgba(93,30,91,1)",
    "rgba(93,30,91,0.8)",
    "rgba(93,30,91,0.6)",
    "rgba(93,30,91,0.4)",
  ],
});

// ----------------------------
// LAYOUT
// ----------------------------
const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

interface danaData {
  label: string;
  value: number;
}

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
};

// ----------------------------
// MAIN COMPONENT
// ----------------------------
export default function PieChart({
  width,
  height,
  margin = defaultMargin,
  animate = true,
}: PieProps) {

  // ✅ SEMUA HOOK DI ATAS
  const { danaJurusan, TotalDanaTerpakai } = useContext(DashboardContext);

  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null);
  const [selectedAlphabetLetter, setSelectedAlphabetLetter] =
    useState<string | null>(null);

  // ✅ IF SETELAH HOOK
  if (width < 10) return null;

  // ----------------------------
  // DATA DANA
  // ----------------------------
  interface DanaItem {
    label: string;
    value: number;
  }

  const danaData: DanaItem[] = [
    { label: "Dana Jurusan", value: danaJurusan },
    { label: "Dana Terpakai", value: TotalDanaTerpakai },
  ];

  const danaValue = (d: DanaItem) => d.value;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  return (
    <svg width={width} height={height}>
      <GradientDarkgreenGreen id="visx-pie-gradient" />

      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={
            selectedBrowser
              ? danaData.filter((d) => d.label === selectedBrowser)
              : danaData
          }
          pieValue={danaValue}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
        >
          {(pie) => (
            <AnimatedPie<DanaItem>
              {...pie}
              animate={animate}
              getKey={(arc) => arc.data.label}
              onClickDatum={({ data }) =>
                setSelectedBrowser(
                  selectedBrowser === data.label ? null : data.label
                )
              }
              getColor={(arc) =>
                arc.data.label === "Dana Jurusan"
                  ? "#4CAF50"
                  : "#FF6B6B"
              }
            />
          )}
        </Pie>
      </Group>
    </svg>
  );
}


// ----------------------------
// ANIMATION
// ----------------------------
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});

const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

// props animation
type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });

  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

    return (
      <g key={key}>
        <animated.path
          d={interpolate(
            [props.startAngle, props.endAngle],
            (startAngle, endAngle) =>
              path({
                ...arc,
                startAngle,
                endAngle,
              })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />

        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="white"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={9}
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}
