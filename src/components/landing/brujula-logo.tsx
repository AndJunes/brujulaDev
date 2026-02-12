export default function BrujulaLogo({ size = 320 }: { size?: number }) {
  const cx = 100;
  const cy = 100;
  const outerR = 88;
  const innerR = 82;
  const tickLen = 6;

  const cardinals = [0, 90, 180, 270];
  const minorTicks = [45, 135, 225, 315];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={cx} cy={cy} r={outerR} stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx={cx} cy={cy} r={innerR} stroke="currentColor" strokeWidth="1" opacity="0.15" />

      {cardinals.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.sin(rad) * innerR;
        const y1 = cy - Math.cos(rad) * innerR;
        const x2 = cx + Math.sin(rad) * (innerR + tickLen);
        const y2 = cy - Math.cos(rad) * (innerR + tickLen);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" opacity="0.4" />
        );
      })}

      {minorTicks.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.sin(rad) * innerR;
        const y1 = cy - Math.cos(rad) * innerR;
        const x2 = cx + Math.sin(rad) * (innerR + tickLen * 0.6);
        const y2 = cy - Math.cos(rad) * (innerR + tickLen * 0.6);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.25" />
        );
      })}

      <polygon points={`${cx},${cy - 60} ${cx - 8},${cy} ${cx},${cy}`} fill="currentColor" opacity="0.9" />
      <polygon points={`${cx},${cy + 60} ${cx - 8},${cy} ${cx},${cy}`} fill="currentColor" opacity="0.25" />
      <polygon points={`${cx},${cy - 60} ${cx + 8},${cy} ${cx},${cy}`} fill="currentColor" opacity="0.7" />
      <polygon points={`${cx},${cy + 60} ${cx + 8},${cy} ${cx},${cy}`} fill="currentColor" opacity="0.15" />

      <circle cx={cx} cy={cy} r="4" fill="currentColor" opacity="0.6" />

      <text x={cx} y={cy - 65} textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" fontFamily="Space Grotesk, sans-serif" opacity="0.6">
        N
      </text>
    </svg>
  );
}
