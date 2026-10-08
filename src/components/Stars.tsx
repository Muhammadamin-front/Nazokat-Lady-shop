// Yulduzcha reyting: 5 ta yulduz, kasr qismi kenglik bilan to'ldiriladi
export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const star = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z";
  const row = (cls: string) => (
    <span className={cls}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path d={star} />
        </svg>
      ))}
    </span>
  );
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} / 5`}>
      {row("stars__bg")}
      <span className="stars__fill" style={{ width: `${(value / 5) * 100}%` }}>
        {row("stars__fg")}
      </span>
    </span>
  );
}
