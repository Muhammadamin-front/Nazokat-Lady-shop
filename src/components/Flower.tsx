// Brend belgisi: 5 bargli gul. Har bir barg alohida animatsiya qilinishi mumkin (--i).
export default function Flower({ className = "" }: { className?: string }) {
  return (
    <svg className={`flower ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r, i) => (
        <g key={r} transform={`rotate(${r} 50 50)`}>
          <ellipse className="petal" style={{ ["--i" as string]: i }} cx="50" cy="28" rx="12.5" ry="21" />
        </g>
      ))}
      <circle className="core" cx="50" cy="50" r="8.5" />
    </svg>
  );
}
