const STEPS = [
  { t: "Tanlang", d: "Mahsulot, rang va o'lchamni tanlang." },
  { t: "Savatga qo'shing", d: "Ism, telefon va manzilingizni yozing." },
  { t: "Tasdiqlang", d: "Buyurtma darhol bizga yetib boradi — qo'ng'iroq qilib tasdiqlaymiz." },
];

export default function HowTo() {
  return (
    <section className="section howto">
      <h2>Qanday buyurtma beriladi</h2>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.t}>
            <b>{i + 1}</b>
            <div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
