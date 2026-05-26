'use client';

import { cn } from '@twinspire/ui';
import { useId, useMemo } from 'react';

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface SparklineProps {
  data: SeriesPoint[];
  className?: string;
  stroke?: string;
  fill?: string;
  height?: number;
  ariaLabel?: string;
}

/** Tiny inline sparkline (SVG, no deps). */
export function Sparkline({
  data,
  className,
  stroke = 'currentColor',
  fill,
  height = 36,
  ariaLabel,
}: SparklineProps) {
  const id = useId();
  const path = useMemo(() => buildPath(data, 100, height), [data, height]);
  if (!data.length) return null;
  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel ?? 'trend'}
      className={cn('h-9 w-24 text-primary', className)}
    >
      {fill ? (
        <>
          <defs>
            <linearGradient id={`sparkline-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity="0.45" />
              <stop offset="100%" stopColor={fill} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${path.area}`}
            fill={`url(#sparkline-${id})`}
            stroke="none"
          />
        </>
      ) : null}
      <path d={path.line} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface AreaChartProps {
  data: SeriesPoint[];
  className?: string;
  height?: number;
  formatValue?: (v: number) => string;
  formatLabel?: (d: string) => string;
  yTicks?: number;
}

/** Larger area chart with axis ticks, grid, and tooltip hover dots. */
export function AreaChart({
  data,
  className,
  height = 220,
  formatValue = (v) => v.toLocaleString(),
  formatLabel = (d) => d.slice(5),
  yTicks = 4,
}: AreaChartProps) {
  const id = useId();
  const width = 600;
  const padding = { top: 12, right: 12, bottom: 22, left: 40 };

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map((d) => d.value));
  const min = 0;

  const path = useMemo(() => {
    if (!data.length) return { line: '', area: '' };
    const stepX = innerW / Math.max(1, data.length - 1);
    const pts = data.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + innerH - ((d.value - min) / (max - min || 1)) * innerH;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `${line} L${pts[pts.length - 1]?.[0].toFixed(2) ?? 0},${(padding.top + innerH).toFixed(2)} L${pts[0]?.[0].toFixed(2) ?? 0},${(padding.top + innerH).toFixed(2)} Z`;
    return { line, area };
  }, [data, innerH, innerW, padding.left, padding.top, max]);

  const yGridValues = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= yTicks; i += 1) out.push((max / yTicks) * i);
    return out;
  }, [max, yTicks]);

  if (!data.length) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Revenue trend"
      className={cn('h-[220px] w-full text-primary', className)}
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yGridValues.map((v, i) => {
        const y = padding.top + innerH - (v / (max || 1)) * innerH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              x2={padding.left + innerW}
              y1={y}
              y2={y}
              stroke="currentColor"
              opacity={0.08}
              strokeDasharray="3 4"
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              className="fill-muted-foreground"
            >
              {formatValue(Math.round(v))}
            </text>
          </g>
        );
      })}

      <path d={path.area} fill={`url(#area-${id})`} />
      <path d={path.line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {data.length > 0 ? (
        <g>
          {[0, Math.floor(data.length / 2), data.length - 1]
            .filter((idx, i, arr) => arr.indexOf(idx) === i)
            .map((idx) => {
              const stepX = innerW / Math.max(1, data.length - 1);
              const point = data[idx]!;
              const x = padding.left + idx * stepX;
              return (
                <text
                  key={idx}
                  x={x}
                  y={padding.top + innerH + 14}
                  textAnchor={idx === 0 ? 'start' : idx === data.length - 1 ? 'end' : 'middle'}
                  fontSize={10}
                  className="fill-muted-foreground"
                >
                  {formatLabel(point.date)}
                </text>
              );
            })}
        </g>
      ) : null}
    </svg>
  );
}

function buildPath(data: SeriesPoint[], width: number, height: number) {
  if (!data.length) return { line: '', area: '' };
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = width / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.value / max) * height * 0.92 - height * 0.04;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1]?.[0] ?? 0},${height} L0,${height} Z`;
  return { line, area };
}

export interface DonutProps {
  segments: Array<{ id: string; value: number; label?: string; color?: string }>;
  size?: number;
  thickness?: number;
  className?: string;
  ariaLabel?: string;
  center?: { primary: string; secondary?: string };
}

/** Lightweight donut chart for "orders by status" / category split. */
export function Donut({ segments, size = 160, thickness = 22, className, ariaLabel, center }: DonutProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  if (!total) {
    return (
      <div
        role="img"
        aria-label={ariaLabel ?? 'No data'}
        className={cn('flex items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground', className)}
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel ?? 'Donut chart'}
      className={cn('block', className)}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          opacity={0.08}
          strokeWidth={thickness}
        />
        {segments.map((seg) => {
          const length = (seg.value / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const el = (
            <circle
              key={seg.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color ?? 'currentColor'}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return el;
        })}
      </g>
      {center ? (
        <g>
          <text x="50%" y="48%" textAnchor="middle" className="fill-foreground" fontSize={Math.max(14, size * 0.13)} fontWeight={600}>
            {center.primary}
          </text>
          {center.secondary ? (
            <text x="50%" y="62%" textAnchor="middle" className="fill-muted-foreground" fontSize={11}>
              {center.secondary}
            </text>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}
