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
  nextStructureId: string | null;
  buildProgress: number;
  selectedStructureId: string | null;
  onSelectStructure: (structure: StructureBlueprint | null) => void;
  isRunning: boolean;
  newlyUnlockedId: string | null;
}

const TILE_W = 68;
const TILE_H = 34;
const ORIGIN_X = 430;
const ORIGIN_Y = 186;
const ISO_ANGLE = 26.565; // atan(0.5) for 2:1 isometric projection

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
  stroke = 'rgba(15,23,42,0.16)',
}) => {
  const topY = cy - height;
  const leftFace = `${cx - rx},${topY} ${cx},${topY + ry} ${cx},${cy + ry} ${cx - rx},${cy}`;
  const rightFace = `${cx},${topY + ry} ${cx + rx},${topY} ${cx + rx},${cy} ${cx},${cy + ry}`;
  const topFace = `${cx},${topY - ry} ${cx + rx},${topY} ${cx},${topY + ry} ${cx - rx},${topY}`;

  return (
    <g>
      <polygon points={leftFace} fill={leftColor} stroke={stroke} strokeWidth="0.7" strokeLinejoin="round" />
      <polygon points={rightFace} fill={rightColor} stroke={stroke} strokeWidth="0.7" strokeLinejoin="round" />
      <polygon points={topFace} fill={topColor} stroke={stroke} strokeWidth="0.7" strokeLinejoin="round" />
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
    <g stroke="rgba(15,23,42,0.16)" strokeWidth="0.7" strokeLinejoin="round">
      <polygon points={backLeft} fill={leftColor} opacity="0.92" />
      <polygon points={backRight} fill={rightColor} opacity="0.92" />
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
  const ridgeBackX = cx - rx * 0.5;
  const ridgeBackY = cy - ry * 0.5 - peakHeight;
  const ridgeFrontX = cx + rx * 0.5;
  const ridgeFrontY = cy + ry * 0.5 - peakHeight;

  const leftSlope = `${cx - rx},${cy} ${cx},${cy + ry} ${ridgeFrontX},${ridgeFrontY} ${ridgeBackX},${ridgeBackY}`;
  const rightSlope = `${cx},${cy - ry} ${cx + rx},${cy} ${ridgeFrontX},${ridgeFrontY} ${ridgeBackX},${ridgeBackY}`;
  const frontGable = `${cx},${cy + ry} ${cx + rx},${cy} ${ridgeFrontX},${ridgeFrontY}`;

  return (
    <g stroke="rgba(15,23,42,0.16)" strokeWidth="0.7" strokeLinejoin="round">
      <polygon points={rightSlope} fill={rightSlopeColor} />
      <polygon points={leftSlope} fill={leftSlopeColor} />
      <polygon points={frontGable} fill={gableColor} />
    </g>
  );
};

/** Helper to place flat architectural elements aligned on the left-facing wall */
const LeftWallPlane: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({
  x,
  y,
  children,
}) => <g transform={`translate(${x}, ${y}) skewY(${ISO_ANGLE})`}>{children}</g>;

/** Helper to place flat architectural elements aligned on the right-facing wall */
const RightWallPlane: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({
  x,
  y,
  children,
}) => <g transform={`translate(${x}, ${y}) skewY(-${ISO_ANGLE})`}>{children}</g>;

function renderStructureArt(
  kind: StructureKind,
  cx: number,
  cy: number,
  theme: EnvironmentTheme,
  isRunning: boolean
) {
  const night = theme.isNight;
  const warmGlass = night ? '#FDE047' : '#FEF3C7';
  const coolGlass = night ? '#FBBF24' : '#BAE6FD';
  const frameStroke = '#334155';

  switch (kind) {
    case 'cafe':
      return (
        <g>
          {/* Sidewalk terrace */}
          <polygon
            points={isoDiamondPoints(cx, cy + 5, 48, 24)}
            fill="#E7E5E4"
            stroke="rgba(15,23,42,0.12)"
            strokeWidth="0.7"
          />
          {/* Main cafe building (warm cream stucco + espresso brick base) */}
          <IsoPrism
            cx={cx - 4}
            cy={cy + 2}
            rx={28}
            ry={14}
            height={28}
            topColor="#F5F5F4"
            leftColor="#FFFBEB"
            rightColor="#E7E5E4"
          />
          {/* Espresso wainscoting along lower wall */}
          <IsoPrism
            cx={cx - 4}
            cy={cy + 2}
            rx={28.3}
            ry={14.15}
            height={6}
            topColor="#78350F"
            leftColor="#78350F"
            rightColor="#57260A"
          />
          {/* Mansard green-slate roof */}
          <IsoPrism
            cx={cx - 4}
            cy={cy - 26}
            rx={30}
            ry={15}
            height={6}
            topColor="#14532D"
            leftColor="#166534"
            rightColor="#14532D"
          />

          {/* Left wall: Shopfront window, door, striped awning & "CAFÉ" signboard */}
          <LeftWallPlane x={cx - 32} y={cy - 26}>
            {/* Roof fascia signboard */}
            <rect x="4" y="-5" width="20" height="6.5" rx="1" fill="#1E293B" stroke="#FDE68A" strokeWidth="0.5" />
            <text
              x="14"
              y="0"
              textAnchor="middle"
              fill="#FEF3C7"
              fontSize="4.6"
              fontWeight="700"
              fontFamily="Bricolage Grotesque, sans-serif"
              letterSpacing="0.5"
            >
              CAFÉ
            </text>
            {/* Large warm glass window + doorway */}
            <rect x="3" y="8" width="13" height="12" rx="0.8" fill={warmGlass} stroke="#451A03" strokeWidth="0.7" />
            <line x1="9.5" y1="8" x2="9.5" y2="20" stroke="#78350F" strokeWidth="0.6" />
            {/* Tiny hanging menu inside window */}
            <rect x="5" y="10" width="3" height="4" fill="#1E293B" opacity="0.65" />
            {/* Wooden café door */}
            <rect x="19" y="9" width="7" height="17" rx="0.6" fill="#78350F" stroke="#451A03" strokeWidth="0.6" />
            <rect x="20.5" y="10.5" width="4" height="7" fill={warmGlass} />
            <circle cx="24.8" cy="18.5" r="0.6" fill="#FBBF24" />
            {/* Striped awning */}
            <polygon points="1,6 27,6 29,11 3,11" fill="#15803D" stroke="#14532D" strokeWidth="0.5" />
            {[4, 10, 16, 22].map((sx) => (
              <polygon key={sx} points={`${sx},6 ${sx + 3},6 ${sx + 4},11 ${sx + 1},11`} fill="#FEF3C7" />
            ))}
          </LeftWallPlane>

          {/* Right wall: Upper window & chalkboard menu */}
          <RightWallPlane x={cx - 4} y={cy - 12}>
            <rect x="6" y="-12" width="14" height="9" rx="0.8" fill={warmGlass} stroke="#451A03" strokeWidth="0.7" />
            <line x1="13" y1="-12" x2="13" y2="-3" stroke="#78350F" strokeWidth="0.6" />
            {/* Side chalkboard */}
            <rect x="9" y="1" width="7" height="9" rx="0.5" fill="#1E293B" stroke="#B45309" strokeWidth="0.7" />
            <line x1="10.5" y1="3.5" x2="14.5" y2="3.5" stroke="#FDE68A" strokeWidth="0.6" />
            <line x1="10.5" y1="5.5" x2="13.5" y2="5.5" stroke="#E2E8F0" strokeWidth="0.5" />
          </RightWallPlane>

          {/* Outdoor Patio Bistro Tables & Chairs (front-right terrace) */}
          {[
            { tx: cx + 22, ty: cy + 8, umbrella: '#DC2626' },
            { tx: cx + 6, ty: cy + 16, umbrella: '#0F766E' },
          ].map((bistro, i) => (
            <g key={i}>
              {/* Chairs */}
              <circle cx={bistro.tx - 6} cy={bistro.ty + 1} r={2.2} fill="#78350F" />
              <circle cx={bistro.tx + 6} cy={bistro.ty - 1} r={2.2} fill="#78350F" />
              {/* Bistro table */}
              <line x1={bistro.tx} y1={bistro.ty + 2} x2={bistro.tx} y2={bistro.ty - 3} stroke="#475569" strokeWidth="1.2" />
              <ellipse cx={bistro.tx} cy={bistro.ty - 3} rx={4.5} ry={2.4} fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.6" />
              {/* Tiny coffee cup */}
              <rect x={bistro.tx - 1} y={bistro.ty - 4.8} width={2} height={1.8} fill="#78350F" />
              {/* Parasol */}
              <line x1={bistro.tx} y1={bistro.ty - 3} x2={bistro.tx} y2={bistro.ty - 14} stroke="#78350F" strokeWidth="1" />
              <path
                d={`M ${bistro.tx - 8} ${bistro.ty - 12} Q ${bistro.tx} ${bistro.ty - 20} ${bistro.tx + 8} ${bistro.ty - 12} Z`}
                fill={bistro.umbrella}
                stroke="rgba(15,23,42,0.2)"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </g>
      );

    case 'library':
      return (
        <g>
          {/* Grand limestone plinth & stairs */}
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={44}
            ry={22}
            height={5}
            topColor="#E7E5E4"
            leftColor="#D6D3D1"
            rightColor="#A8A29E"
          />
          {/* Main stone hall */}
          <IsoPrism
            cx={cx}
            cy={cy + 1}
            rx={36}
            ry={18}
            height={36}
            topColor="#A8A29E"
            leftColor="#F5F5F4"
            rightColor="#D6D3D1"
          />
          {/* Copper/slate pitched roof */}
          <IsoGableRoof
            cx={cx}
            cy={cy - 35}
            rx={38}
            ry={19}
            peakHeight={16}
            leftSlopeColor="#334155"
            rightSlopeColor="#1E293B"
            gableColor="#E7E5E4"
          />
          {/* Rooftop lantern cupola */}
          <IsoPrism
            cx={cx}
            cy={cy - 48}
            rx={7}
            ry={3.5}
            height={8}
            topColor="#0F766E"
            leftColor="#F5F5F4"
            rightColor="#D6D3D1"
          />

          {/* Left Facade: Classical Columns, Grand Doors & "LIBRARY" Frieze */}
          <LeftWallPlane x={cx - 36} y={cy - 35}>
            {/* Frieze signboard */}
            <rect x="2" y="1" width="32" height="7" fill="#E7E5E4" stroke="#78716C" strokeWidth="0.6" />
            <text
              x="18"
              y="6.2"
              textAnchor="middle"
              fill="#1E293B"
              fontSize="4.4"
              fontWeight="700"
              letterSpacing="0.7"
              fontFamily="Georgia, serif"
            >
              LIBRARY
            </text>
            {/* Tall arched windows flanking central portico */}
            {[4, 27].map((wx) => (
              <g key={wx}>
                <path
                  d={`M ${wx} 15 A 2.5 3 0 0 1 ${wx + 5} 15 L ${wx + 5} 30 L ${wx} 30 Z`}
                  fill={coolGlass}
                  stroke="#57534E"
                  strokeWidth="0.6"
                />
                <line x1={wx + 2.5} y1="12.5" x2={wx + 2.5} y2="30" stroke="#78716C" strokeWidth="0.45" />
                <line x1={wx} y1="22" x2={wx + 5} y2="22" stroke="#78716C" strokeWidth="0.45" />
              </g>
            ))}
            {/* Central Mahogany Double Entrance + Columns */}
            <rect x="13" y="18" width="10" height="17" fill="#78350F" stroke="#451A03" strokeWidth="0.6" />
            <line x1="18" y1="18" x2="18" y2="35" stroke="#451A03" strokeWidth="0.6" />
            {[11, 24].map((colX) => (
              <rect key={colX} x={colX} y="9" width="2.2" height="26" fill="#FFFFFF" stroke="#A8A29E" strokeWidth="0.4" />
            ))}
          </LeftWallPlane>

          {/* Right Facade: Reading hall tall mullioned windows */}
          <RightWallPlane x={cx} y={cy - 17}>
            {[6, 16, 26].map((wx) => (
              <g key={wx}>
                <path
                  d={`M ${wx} -8 A 2.5 3 0 0 1 ${wx + 5} -8 L ${wx + 5} 11 L ${wx} 11 Z`}
                  fill={warmGlass}
                  stroke="#57534E"
                  strokeWidth="0.6"
                />
                <line x1={wx + 2.5} y1="-10.5" x2={wx + 2.5} y2="11" stroke="#78716C" strokeWidth="0.45" />
              </g>
            ))}
          </RightWallPlane>
        </g>
      );

    case 'bookshop':
      return (
        <g>
          <polygon points={isoDiamondPoints(cx, cy + 5, 42, 21)} fill="#E7E5E4" />
          {/* Forest green ground floor + warm brick upper story */}
          <IsoPrism
            cx={cx}
            cy={cy + 3}
            rx={30}
            ry={15}
            height={16}
            topColor="#14532D"
            leftColor="#166534"
            rightColor="#14532D"
          />
          <IsoPrism
            cx={cx}
            cy={cy - 13}
            rx={30}
            ry={15}
            height={17}
            topColor="#B45309"
            leftColor="#C25E48"
            rightColor="#9E4633"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 30}
            rx={32}
            ry={16}
            peakHeight={14}
            leftSlopeColor="#334155"
            rightSlopeColor="#1E293B"
            gableColor="#C25E48"
          />

          <LeftWallPlane x={cx - 30} y={cy - 30}>
            {/* Upper apartment windows */}
            <rect x="5" y="4" width="8" height="8" fill={warmGlass} stroke="#F8FAFC" strokeWidth="0.8" />
            <rect x="17" y="4" width="8" height="8" fill={warmGlass} stroke="#F8FAFC" strokeWidth="0.8" />
            {/* "BOOKS" sign band */}
            <rect x="2" y="14" width="26" height="5.5" fill="#FEF3C7" stroke="#78350F" strokeWidth="0.5" />
            <text
              x="15"
              y="18.3"
              textAnchor="middle"
              fill="#14532D"
              fontSize="4.2"
              fontWeight="700"
              letterSpacing="0.6"
            >
              BOOKS
            </text>
            {/* Display window with colorful miniature book spines */}
            <rect x="3" y="21" width="15" height="10" fill={warmGlass} stroke="#78350F" strokeWidth="0.7" />
            {[
              [4.5, '#DC2626'],
              [6.5, '#2563EB'],
              [8.5, '#059669'],
              [10.5, '#D97706'],
              [12.5, '#7C3AED'],
              [14.5, '#0284C7'],
            ].map(([bx, color]) => (
              <rect key={String(bx)} x={Number(bx)} y="24" width="1.6" height="6" fill={String(color)} />
            ))}
            {/* Door */}
            <rect x="20" y="21" width="6.5" height="12" fill="#78350F" stroke="#451A03" strokeWidth="0.6" />
          </LeftWallPlane>

          {/* Outdoor bookstall cart on right side */}
          <g transform={`translate(${cx + 20}, ${cy + 8})`}>
            <rect x="-6" y="-7" width="12" height="6" rx="1" fill="#92400E" />
            <rect x="-4.5" y="-9.5" width="3" height="3" fill="#DC2626" />
            <rect x="-1" y="-9.5" width="3" height="3" fill="#2563EB" />
            <rect x="2.5" y="-9.5" width="3" height="3" fill="#16A34A" />
          </g>
        </g>
      );

    case 'bakery':
      return (
        <g>
          <polygon points={isoDiamondPoints(cx, cy + 5, 40, 20)} fill="#E7E5E4" />
          {/* Warm honey-sandstone walls */}
          <IsoPrism
            cx={cx}
            cy={cy + 3}
            rx={28}
            ry={14}
            height={26}
            topColor="#FDE68A"
            leftColor="#FEF3C7"
            rightColor="#FDE68A"
          />
          {/* Brick oven chimney */}
          <rect x={cx + 12} y={cy - 40} width={7} height={18} fill="#9A3412" />
          {isRunning && (
            <circle cx={cx + 15.5} cy={cy - 45} r={3.5} fill="#F8FAFC" opacity="0.7" className="animate-smoke" />
          )}
          <IsoGableRoof
            cx={cx}
            cy={cy - 23}
            rx={30}
            ry={15}
            peakHeight={15}
            leftSlopeColor="#B91C1C"
            rightSlopeColor="#991B1B"
            gableColor="#FEF3C7"
          />
          <LeftWallPlane x={cx - 28} y={cy - 23}>
            <rect x="3" y="2" width="22" height="5.5" rx="0.8" fill="#78350F" />
            <text x="14" y="6.2" textAnchor="middle" fill="#FEF3C7" fontSize="3.8" fontWeight="700" letterSpacing="0.4">
              BAKERY
            </text>
            {/* Red & cream striped awning */}
            <polygon points="1,9 26,9 28,14 3,14" fill="#DC2626" />
            {[4, 10, 16, 22].map((sx) => (
              <polygon key={sx} points={`${sx},9 ${sx + 3},9 ${sx + 4},14 ${sx + 1},14`} fill="#FFFBEB" />
            ))}
            {/* Bread display window */}
            <rect x="3" y="15" width="13" height="8" fill={warmGlass} stroke="#78350F" strokeWidth="0.6" />
            <ellipse cx="6.5" cy="20.5" rx="2" ry="1.2" fill="#D97706" />
            <ellipse cx="10.5" cy="20.5" rx="2" ry="1.2" fill="#B45309" />
            <ellipse cx="13.5" cy="20.5" rx="1.6" ry="1.1" fill="#F59E0B" />
            <rect x="18.5" y="15" width="6.5" height="11" fill="#78350F" />
          </LeftWallPlane>
          {/* Wooden pastry sign outside */}
          <ellipse cx={cx + 22} cy={cy + 9} rx={3.5} ry={2} fill="#D97706" />
        </g>
      );

    case 'townhouse':
      return (
        <g>
          {/* Red-brick facade with white stone trim & dark slate roof */}
          <IsoPrism
            cx={cx}
            cy={cy + 4}
            rx={28}
            ry={14}
            height={42}
            topColor="#475569"
            leftColor="#B4533C"
            rightColor="#933F2B"
          />
          {/* White stone cornice band */}
          <IsoPrism
            cx={cx}
            cy={cy - 38}
            rx={29}
            ry={14.5}
            height={3}
            topColor="#F8FAFC"
            leftColor="#F1F5F9"
            rightColor="#CBD5E1"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 41}
            rx={30}
            ry={15}
            peakHeight={14}
            leftSlopeColor="#334155"
            rightSlopeColor="#1E293B"
            gableColor="#B4533C"
          />
          <LeftWallPlane x={cx - 28} y={cy - 38}>
            {/* Two stories of sash windows with white sills & flower boxes */}
            {[5, 19].map((wy, rowIdx) => (
              <g key={wy}>
                {[4, 16].map((wx) => (
                  <g key={wx}>
                    <rect x={wx} y={wy} width="7.5" height="9" fill={coolGlass} stroke="#F8FAFC" strokeWidth="0.9" />
                    <line x1={wx + 3.75} y1={wy} x2={wx + 3.75} y2={wy + 9} stroke="#F8FAFC" strokeWidth="0.5" />
                    <line x1={wx} y1={wy + 4.5} x2={wx + 7.5} y2={wy + 4.5} stroke="#F8FAFC" strokeWidth="0.5" />
                    {rowIdx === 1 && (
                      <rect x={wx - 0.5} y={wy + 8.5} width="8.5" height="2" fill="#15803D" />
                    )}
                  </g>
                ))}
              </g>
            ))}
            {/* Front stoop door */}
            <rect x="11" y="31" width="6" height="11" fill="#1E293B" stroke="#F8FAFC" strokeWidth="0.7" />
          </LeftWallPlane>
          <RightWallPlane x={cx} y={cy - 24}>
            {[5, 19].map((wy) => (
              <g key={wy}>
                <rect x="5" y={wy} width="7" height="8.5" fill={warmGlass} stroke="#F8FAFC" strokeWidth="0.8" />
                <rect x="16" y={wy} width="7" height="8.5" fill={warmGlass} stroke="#F8FAFC" strokeWidth="0.8" />
              </g>
            ))}
          </RightWallPlane>
        </g>
      );

    case 'apartments':
      return (
        <g>
          {/* Warm limestone & terracotta 3-story courtyard building */}
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={34}
            ry={17}
            height={52}
            topColor="#E2E8F0"
            leftColor="#F1E7D8"
            rightColor="#D6C8B4"
          />
          {/* Rooftop terrace garden */}
          <IsoPrism
            cx={cx}
            cy={cy - 47}
            rx={26}
            ry={13}
            height={5}
            topColor={theme.foliagePrimary}
            leftColor="#9A3412"
            rightColor="#7C2D12"
          />
          <LeftWallPlane x={cx - 34} y={cy - 47}>
            {[6, 20, 34].map((wy) => (
              <g key={wy}>
                {[4, 14, 24].map((wx) => (
                  <g key={wx}>
                    <rect x={wx} y={wy} width="6.5" height="8" fill={warmGlass} stroke="#475569" strokeWidth="0.6" />
                    {/* Balcony rail */}
                    {wy < 30 && (
                      <rect x={wx - 0.8} y={wy + 6} width="8.1" height="3" fill="none" stroke="#334155" strokeWidth="0.7" />
                    )}
                  </g>
                ))}
              </g>
            ))}
            <rect x="14" y="42" width="6" height="10" fill="#0F766E" stroke="#1E293B" strokeWidth="0.6" />
          </LeftWallPlane>
          <RightWallPlane x={cx} y={cy - 30}>
            {[6, 20, 34].map((wy) => (
              <g key={wy}>
                <rect x="6" y={wy} width="8" height="8" fill={coolGlass} stroke="#475569" strokeWidth="0.6" />
                <rect x="19" y={wy} width="8" height="8" fill={coolGlass} stroke="#475569" strokeWidth="0.6" />
              </g>
            ))}
          </RightWallPlane>
        </g>
      );

    case 'clocktower':
      return (
        <g>
          {/* Base stone plinth */}
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={26}
            ry={13}
            height={10}
            topColor="#94A3B8"
            leftColor="#CBD5E1"
            rightColor="#94A3B8"
          />
          {/* Brick/stone tower shaft */}
          <IsoPrism
            cx={cx}
            cy={cy - 4}
            rx={20}
            ry={10}
            height={58}
            topColor="#475569"
            leftColor="#E7E5E4"
            rightColor="#CBD5E1"
          />
          {/* Verdigris copper spire */}
          <IsoPyramidRoof
            cx={cx}
            cy={cy - 62}
            rx={22}
            ry={11}
            peakHeight={28}
            leftColor="#0D9488"
            rightColor="#0F766E"
          />
          {/* Finial */}
          <line x1={cx} y1={cy - 90} x2={cx} y2={cy - 98} stroke="#F59E0B" strokeWidth="1.8" />
          <circle cx={cx} cy={cy - 98} r={2} fill="#FBBF24" />
          {/* Clock faces & tall lancet belfry slits */}
          <LeftWallPlane x={cx - 20} y={cy - 62}>
            <circle cx="10" cy="12" r="6.5" fill="#FFFFFF" stroke="#B45309" strokeWidth="1.2" />
            <line x1="10" y1="12" x2="10" y2="7.5" stroke="#0F172A" strokeWidth="1.1" />
            <line x1="10" y1="12" x2="13.5" y2="12.5" stroke="#0F172A" strokeWidth="1.1" />
            <rect x="7" y="25" width="6" height="14" rx="3" fill="#334155" />
            <rect x="7" y="45" width="6" height="12" fill="#78350F" />
          </LeftWallPlane>
          <RightWallPlane x={cx} y={cy - 52}>
            <circle cx="10" cy="12" r="6.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.2" />
            <line x1="10" y1="12" x2="10" y2="8" stroke="#0F172A" strokeWidth="1" />
            <line x1="10" y1="12" x2="13" y2="11" stroke="#0F172A" strokeWidth="1" />
            <rect x="7" y="25" width="6" height="14" rx="3" fill="#334155" />
          </RightWallPlane>
        </g>
      );

    case 'tram_station':
      return (
        <g>
          {/* Platform & steel tracks */}
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={42}
            ry={21}
            height={5}
            topColor="#CBD5E1"
            leftColor="#94A3B8"
            rightColor="#64748B"
          />
          <line x1={cx - 32} y1={cy + 14} x2={cx + 26} y2={cy - 15} stroke="#475569" strokeWidth="1.5" />
          <line x1={cx - 26} y1={cy + 17} x2={cx + 32} y2={cy - 12} stroke="#475569" strokeWidth="1.5" />
          {/* Brick station house */}
          <IsoPrism
            cx={cx - 8}
            cy={cy - 1}
            rx={22}
            ry={11}
            height={22}
            topColor="#475569"
            leftColor="#B4533C"
            rightColor="#933F2B"
          />
          <IsoGableRoof
            cx={cx - 8}
            cy={cy - 23}
            rx={25}
            ry={12.5}
            peakHeight={11}
            leftSlopeColor="#1E293B"
            rightSlopeColor="#0F172A"
            gableColor="#F8FAFC"
          />
          <LeftWallPlane x={cx - 30} y={cy - 23}>
            <rect x="2" y="2" width="18" height="5" fill="#0F172A" />
            <text x="11" y="5.8" textAnchor="middle" fill="#F8FAFC" fontSize="3.4" fontWeight="700">
              TRAMWAY
            </text>
            <rect x="4" y="10" width="6" height="8" fill={warmGlass} stroke="#F8FAFC" strokeWidth="0.6" />
            <rect x="13" y="10" width="6" height="12" fill="#0F766E" />
          </LeftWallPlane>
          {/* Vintage Red/Cream Tramcar */}
          <IsoPrism
            cx={cx + 12}
            cy={cy + 6}
            rx={14}
            ry={7}
            height={11}
            topColor="#F8FAFC"
            leftColor="#DC2626"
            rightColor="#B91C1C"
          />
          <IsoPrism
            cx={cx + 12}
            cy={cy - 3}
            rx={14}
            ry={7}
            height={5}
            topColor="#CBD5E1"
            leftColor={warmGlass}
            rightColor={coolGlass}
          />
        </g>
      );

    case 'museum':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={44}
            ry={22}
            height={6}
            topColor="#E2E8F0"
            leftColor="#CBD5E1"
            rightColor="#94A3B8"
          />
          <IsoPrism
            cx={cx}
            cy={cy}
            rx={36}
            ry={18}
            height={30}
            topColor="#CBD5E1"
            leftColor="#F8FAFC"
            rightColor="#E2E8F0"
          />
          {/* Verdigris Copper Classical Dome */}
          <ellipse cx={cx} cy={cy - 32} rx={21} ry={10.5} fill="#0F766E" />
          <path
            d={`M ${cx - 19} ${cy - 32} A 19 22 0 0 1 ${cx + 19} ${cy - 32} Z`}
            fill="#0D9488"
            stroke="#115E59"
            strokeWidth="0.8"
          />
          <circle cx={cx} cy={cy - 55} r={3} fill="#FBBF24" />
          <LeftWallPlane x={cx - 36} y={cy - 30}>
            <rect x="3" y="1" width="30" height="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.5" />
            <text x="18" y="5.4" textAnchor="middle" fill="#1E293B" fontSize="4.1" fontWeight="700" letterSpacing="0.7">
              MUSEUM
            </text>
            {[5, 11, 23, 29].map((cxCol) => (
              <rect key={cxCol} x={cxCol} y="8" width="2.4" height="22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.4" />
            ))}
            <rect x="14.5" y="14" width="7" height="16" fill="#475569" />
          </LeftWallPlane>
          <RightWallPlane x={cx} y={cy - 12}>
            {[6, 16, 26].map((wx) => (
              <rect key={wx} x={wx} y="-9" width="5" height="14" rx="2.5" fill={coolGlass} stroke="#64748B" strokeWidth="0.5" />
            ))}
          </RightWallPlane>
        </g>
      );

    case 'observatory_dome':
      return (
        <g>
          <IsoPrism
            cx={cx}
            cy={cy + 6}
            rx={38}
            ry={19}
            height={5}
            topColor="#CBD5E1"
            leftColor="#94A3B8"
            rightColor="#64748B"
          />
          <IsoPrism
            cx={cx}
            cy={cy + 1}
            rx={32}
            ry={16}
            height={26}
            topColor="#64748B"
            leftColor="#F1F5F9"
            rightColor="#CBD5E1"
          />
          {/* Brass & copper dome */}
          <ellipse cx={cx} cy={cy - 26} rx={26} ry={13} fill="#475569" />
          <path
            d={`M ${cx - 24} ${cy - 26} A 24 27 0 0 1 ${cx + 24} ${cy - 26} Z`}
            fill={night ? '#D97706' : '#334155'}
            stroke="#1E293B"
            strokeWidth="0.8"
          />
          {/* Brass telescope barrel */}
          <line x1={cx + 5} y1={cy - 40} x2={cx + 25} y2={cy - 58} stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx={cx + 25} cy={cy - 58} r={3} fill="#FEF08A" />
          <LeftWallPlane x={cx - 32} y={cy - 25}>
            {[5, 13, 21].map((wx) => (
              <rect key={wx} x={wx} y="6" width="5" height="9" rx="2.5" fill={warmGlass} stroke="#475569" strokeWidth="0.6" />
            ))}
          </LeftWallPlane>
        </g>
      );

    case 'plaza_fountain':
      return (
        <g>
          <polygon points={isoDiamondPoints(cx, cy + 5, 48, 24)} fill="#E7E5E4" stroke="rgba(15,23,42,0.1)" />
          <ellipse cx={cx} cy={cy + 3} rx={24} ry={12} fill={theme.waterColor} stroke="#94A3B8" strokeWidth="2.2" />
          <ellipse cx={cx} cy={cy - 10} rx={10} ry={5} fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.7" />
          <rect x={cx - 3} y={cy - 22} width={6} height={22} rx={2} fill="#CBD5E1" />
          <path
            d={`M ${cx} ${cy - 24} Q ${cx - 10} ${cy - 18} ${cx - 12} ${cy - 1} M ${cx} ${cy - 24} Q ${cx + 10} ${cy - 18} ${cx + 12} ${cy - 1}`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          {/* Corner park benches & streetlamp */}
          <rect x={cx - 34} y={cy + 2} width={10} height={3.5} rx={1} fill="#78350F" />
          <rect x={cx + 24} y={cy + 2} width={10} height={3.5} rx={1} fill="#78350F" />
          <line x1={cx - 26} y1={cy - 10} x2={cx - 26} y2={cy - 24} stroke="#1E293B" strokeWidth="1.4" />
          <circle cx={cx - 26} cy={cy - 25} r={2.5} fill={night ? '#FDE047' : '#FEF3C7'} />
        </g>
      );

    case 'greenhouse':
    case 'conservatory':
      return (
        <g>
          {/* Brick knee-wall base */}
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={36}
            ry={18}
            height={10}
            topColor={theme.foliagePrimary}
            leftColor="#B4533C"
            rightColor="#933F2B"
          />
          {/* Iron-and-glass frame */}
          <IsoPrism
            cx={cx}
            cy={cy - 5}
            rx={32}
            ry={16}
            height={22}
            topColor="rgba(186,230,253,0.75)"
            leftColor="rgba(186,230,253,0.68)"
            rightColor="rgba(125,211,252,0.58)"
            stroke="#F8FAFC"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 27}
            rx={33}
            ry={16.5}
            peakHeight={16}
            leftSlopeColor="rgba(224,242,254,0.82)"
            rightSlopeColor="rgba(186,230,253,0.74)"
            gableColor="rgba(224,242,254,0.88)"
          />
          {/* Lush indoor foliage */}
          <circle cx={cx - 6} cy={cy - 12} r={9} fill="#15803D" opacity="0.9" />
          <circle cx={cx + 9} cy={cy - 10} r={7} fill="#16A34A" opacity="0.9" />
          <circle cx={cx + 2} cy={cy - 18} r={6} fill="#22C55E" opacity="0.85" />
          <LeftWallPlane x={cx - 32} y={cy - 27}>
            {[8, 16, 24].map((mx) => (
              <line key={mx} x1={mx} y1="0" x2={mx} y2="22" stroke="#FFFFFF" strokeWidth="0.8" />
            ))}
          </LeftWallPlane>
        </g>
      );

    case 'cottage':
      return (
        <g>
          {/* Timber-framed whitewashed cottage */}
          <IsoPrism
            cx={cx}
            cy={cy + 5}
            rx={26}
            ry={13}
            height={22}
            topColor="#E2D9C8"
            leftColor="#FFFBEB"
            rightColor="#E7E5E4"
          />
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
            leftSlopeColor="#B45309"
            rightSlopeColor="#92400E"
            gableColor="#FFFBEB"
          />
          <LeftWallPlane x={cx - 26} y={cy - 17}>
            {/* Half-timber beams */}
            <line x1="2" y1="0" x2="2" y2="22" stroke="#78350F" strokeWidth="1.2" />
            <line x1="24" y1="0" x2="24" y2="22" stroke="#78350F" strokeWidth="1.2" />
            <line x1="0" y1="11" x2="26" y2="11" stroke="#78350F" strokeWidth="1" />
            <rect x="6" y="4" width="6" height="6" fill={warmGlass} stroke="#78350F" strokeWidth="0.6" />
            <rect x="16" y="10" width="6" height="12" fill="#78350F" />
          </LeftWallPlane>
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
            topColor="#78350F"
            leftColor="#FEF3C7"
            rightColor="#E2D9C8"
          />
          <IsoGableRoof
            cx={cx}
            cy={cy - 27}
            rx={36}
            ry={18}
            peakHeight={17}
            leftSlopeColor="#9A3412"
            rightSlopeColor="#7C2D12"
            gableColor="#E2D9C8"
          />
          <LeftWallPlane x={cx - 34} y={cy - 27}>
            <rect x="4" y="4" width="8" height="7" fill={warmGlass} stroke="#78350F" strokeWidth="0.8" />
            <rect x="20" y="4" width="8" height="7" fill={warmGlass} stroke="#78350F" strokeWidth="0.8" />
            <rect x="11" y="12" width="10" height="5" fill="#78350F" />
            <text x="16" y="15.8" textAnchor="middle" fill="#FEF3C7" fontSize="3.8" fontWeight="700">
              INN
            </text>
            <rect x="5" y="19" width="9" height="8" fill={warmGlass} stroke="#78350F" strokeWidth="0.7" />
            <rect x="19" y="19" width="7" height="13" fill="#78350F" />
          </LeftWallPlane>
        </g>
      );

    case 'market_stall':
      return (
        <g>
          <polygon points={isoDiamondPoints(cx, cy + 5, 42, 21)} fill="#E7E5E4" />
          {/* Stall 1: Red/Cream */}
          <IsoPrism cx={cx - 10} cy={cy + 2} rx={14} ry={7} height={14} topColor="#DC2626" leftColor="#FEF3C7" rightColor="#FDE68A" />
          {/* Produce crates */}
          <circle cx={cx - 16} cy={cy + 5} r={2.2} fill="#EF4444" />
          <circle cx={cx - 12} cy={cy + 7} r={2.2} fill="#22C55E" />
          {/* Stall 2: Teal/Cream */}
          <IsoPrism cx={cx + 12} cy={cy + 6} rx={13} ry={6.5} height={13} topColor="#0F766E" leftColor="#F8FAFC" rightColor="#E2E8F0" />
          <circle cx={cx + 8} cy={cy + 10} r={2} fill="#F59E0B" />
        </g>
      );

    case 'chapel':
      return (
        <g>
          <IsoPrism cx={cx} cy={cy + 5} rx={28} ry={14} height={30} topColor="#475569" leftColor="#E7E5E4" rightColor="#CBD5E1" />
          <IsoGableRoof cx={cx} cy={cy - 25} rx={30} ry={15} peakHeight={15} leftSlopeColor="#334155" rightSlopeColor="#1E293B" gableColor="#E7E5E4" />
          <IsoPrism cx={cx - 10} cy={cy - 22} rx={9} ry={4.5} height={28} topColor="#64748B" leftColor="#E7E5E4" rightColor="#CBD5E1" />
          <IsoPyramidRoof cx={cx - 10} cy={cy - 50} rx={10} ry={5} peakHeight={18} leftColor="#334155" rightColor="#1E293B" />
          <LeftWallPlane x={cx - 28} y={cy - 25}>
            <circle cx="14" cy="9" r="4" fill="#38BDF8" stroke="#475569" strokeWidth="0.7" />
            <rect x="11" y="17" width="6" height="13" rx="3" fill="#78350F" />
          </LeftWallPlane>
        </g>
      );

    case 'barn':
      return (
        <g>
          <IsoPrism cx={cx} cy={cy + 5} rx={32} ry={16} height={26} topColor="#7F1D1D" leftColor="#B91C1C" rightColor="#991B1B" />
          <IsoGableRoof cx={cx} cy={cy - 21} rx={34} ry={17} peakHeight={18} leftSlopeColor="#78350F" rightSlopeColor="#451A03" gableColor="#B91C1C" />
          <LeftWallPlane x={cx - 32} y={cy - 21}>
            <rect x="9" y="11" width="14" height="15" fill="#7F1D1D" stroke="#FEF2F2" strokeWidth="1" />
            <line x1="9" y1="11" x2="23" y2="26" stroke="#FEF2F2" strokeWidth="0.9" />
            <line x1="23" y1="11" x2="9" y2="26" stroke="#FEF2F2" strokeWidth="0.9" />
          </LeftWallPlane>
        </g>
      );

    case 'windmill':
      return (
        <g>
          <IsoPrism cx={cx} cy={cy + 6} rx={20} ry={10} height={44} topColor="#78350F" leftColor="#F5F5F4" rightColor="#D6D3D1" />
          <IsoPyramidRoof cx={cx} cy={cy - 38} rx={22} ry={11} peakHeight={16} leftColor="#9A3412" rightColor="#7C2D12" />
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

    case 'well':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 4} rx={24} ry={12} fill="#E7E5E4" />
          <IsoPrism cx={cx} cy={cy + 2} rx={14} ry={7} height={11} topColor={theme.waterColor} leftColor="#94A3B8" rightColor="#64748B" />
          <line x1={cx - 10} y1={cy - 8} x2={cx - 10} y2={cy - 28} stroke="#78350F" strokeWidth="2.4" />
          <line x1={cx + 10} y1={cy - 8} x2={cx + 10} y2={cy - 28} stroke="#78350F" strokeWidth="2.4" />
          <IsoGableRoof cx={cx} cy={cy - 26} rx={18} ry={9} peakHeight={10} leftSlopeColor="#9A3412" rightSlopeColor="#7C2D12" gableColor="#78350F" />
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
              <rect x={cx + tree.dx - 2.5} y={cy + tree.dy - 14 * tree.s} width={5} height={16 * tree.s} fill="#6B4F3A" />
              <ellipse cx={cx + tree.dx} cy={cy + tree.dy - 24 * tree.s} rx={14 * tree.s} ry={16 * tree.s} fill={idx % 2 === 0 ? theme.foliagePrimary : theme.foliageSecondary} />
              <ellipse cx={cx + tree.dx - 3} cy={cy + tree.dy - 28 * tree.s} rx={9 * tree.s} ry={10 * tree.s} fill={theme.foliagePrimary} opacity="0.85" />
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
          <circle cx={cx - 8} cy={cy + 1} r={1.8} fill="#F472B6" />
          <ellipse cx={cx + 2} cy={cy} rx={3} ry={1.3} fill="#F97316" />
          <ellipse cx={cx - 10} cy={cy + 7} rx={2.5} ry={1.1} fill="#FB923C" />
        </g>
      );

    case 'flower_bed':
      return (
        <g>
          <IsoPrism cx={cx} cy={cy + 4} rx={32} ry={16} height={5} topColor={theme.foliagePrimary} leftColor="#78716C" rightColor="#57534E" />
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
          <IsoPrism cx={cx} cy={cy + 5} rx={24} ry={12} height={5} topColor="#E7E5E4" leftColor="#CBD5E1" rightColor="#94A3B8" />
          {[-16, -6, 6, 16].map((dx, i) => (
            <line key={i} x1={cx + dx} y1={cy + (Math.abs(dx) > 10 ? 0 : 6)} x2={cx + dx} y2={cy - 22} stroke="#F8FAFC" strokeWidth="2.4" />
          ))}
          <IsoPyramidRoof cx={cx} cy={cy - 22} rx={26} ry={13} peakHeight={18} leftColor="#0F766E" rightColor="#115E59" />
        </g>
      );

    case 'footbridge':
    case 'bridge_arch':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 6} rx={36} ry={16} fill={theme.waterColor} />
          <path d={`M ${cx - 28} ${cy + 8} Q ${cx} ${cy - 20} ${cx + 28} ${cy + 8} L ${cx + 22} ${cy + 14} Q ${cx} ${cy - 8} ${cx - 22} ${cy + 14} Z`} fill="#B45309" stroke="#78350F" strokeWidth="1" />
          <path d={`M ${cx - 28} ${cy + 1} Q ${cx} ${cy - 27} ${cx + 28} ${cy + 1}`} fill="none" stroke="#78350F" strokeWidth="2.2" />
        </g>
      );

    case 'amphitheater':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 6} rx={38} ry={19} fill="#CBD5E1" stroke="#94A3B8" />
          <ellipse cx={cx} cy={cy + 4} rx={28} ry={14} fill="#E2E8F0" stroke="#94A3B8" />
          <ellipse cx={cx} cy={cy + 2} rx={17} ry={8.5} fill="#F8FAFC" stroke="#94A3B8" />
          <circle cx={cx} cy={cy + 2} r={4} fill={theme.accentColor} />
        </g>
      );

    case 'lantern_pavilion':
      return (
        <g>
          <IsoPrism cx={cx} cy={cy + 5} rx={28} ry={14} height={7} topColor="#94A3B8" leftColor="#64748B" rightColor="#475569" />
          <IsoPrism cx={cx} cy={cy - 2} rx={22} ry={11} height={18} topColor="#991B1B" leftColor={warmGlass} rightColor="#FDE68A" />
          <IsoPyramidRoof cx={cx} cy={cy - 20} rx={29} ry={14.5} peakHeight={16} leftColor="#991B1B" rightColor="#7F1D1D" />
          <circle cx={cx} cy={cy - 38} r={3} fill="#FBBF24" />
        </g>
      );
  }
}

function renderConstructionSite(
  cx: number,
  cy: number,
  theme: EnvironmentTheme,
  isRunning: boolean,
  buildProgress: number
) {
  const risingHeight = 3 + Math.round(Math.min(1, Math.max(0, buildProgress)) * 12);

  return (
    <g aria-label={isRunning ? 'Active construction site with workers building' : 'Staked construction plot'}>
      <polygon points={isoDiamondPoints(cx, cy + 2, 42, 21)} fill={theme.pathColor} opacity="0.72" />
      <polygon
        points={isoDiamondPoints(cx, cy + 2, 44, 22)}
        fill="none"
        stroke="#F59E0B"
        strokeWidth="1.75"
        strokeDasharray="5 4"
        className={isRunning ? 'animate-blueprint-pulse' : ''}
      />

      <IsoPrism cx={cx} cy={cy + 2} rx={24} ry={12} height={risingHeight} topColor="#E2E8F0" leftColor="#CBD5E1" rightColor="#94A3B8" />

      <g stroke="#92400E" strokeWidth="2.2" strokeLinecap="round">
        <line x1={cx - 18} y1={cy - 2} x2={cx - 18} y2={cy - 34} />
        <line x1={cx + 18} y1={cy - 2} x2={cx + 18} y2={cy - 30} />
        <line x1={cx - 19} y1={cy - 24} x2={cx + 19} y2={cy - 22} strokeWidth="1.6" />
      </g>
      <g className={isRunning ? 'animate-crane' : ''}>
        <line x1={cx - 18} y1={cy - 33} x2={cx + 10} y2={cy - 38} stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
        <line x1={cx + 6} y1={cy - 37} x2={cx + 6} y2={cy - 21} stroke="#64748B" strokeWidth="1" />
        <rect x={cx + 2} y={cy - 21} width={8} height={6} rx={1} fill="#B45309" />
      </g>

      <g transform={`translate(${cx + 18}, ${cy + 6})`}>
        <rect x="0" y="0" width="12" height="3" rx="0.8" fill="#B45309" />
        <rect x="1" y="-3" width="12" height="3" rx="0.8" fill="#D97706" />
      </g>

      <g transform={`translate(${cx - 24}, ${cy + 6})`} className={isRunning ? 'animate-worker-bob' : ''}>
        <ellipse cx="0" cy="4" rx="6" ry="3" fill="rgba(15,23,42,0.22)" />
        <rect x="-2.5" y="-6" width="5" height="9" rx="1.5" fill="#1E293B" />
        <rect x="-3.5" y="-12" width="7" height="7" rx="1.5" fill="#EA580C" />
        <circle cx="0" cy="-16" r="3.2" fill="#FDE68A" />
        <path d="M -4 -17 A 4 3.5 0 0 1 4 -17 Z" fill="#F59E0B" />
        <g transform="translate(3, -10)" className={isRunning ? 'animate-hammer' : ''}>
          <line x1="0" y1="0" x2="6" y2="-4" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="5" y="-7" width="4" height="2.6" rx="0.6" fill="#475569" transform="rotate(-25 6 -5)" />
        </g>
        {isRunning && (
          <g transform="translate(10, -13)">
            <circle cx="0" cy="0" r="1.6" fill="#FBBF24" className="animate-spark" />
            <circle cx="4" cy="-2" r="1.3" fill="#FDE047" className="animate-spark" style={{ animationDelay: '0.45s' }} />
          </g>
        )}
      </g>

      <g transform={`translate(${cx + 14}, ${cy + 12})`} className={isRunning ? 'animate-worker-bob' : ''} style={{ animationDelay: '0.35s' }}>
        <ellipse cx="0" cy="3" rx="5.5" ry="2.6" fill="rgba(15,23,42,0.2)" />
        <rect x="-2.2" y="-5" width="4.4" height="7" rx="1.2" fill="#334155" />
        <rect x="-3" y="-11" width="6" height="6.5" rx="1.4" fill="#0D9488" />
        <circle cx="0" cy="-14.5" r="3" fill="#FDE68A" />
        <path d="M -3.8 -15.5 A 3.8 3.2 0 0 1 3.8 -15.5 Z" fill="#F59E0B" />
      </g>
    </g>
  );
}

export const IsometricWorld: React.FC<IsometricWorldProps> = ({
  theme,
  style,
  allBlueprints,
  unlockedIds,
  nextStructureId,
  buildProgress,
  selectedStructureId,
  onSelectStructure,
  isRunning,
  newlyUnlockedId,
}) => {
  const orderedSlots = useMemo(() => {
    return [...allBlueprints].sort((a, b) => a.col + a.row - (b.col + b.row));
  }, [allBlueprints]);

  const unlockedCount = unlockedIds.size;

  const topCorner = { x: ORIGIN_X, y: ORIGIN_Y - TILE_H };
  const rightCorner = { x: ORIGIN_X + 4 * TILE_W, y: ORIGIN_Y + 3 * TILE_H };
  const bottomCorner = { x: ORIGIN_X, y: ORIGIN_Y + 7 * TILE_H };
  const leftCorner = { x: ORIGIN_X - 4 * TILE_W, y: ORIGIN_Y + 3 * TILE_H };
  const cliffDepth = 38;

  const islandTopPolygon = `${topCorner.x},${topCorner.y} ${rightCorner.x},${rightCorner.y} ${bottomCorner.x},${bottomCorner.y} ${leftCorner.x},${leftCorner.y}`;
  const islandLeftCliff = `${leftCorner.x},${leftCorner.y} ${bottomCorner.x},${bottomCorner.y} ${bottomCorner.x},${bottomCorner.y + cliffDepth} ${leftCorner.x},${leftCorner.y + cliffDepth}`;
  const islandRightCliff = `${bottomCorner.x},${bottomCorner.y} ${rightCorner.x},${rightCorner.y} ${rightCorner.x},${rightCorner.y + cliffDepth} ${bottomCorner.x},${bottomCorner.y + cliffDepth}`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
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

        <rect x="0" y="0" width="860" height="520" fill={`url(#sky-${theme.id})`} />

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

        <circle cx="715" cy="86" r="54" fill="url(#sunGlow)" />
        <circle cx="715" cy="86" r="24" fill={theme.sunOrMoonColor} />

        <g opacity={theme.isNight ? 0.16 : 0.72} className="animate-cloud">
          <ellipse cx="185" cy="84" rx="44" ry="15" fill="#FFFFFF" />
          <ellipse cx="212" cy="78" rx="28" ry="13" fill="#FFFFFF" />
        </g>
        <g opacity={theme.isNight ? 0.12 : 0.6} className="animate-cloud-slow">
          <ellipse cx="520" cy="108" rx="38" ry="12" fill="#FFFFFF" />
          <ellipse cx="546" cy="102" rx="24" ry="10" fill="#FFFFFF" />
        </g>

        <polygon
          points={`${topCorner.x},${topCorner.y - 18} ${rightCorner.x + 36},${rightCorner.y + 18} ${bottomCorner.x},${bottomCorner.y + cliffDepth + 14} ${leftCorner.x - 36},${leftCorner.y + 18}`}
          fill={theme.waterColor}
          opacity="0.55"
        />

        <polygon points={islandLeftCliff} fill={theme.islandLeft} />
        <polygon points={islandRightCliff} fill={theme.islandRight} />
        <polygon points={islandTopPolygon} fill={theme.islandTop} />

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
              {isBuilt ? (
                <polygon points={isoDiamondPoints(x, y + 2, 42, 21)} fill={theme.pathColor} opacity="0.55" />
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

        {orderedSlots.map((bp) => {
          const { x, y } = toIso(bp.col, bp.row);

          if (!unlockedIds.has(bp.id)) {
            if (bp.id === nextStructureId) {
              return (
                <g key={`site-${bp.id}`}>
                  {renderConstructionSite(x, y, theme, isRunning, buildProgress)}
                </g>
              );
            }
            return null;
          }

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
                <ellipse cx={x} cy={y + 4} rx={46} ry={23} fill="none" stroke={theme.accentColor} strokeWidth="2.5" />
              )}
              {renderStructureArt(bp.kind, x, y, theme, isRunning)}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
