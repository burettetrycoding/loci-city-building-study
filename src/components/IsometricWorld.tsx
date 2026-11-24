import React, { useMemo } from 'react';
import {
  EnvironmentTheme,
  SettlementStyle,
  StructureBlueprint,
  StructureKind,
} from '../types/loci';

interface IsometricWorldProps {
  theme: EnvironmentTheme;
  style: SettlementStyle;
  allBlueprints: StructureBlueprint[];
  unlockedIds: Set<string>;
  selectedStructureId: string | null;
  onSelectStructure: (structure: StructureBlueprint | null) => void;
  isRunning: boolean;
  newlyUnlockedId: string | null;
}

const TILE_W = 68;
const TILE_H = 34;
const ORIGIN_X = 430;
const ORIGIN_Y = 186;

function toIso(col: number, row: number): { x: number; y: number } {
  return {
    x: ORIGIN_X + (col - row) * TILE_W,
    y: ORIGIN_Y + (col + row) * TILE_H,
  };
}

function isoDiamondPoints(cx: number, cy: number, rx: number, ry: number): string {
  return `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
}

interface IsoPrismProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  height: number;
  topColor: string;
  leftColor: string;
  rightColor: string;
  stroke?: string;
}

const IsoPrism: React.FC<IsoPrismProps> = ({
  cx,
  cy,
  rx,
  ry,
  height,
  topColor,
  leftColor,
  rightColor,
  stroke = 'rgba(15,23,42,0.12)',
}) => {
  const topY = cy - height;
  const leftFace = `${cx - rx},${topY} ${cx},${topY + ry} ${cx},${cy + ry} ${cx - rx},${cy}`;
  const rightFace = `${cx},${topY + ry} ${cx + rx},${topY} ${cx + rx},${cy} ${cx},${cy + ry}`;
  const topFace = `${cx},${topY - ry} ${cx + rx},${topY} ${cx},${topY + ry} ${cx - rx},${topY}`;

  return (
    <g>
      <polygon points={leftFace} fill={leftColor} stroke={stroke} strokeWidth="0.75" strokeLinejoin="round" />
      <polygon points={rightFace} fill={rightColor} stroke={stroke} strokeWidth="0.75" strokeLinejoin="round" />
      <polygon points={topFace} fill={topColor} stroke={stroke} strokeWidth="0.75" strokeLinejoin="round" />
    </g>
  );
};

interface IsoPyramidRoofProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  peakHeight: number;
  leftColor: string;
  rightColor: string;
}

const IsoPyramidRoof: React.FC<IsoPyramidRoofProps> = ({
  cx,
  cy,
  rx,
  ry,
  peakHeight,
  leftColor,
  rightColor,
}) => {
  const peakY = cy - peakHeight;
  const frontLeft = `${cx - rx},${cy} ${cx},${cy + ry} ${cx},${peakY}`;
  const frontRight = `${cx},${cy + ry} ${cx + rx},${cy} ${cx},${peakY}`;
  const backLeft = `${cx},${cy - ry} ${cx - rx},${cy} ${cx},${peakY}`;
  const backRight = `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${peakY}`;

  return (
    <g stroke="rgba(15,23,42,0.12)" strokeWidth="0.7" strokeLinejoin="round">
      <polygon points={backLeft} fill={leftColor} opacity="0.9" />
      <polygon points={backRight} fill={rightColor} opacity="0.9" />
      <polygon points={frontLeft} fill={leftColor} />
      <polygon points={frontRight} fill={rightColor} />
    </g>
  );
};

interface IsoGableRoofProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  peakHeight: number;
  leftSlopeColor: string;
  rightSlopeColor: string;
  gableColor: string;
}

const IsoGableRoof: React.FC<IsoGableRoofProps> = ({
  cx,
  cy,
  rx,
  ry,
  peakHeight,
  leftSlopeColor,
  rightSlopeColor,
  gableColor,
}) => {
  // Ridge runs from back-left to front-right
  const ridgeBackX = cx - rx * 0.5;
  const ridgeBackY = cy - ry * 0.5 - peakHeight;
  const ridgeFrontX = cx + rx * 0.5;
  const ridgeFrontY = cy + ry * 0.5 - peakHeight;

  const leftSlope = `${cx - rx},${cy} ${cx},${cy + ry} ${ridgeFrontX},${ridgeFrontY} ${ridgeBackX},${ridgeBackY}`;
  const rightSlope = `${cx},${cy - ry} ${cx + rx},${cy} ${ridgeFrontX},${ridgeFrontY} ${ridgeBackX},${ridgeBackY}`;
  const frontGable = `${cx},${cy + ry} ${cx + rx},${cy} ${ridgeFrontX},${ridgeFrontY}`;

  return (
    <g stroke="rgba(15,23,42,0.14)" strokeWidth="0.7" strokeLinejoin="round">
      <polygon points={rightSlope} fill={rightSlopeColor} />
      <polygon points={leftSlope} fill={leftSlopeColor} />
      <polygon points={frontGable} fill={gableColor} />
    </g>
  );
};

function renderStructureArt(
  kind: StructureKind,
  cx: number,
  cy: number,
  theme: EnvironmentTheme,
  isRunning: boolean
) {
  const winGlow = theme.isNight ? '#FDE047' : theme.windowColor;
  const winStroke = theme.isNight ? 'rgba(251,191,36,0.55)' : 'rgba(15,23,42,0.18)';

  switch (kind) {
    case 'plaza_fountain':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 3} rx={36} ry={18} fill={theme.pathColor} stroke="rgba(15,23,42,0.1)" />
          <ellipse cx={cx} cy={cy + 2} rx={24} ry={12} fill={theme.waterColor} stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx={cx} cy={cy - 10} rx={10} ry={5} fill="#E2E8F0" stroke="rgba(15,23,42,0.15)" />
          <rect x={cx - 3} y={cy - 22} width={6} height={22} rx={2} fill="#CBD5E1" />
          <circle cx={cx} cy={cy - 24} r={3.5} fill={theme.waterColor} />
          <path
            d={`M ${cx} ${cy - 24} Q ${cx - 10} ${cy - 18} ${cx - 12} ${cy - 1} M ${cx} ${cy - 24} Q ${cx + 10} ${cy - 18} ${cx + 12} ${cy - 1}`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      );

    case 'well':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 4} rx={24} ry={12} fill={theme.pathColor} />
          <IsoPrism
            cx={cx}
            cy={cy + 2}
            rx={14}
            ry={7}
            height={11}
            topColor={theme.waterColor}
            leftColor="#94A3B8"
            rightColor="#64748B"
          />
          <line x1={cx - 10} y1={cy - 8} x2={cx - 10} y2={cy - 28} stroke="#78350F" strokeWidth="2.4" />
          <line x1={cx + 10} y1={cy - 8} x2={cx + 10} y2={cy - 28} stroke="#78350F" strokeWidth="2.4" />
          <IsoGableRoof
            cx={cx}
            cy={cy - 26}
            rx={18}
            ry={9}
            peakHeight={10}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor="#78350F"
          />
        </g>
      );

    case 'bookshop':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 4}
            rx={32}
            ry={16}
            height={28}
            topColor={theme.roofPrimary}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 24}
            rx={34}
            ry={17}
            peakHeight={15}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor={theme.wallDark}
          />
          {/* Awning & bookshop windows */}
          <polygon
            points={`${cx - 26},${cy - 6} ${cx - 4},${cy + 5} ${cx - 4},${cy + 10} ${cx - 26},${cy - 1}`}
            fill={theme.accentColor}
          />
          <polygon
            points={`${cx - 22},${cy - 18} ${cx - 12},${cy - 13} ${cx - 12},${cy - 7} ${cx - 22},${cy - 12}`}
            fill={winGlow}
            stroke={winStroke}
          />
          <polygon
            points={`${cx + 8},${cy - 13} ${cx + 20},${cy - 19} ${cx + 20},${cy - 11} ${cx + 8},${cy - 5}`}
            fill={winGlow}
            stroke={winStroke}
          />
        </g>
      );

    case 'cafe':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={30}
            ry={15}
            height={22}
            topColor={theme.wallLight}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoPrism
            cx={cx}
            cy={cy - 17}
            rx={31}
            ry={15.5}
            height={4}
            topColor={theme.roofPrimary}
            leftColor={theme.roofSecondary}
            rightColor={theme.roofSecondary}
          />
          {/* Striped awning */}
          <polygon
            points={`${cx - 24},${cy - 4} ${cx - 2},${cy + 7} ${cx - 2},${cy + 12} ${cx - 24},${cy + 1}`}
            fill={theme.roofPrimary}
          />
          {/* Outdoor umbrella & table */}
          <circle cx={cx + 22} cy={cy + 8} r={6} fill={theme.accentColor} />
          <line x1={cx + 22} y1={cy + 8} x2={cx + 22} y2={cy + 17} stroke="#475569" strokeWidth="1.5" />
          <polygon
            points={`${cx + 10},${cy - 8} ${cx + 22},${cy - 14} ${cx + 22},${cy - 7} ${cx + 10},${cy - 1}`}
            fill={winGlow}
            stroke={winStroke}
          />
        </g>
      );

    case 'townhouse':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 4}
            rx={28}
            ry={14}
            height={40}
            topColor={theme.wallDark}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 36}
            rx={30}
            ry={15}
            peakHeight={14}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor={theme.wallLight}
          />
          {/* Two rows of windows */}
          {[-26, -13].map((dy, i) => (
            <g key={i}>
              <polygon
                points={`${cx - 20},${cy + dy} ${cx - 12},${cy + dy + 4} ${cx - 12},${cy + dy + 10} ${cx - 20},${cy + dy + 6}`}
                fill={winGlow}
                stroke={winStroke}
              />
              <polygon
                points={`${cx + 8},${cy + dy + 4} ${cx + 18},${cy + dy - 1} ${cx + 18},${cy + dy + 5} ${cx + 8},${cy + dy + 10}`}
                fill={winGlow}
                stroke={winStroke}
              />
            </g>
          ))}
        </g>
      );

    case 'library':
      return (
        <g>
          {/* Grand stone steps */}
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={42}
            ry={21}
            height={5}
            topColor={theme.pathColor}
            leftColor="#CBD5E1"
            rightColor="#94A3B8"
          />
          {/* Main hall */}
          <IsoPrism
            cx={cx}
            cy={cy + 1}
            rx={36}
            ry={18}
            height={36}
            topColor={theme.roofSecondary}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 35}
            rx={38}
            ry={19}
            peakHeight={18}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor={theme.wallLight}
          />
          {/* Tall arched windows */}
          {[-26, -15].map((dx, i) => (
            <polygon
              key={i}
              points={`${cx + dx},${cy - 22} ${cx + dx + 7},${cy - 18.5} ${cx + dx + 7},${cy - 4} ${cx + dx},${cy - 7.5}`}
              fill={winGlow}
              stroke={winStroke}
            />
          ))}
          <polygon
            points={`${cx + 10},${cy - 18} ${cx + 24},${cy - 25} ${cx + 24},${cy - 9} ${cx + 10},${cy - 2}`}
            fill={winGlow}
            stroke={winStroke}
          />
        </g>
      );

    case 'clocktower':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={22}
            ry={11}
            height={66}
            topColor={theme.roofSecondary}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoPyramidRoof
            cx={cx}
            cy={cy - 61}
            rx={24}
            ry={12}
            peakHeight={26}
            leftColor={theme.roofPrimary}
            rightColor={theme.roofSecondary}
          />
          {/* Clock dial */}
          <circle cx={cx - 10} cy={cy - 46} r={6} fill="#FFFFFF" stroke="#334155" strokeWidth="1.2" />
          <line x1={cx - 10} y1={cy - 46} x2={cx - 10} y2={cy - 50} stroke="#0F172A" strokeWidth="1.2" />
          <line x1={cx - 10} y1={cy - 46} x2={cx - 7} y2={cy - 45} stroke="#0F172A" strokeWidth="1.2" />
          <circle cx={cx + 10} cy={cy - 46} r={5.5} fill="#FEF3C7" stroke="#334155" strokeWidth="1.2" />
        </g>
      );

    case 'apartments':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={34}
            ry={17}
            height={52}
            topColor={theme.pathColor}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          {/* Rooftop parapet & garden */}
          <IsoPrism
            cx={cx}
            cy={cy - 47}
            rx={22}
            ry={11}
            height={7}
            topColor={theme.foliagePrimary}
            leftColor={theme.roofPrimary}
            rightColor={theme.roofSecondary}
          />
          {[-38, -24, -10].map((dy, i) => (
            <g key={i}>
              <polygon
                points={`${cx - 25},${cy + dy} ${cx - 16},${cy + dy + 4.5} ${cx - 16},${cy + dy + 10.5} ${cx - 25},${cy + dy + 6}`}
                fill={winGlow}
                stroke={winStroke}
              />
              <polygon
                points={`${cx - 12},${cy + dy + 6.5} ${cx - 3},${cy + dy + 11} ${cx - 3},${cy + dy + 17} ${cx - 12},${cy + dy + 12.5}`}
                fill={winGlow}
                stroke={winStroke}
              />
              <polygon
                points={`${cx + 8},${cy + dy + 6} ${cx + 22},${cy + dy - 1} ${cx + 22},${cy + dy + 5} ${cx + 8},${cy + dy + 12}`}
                fill={winGlow}
                stroke={winStroke}
              />
            </g>
          ))}
        </g>
      );

    case 'tram_station':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={38}
            ry={19}
            height={6}
            topColor={theme.pathColor}
            leftColor="#CBD5E1"
            rightColor="#94A3B8"
          />
          <IsoPrism
            cx={cx}
            cy={cy}
            rx={30}
            ry={15}
            height={22}
            topColor={theme.roofPrimary}
            leftColor={theme.accentColor}
            rightColor="#1E293B"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 22}
            rx={34}
            ry={17}
            peakHeight={12}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor={theme.wallLight}
          />
        </g>
      );

    case 'greenhouse':
    case 'conservatory':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={34}
            ry={17}
            height={9}
            topColor={theme.foliagePrimary}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoPrism
            cx={cx}
            cy={cy - 4}
            rx={30}
            ry={15}
            height={22}
            topColor="rgba(186,230,253,0.72)"
            leftColor="rgba(186,230,253,0.65)"
            rightColor="rgba(125,211,252,0.55)"
            stroke="#475569"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 26}
            rx={31}
            ry={15.5}
            peakHeight={15}
            leftSlopeColor="rgba(224,242,254,0.8)"
            rightSlopeColor="rgba(186,230,253,0.72)"
            gableColor="rgba(224,242,254,0.85)"
          />
          {/* Inner foliage peek */}
          <circle cx={cx - 4} cy={cy - 10} r={8} fill={theme.foliagePrimary} opacity="0.85" />
          <circle cx={cx + 8} cy={cy - 8} r={6} fill={theme.foliageSecondary} opacity="0.85" />
        </g>
      );

    case 'museum':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={42}
            ry={21}
            height={6}
            topColor={theme.pathColor}
            leftColor="#CBD5E1"
            rightColor="#94A3B8"
          />
          <IsoPrism
            cx={cx}
            cy={cy}
            rx={36}
            ry={18}
            height={32}
            topColor={theme.wallDark}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          {/* Classical dome */}
          <ellipse cx={cx} cy={cy - 34} rx={20} ry={10} fill={theme.roofSecondary} />
          <path
            d={`M ${cx - 18} ${cy - 34} A 18 22 0 0 1 ${cx + 18} ${cy - 34} Z`}
            fill={theme.roofPrimary}
            stroke="rgba(15,23,42,0.16)"
          />
          <circle cx={cx} cy={cy - 57} r={3} fill="#FBBF24" />
        </g>
      );

    case 'observatory_dome':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={36}
            ry={18}
            height={28}
            topColor={theme.wallDark}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <ellipse cx={cx} cy={cy - 24} rx={26} ry={13} fill="#334155" />
          <path
            d={`M ${cx - 25} ${cy - 24} A 25 28 0 0 1 ${cx + 25} ${cy - 24} Z`}
            fill={theme.isNight ? '#D97706' : '#475569'}
            stroke="rgba(15,23,42,0.22)"
          />
          {/* Telescope slit & brass lens */}
          <line x1={cx + 6} y1={cy - 40} x2={cx + 24} y2={cy - 56} stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx + 24} cy={cy - 56} r={3} fill="#FEF08A" />
        </g>
      );

    case 'cottage':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={26}
            ry={13}
            height={22}
            topColor={theme.wallDark}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          {/* Chimney */}
          <rect x={cx - 16} y={cy - 38} width={6} height={18} fill="#78716C" />
          {isRunning && (
            <g className="animate-smoke">
              <circle cx={cx - 13} cy={cy - 42} r={3} fill="#E2E8F0" opacity="0.7" />
              <circle cx={cx - 11} cy={cy - 48} r={4} fill="#E2E8F0" opacity="0.5" />
            </g>
          )}
          <IsoGableRoof
            cx={cx}
            cy={cy - 17}
            rx={29}
            ry={14.5}
            peakHeight={18}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor={theme.wallLight}
          />
          <polygon
            points={`${cx - 16},${cy - 8} ${cx - 8},${cy - 4} ${cx - 8},${cy + 2} ${cx - 16},${cy - 2}`}
            fill={winGlow}
            stroke={winStroke}
          />
        </g>
      );

    case 'bakery':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={28}
            ry={14}
            height={25}
            topColor={theme.wallDark}
            leftColor="#FEF3C7"
            rightColor="#FDE68A"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 20}
            rx={30}
            ry={15}
            peakHeight={15}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor="#FEF3C7"
          />
          <polygon
            points={`${cx - 20},${cy - 6} ${cx - 4},${cy + 2} ${cx - 4},${cy + 7} ${cx - 20},${cy - 1}`}
            fill={theme.accentColor}
          />
          <rect x={cx + 12} y={cy - 36} width={7} height={18} fill="#9A3412" />
          {isRunning && (
            <circle cx={cx + 15.5} cy={cy - 42} r={3.5} fill="#F8FAFC" opacity="0.65" className="animate-smoke" />
          )}
        </g>
      );

    case 'windmill':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={20}
            ry={10}
            height={44}
            topColor={theme.roofSecondary}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoPyramidRoof
            cx={cx}
            cy={cy - 38}
            rx={22}
            ry={11}
            peakHeight={16}
            leftColor={theme.roofPrimary}
            rightColor={theme.roofSecondary}
          />
          {/* Windmill blades */}
          <g transform={`translate(${cx - 14}, ${cy - 30})`}>
            <line x1="-18" y1="-18" x2="18" y2="18" stroke="#78350F" strokeWidth="2.5" />
            <line x1="-18" y1="18" x2="18" y2="-18" stroke="#78350F" strokeWidth="2.5" />
            <polygon points="-16,-16 -6,-12 -10,-4 -18,-10" fill="#FEF3C7" stroke="#78350F" strokeWidth="0.7" />
            <polygon points="16,16 6,12 10,4 18,10" fill="#FEF3C7" stroke="#78350F" strokeWidth="0.7" />
            <polygon points="-16,16 -12,6 -4,10 -10,18" fill="#FEF3C7" stroke="#78350F" strokeWidth="0.7" />
            <polygon points="16,-16 12,-6 4,-10 10,-18" fill="#FEF3C7" stroke="#78350F" strokeWidth="0.7" />
            <circle cx="0" cy="0" r="3" fill="#451A03" />
          </g>
        </g>
      );

    case 'market_stall':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 5} rx={30} ry={15} fill={theme.pathColor} />
          <IsoPrism
            cx={cx - 8}
            cy={cy + 2}
            rx={14}
            ry={7}
            height={14}
            topColor={theme.roofPrimary}
            leftColor="#FDE68A"
            rightColor="#F59E0B"
          />
          <IsoPrism
            cx={cx + 12}
            cy={cy + 6}
            rx={13}
            ry={6.5}
            height={13}
            topColor={theme.accentColor}
            leftColor="#E2E8F0"
            rightColor="#CBD5E1"
          />
        </g>
      );

    case 'chapel':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={28}
            ry={14}
            height={30}
            topColor={theme.roofSecondary}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 25}
            rx={30}
            ry={15}
            peakHeight={15}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor={theme.wallLight}
          />
          <IsoPrism
            cx={cx - 10}
            cy={cy - 22}
            rx={9}
            ry={4.5}
            height={28}
            topColor={theme.wallDark}
            leftColor={theme.wallLight}
            rightColor={theme.wallDark}
          />
          <IsoPyramidRoof
            cx={cx - 10}
            cy={cy - 50}
            rx={10}
            ry={5}
            peakHeight={18}
            leftColor={theme.roofPrimary}
            rightColor={theme.roofSecondary}
          />
        </g>
      );

    case 'barn':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={32}
            ry={16}
            height={26}
            topColor="#7F1D1D"
            leftColor="#B91C1C"
            rightColor="#991B1B"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 21}
            rx={34}
            ry={17}
            peakHeight={18}
            leftSlopeColor="#78350F"
            rightSlopeColor="#451A03"
            gableColor="#B91C1C"
          />
          {/* White X barn doors */}
          <polygon points={`${cx - 14},${cy - 8} ${cx - 4},${cy - 3} ${cx - 4},${cy + 8} ${cx - 14},${cy + 3}`} fill="#FEF2F2" />
        </g>
      );

    case 'inn':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={34}
            ry={17}
            height={32}
            topColor={theme.roofSecondary}
            leftColor="#FEF3C7"
            rightColor="#E2D9C8"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 27}
            rx={36}
            ry={18}
            peakHeight={17}
            leftSlopeColor={theme.roofPrimary}
            rightSlopeColor={theme.roofSecondary}
            gableColor="#E2D9C8"
          />
          <polygon
            points={`${cx - 22},${cy - 14} ${cx - 10},${cy - 8} ${cx - 10},${cy - 2} ${cx - 22},${cy - 8}`}
            fill={winGlow}
            stroke={winStroke}
          />
          <polygon
            points={`${cx + 8},${cy - 8} ${cx + 20},${cy - 14} ${cx + 20},${cy - 8} ${cx + 8},${cy - 2}`}
            fill={winGlow}
            stroke={winStroke}
          />
        </g>
      );

    case 'tree_grove':
      return (
        <g>
          {[
            { dx: -16, dy: -4, s: 1.0 },
            { dx: 12, dy: -6, s: 0.9 },
            { dx: 0, dy: 8, s: 1.1 },
          ].map((tree, idx) => (
            <g key={idx} className="animate-sway" style={{ animationDelay: `${idx * 0.8}s` }}>
              <rect
                x={cx + tree.dx - 2.5}
                y={cy + tree.dy - 14 * tree.s}
                width={5}
                height={16 * tree.s}
                fill="#6B4F3A"
              />
              <ellipse
                cx={cx + tree.dx}
                cy={cy + tree.dy - 24 * tree.s}
                rx={14 * tree.s}
                ry={16 * tree.s}
                fill={idx % 2 === 0 ? theme.foliagePrimary : theme.foliageSecondary}
              />
              <ellipse
                cx={cx + tree.dx - 3}
                cy={cy + tree.dy - 28 * tree.s}
                rx={9 * tree.s}
                ry={10 * tree.s}
                fill={theme.foliagePrimary}
                opacity="0.85"
              />
            </g>
          ))}
        </g>
      );

    case 'koi_pond':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 4} rx={36} ry={18} fill={theme.foliageSecondary} opacity="0.3" />
          <ellipse cx={cx} cy={cy + 3} rx={30} ry={15} fill={theme.waterColor} stroke="#94A3B8" strokeWidth="2.5" />
          <ellipse cx={cx - 8} cy={cy + 2} rx={5} ry={2.5} fill="#10B981" />
          <ellipse cx={cx + 10} cy={cy + 5} rx={4} ry={2} fill="#059669" />
          {/* Tiny koi accents */}
          <ellipse cx={cx + 2} cy={cy} rx={3} ry={1.3} fill="#F97316" />
          <ellipse cx={cx - 10} cy={cy + 7} rx={2.5} ry={1.1} fill="#FB923C" />
        </g>
      );

    case 'flower_bed':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 4}
            rx={32}
            ry={16}
            height={5}
            topColor={theme.foliagePrimary}
            leftColor="#78716C"
            rightColor="#57534E"
          />
          {[
            [-14, -3, '#F43F5E'],
            [-4, 1, '#FBBF24'],
            [8, -2, '#A855F7'],
            [16, 2, '#FB7185'],
            [-6, -7, '#F59E0B'],
            [4, -6, '#EC4899'],
            [0, 5, '#FACC15'],
          ].map(([dx, dy, color], i) => (
            <circle key={i} cx={cx + Number(dx)} cy={cy + Number(dy) - 3} r={3.2} fill={String(color)} />
          ))}
        </g>
      );

    case 'gazebo':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={24}
            ry={12}
            height={5}
            topColor={theme.pathColor}
            leftColor="#CBD5E1"
            rightColor="#94A3B8"
          />
          {[-16, -6, 6, 16].map((dx, i) => (
            <line
              key={i}
              x1={cx + dx}
              y1={cy + (Math.abs(dx) > 10 ? 0 : 6)}
              x2={cx + dx}
              y2={cy - 22}
              stroke="#E2E8F0"
              strokeWidth="2.4"
            />
          ))}
          <IsoPyramidRoof
            cx={cx}
            cy={cy - 22}
            rx={26}
            ry={13}
            peakHeight={18}
            leftColor={theme.roofPrimary}
            rightColor={theme.roofSecondary}
          />
        </g>
      );

    case 'footbridge':
    case 'bridge_arch':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 6} rx={36} ry={16} fill={theme.waterColor} />
          <path
            d={`M ${cx - 28} ${cy + 8} Q ${cx} ${cy - 20} ${cx + 28} ${cy + 8} L ${cx + 22} ${cy + 14} Q ${cx} ${cy - 8} ${cx - 22} ${cy + 14} Z`}
            fill="#B45309"
            stroke="#78350F"
            strokeWidth="1"
          />
          <path
            d={`M ${cx - 28} ${cy + 1} Q ${cx} ${cy - 27} ${cx + 28} ${cy + 1}`}
            fill="none"
            stroke="#78350F"
            strokeWidth="2.2"
          />
        </g>
      );

    case 'amphitheater':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 6} rx={38} ry={19} fill="#CBD5E1" stroke="#94A3B8" />
          <ellipse cx={cx} cy={cy + 4} rx={28} ry={14} fill="#E2E8F0" stroke="#94A3B8" />
          <ellipse cx={cx} cy={cy + 2} rx={17} ry={8.5} fill={theme.pathColor} stroke="#94A3B8" />
          <circle cx={cx} cy={cy + 2} r={4} fill={theme.accentColor} />
        </g>
      );

    case 'lantern_pavilion':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={28}
            ry={14}
            height={7}
            topColor="#94A3B8"
            leftColor="#64748B"
            rightColor="#475569"
          />
          <IsoPrism
            cx={cx}
            cy={cy - 2}
            rx={22}
            ry={11}
            height={18}
            topColor={theme.roofPrimary}
            leftColor={theme.isNight ? '#FDE68A' : '#FEF3C7'}
            rightColor={theme.isNight ? '#FBBF24' : '#FDE68A'}
          />
          <IsoPyramidRoof
            cx={cx}
            cy={cy - 20}
            rx={29}
            ry={14.5}
            peakHeight={16}
            leftColor={theme.roofPrimary}
            rightColor={theme.roofSecondary}
          />
          <circle cx={cx} cy={cy - 38} r={3} fill="#FBBF24" />
        </g>
      );
  }
}

export const IsometricWorld: React.FC<IsometricWorldProps> = ({
  theme,
  style,
  allBlueprints,
  unlockedIds,
  selectedStructureId,
  onSelectStructure,
  isRunning,
  newlyUnlockedId,
}) => {
  // Sort grid slots back-to-front (painter's algorithm: smaller col + row rendered first)
  const orderedSlots = useMemo(() => {
    return [...allBlueprints].sort((a, b) => a.col + a.row - (b.col + b.row));
  }, [allBlueprints]);

  const unlockedCount = unlockedIds.size;

  // Compute the 4 outer corners of the 4x4 island platform
  const topCorner = { x: ORIGIN_X, y: ORIGIN_Y - TILE_H };
  const rightCorner = { x: ORIGIN_X + 4 * TILE_W, y: ORIGIN_Y + 3 * TILE_H };
  const bottomCorner = { x: ORIGIN_X, y: ORIGIN_Y + 7 * TILE_H };
  const leftCorner = { x: ORIGIN_X - 4 * TILE_W, y: ORIGIN_Y + 3 * TILE_H };
  const cliffDepth = 38;

  const islandTopPolygon = `${topCorner.x},${topCorner.y} ${rightCorner.x},${rightCorner.y} ${bottomCorner.x},${bottomCorner.y} ${leftCorner.x},${leftCorner.y}`;
  const islandLeftCliff = `${leftCorner.x},${leftCorner.y} ${bottomCorner.x},${bottomCorner.y} ${bottomCorner.x},${bottomCorner.y + cliffDepth} ${leftCorner.x},${leftCorner.y + cliffDepth}`;
  const islandRightCliff = `${bottomCorner.x},${bottomCorner.y} ${rightCorner.x},${rightCorner.y} ${rightCorner.x},${rightCorner.y + cliffDepth} ${bottomCorner.x},${bottomCorner.y + cliffDepth}`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg
        viewBox="0 0 860 520"
        className="block h-auto w-full select-none"
        role="img"
        aria-label={`Isometric ${style} diorama in ${theme.name} theme with ${unlockedCount} of ${allBlueprints.length} structures built`}
      >
        <defs>
          <linearGradient id={`sky-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.skyTop} />
            <stop offset="100%" stopColor={theme.skyBottom} />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.sunOrMoonColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={theme.sunOrMoonColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky Background */}
        <rect x="0" y="0" width="860" height="520" fill={`url(#sky-${theme.id})`} />

        {/* Night Stars */}
        {theme.isNight && (
          <g>
            {[
              [95, 58, 1.8],
              [170, 92, 1.4],
              [245, 44, 2.0],
              [340, 78, 1.3],
              [520, 48, 1.9],
              [605, 86, 1.5],
              [710, 52, 2.1],
              [775, 110, 1.4],
              [125, 145, 1.3],
              [670, 140, 1.5],
            ].map(([x, y, r], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                fill="#FEF9C3"
                className="animate-twinkle"
                style={{ animationDelay: `${i * 0.45}s` }}
              />
            ))}
          </g>
        )}

        {/* Sun / Moon */}
        <circle cx="715" cy="86" r="54" fill="url(#sunGlow)" />
        <circle cx="715" cy="86" r="24" fill={theme.sunOrMoonColor} />

        {/* Soft Drifting Clouds */}
        <g opacity={theme.isNight ? 0.16 : 0.72} className="animate-cloud">
          <ellipse cx="185" cy="84" rx="44" ry="15" fill="#FFFFFF" />
          <ellipse cx="212" cy="78" rx="28" ry="13" fill="#FFFFFF" />
        </g>
        <g opacity={theme.isNight ? 0.12 : 0.6} className="animate-cloud-slow">
          <ellipse cx="520" cy="108" rx="38" ry="12" fill="#FFFFFF" />
          <ellipse cx="546" cy="102" rx="24" ry="10" fill="#FFFFFF" />
        </g>

        {/* Water Rim / Moat */}
        <polygon
          points={`${topCorner.x},${topCorner.y - 18} ${rightCorner.x + 36},${rightCorner.y + 18} ${bottomCorner.x},${bottomCorner.y + cliffDepth + 14} ${leftCorner.x - 36},${leftCorner.y + 18}`}
          fill={theme.waterColor}
          opacity="0.55"
        />

        {/* Island Cliff Base */}
        <polygon points={islandLeftCliff} fill={theme.islandLeft} />
        <polygon points={islandRightCliff} fill={theme.islandRight} />
        <polygon points={islandTopPolygon} fill={theme.islandTop} />

        {/* Checkerboard Isometric Grid Tiles & Pathways */}
        {orderedSlots.map((slot) => {
          const { x, y } = toIso(slot.col, slot.row);
          const isBuilt = unlockedIds.has(slot.id);
          const isAlt = (slot.col + slot.row) % 2 === 1;
          const isSelected = selectedStructureId === slot.id;

          return (
            <g key={`tile-${slot.id}`}>
              <polygon
                points={isoDiamondPoints(x, y, TILE_W - 1, TILE_H - 0.5)}
                fill={isAlt ? theme.islandTopAlt : theme.islandTop}
                stroke={isSelected ? theme.accentColor : 'rgba(15,23,42,0.06)'}
                strokeWidth={isSelected ? '2' : '0.75'}
              />
              {/* Subtle cobblestone pad or empty plot stake */}
              {isBuilt ? (
                <polygon
                  points={isoDiamondPoints(x, y + 2, 42, 21)}
                  fill={theme.pathColor}
                  opacity="0.55"
                />
              ) : (
                <polygon
                  points={isoDiamondPoints(x, y + 1, 24, 12)}
                  fill="none"
                  stroke={theme.isNight ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)'}
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              )}
            </g>
          );
        })}

        {/* Built Structures (back-to-front painter order) */}
        {orderedSlots.map((bp) => {
          if (!unlockedIds.has(bp.id)) return null;
          const { x, y } = toIso(bp.col, bp.row);
          const isSelected = selectedStructureId === bp.id;
          const isNew = newlyUnlockedId === bp.id;

          return (
            <g
              key={bp.id}
              onClick={() => onSelectStructure(isSelected ? null : bp)}
              className={`cursor-pointer transition-opacity ${isNew ? 'animate-build-pop' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${bp.name} (${bp.category})`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStructure(isSelected ? null : bp);
                }
              }}
            >
              {isSelected && (
                <ellipse
                  cx={x}
                  cy={y + 4}
                  rx={46}
                  ry={23}
                  fill="none"
                  stroke={theme.accentColor}
                  strokeWidth="2.5"
                />
              )}
              {renderStructureArt(bp.kind, x, y, theme, isRunning)}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
