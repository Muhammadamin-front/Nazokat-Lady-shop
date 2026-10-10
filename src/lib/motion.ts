// Harakat darajasi <html data-motion> da: off | lite | full (layout.tsx dagi inline skript belgilaydi).
// data-net="slow" — Data Saver yoki 2G: katta rasmlar o'rniga kichiklari, video avtomatik o'ynamaydi.

const html = () => (typeof document === "undefined" ? null : document.documentElement);
export const motionOn = () => html()?.dataset.motion !== "off";
export const slowNet = () => html()?.dataset.net === "slow";

export function haptic(ms = 10) {
  if (motionOn()) navigator.vibrate?.(ms);
}

export function bump(el: Element | null) {
  if (!el || !motionOn() || !("animate" in el)) return;
  el.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], {
    duration: 380,
    easing: "cubic-bezier(.34,1.56,.64,1)",
  });
}

// Mahsulot rasmi savat ikonkasiga "uchib" boradi
export function flyToCart(from: Element | null | undefined, src: string) {
  // telefonda pastki menyudagi, desktopda header'dagi savat — qaysi biri ko'rinib tursa
  const to = [...document.querySelectorAll("[data-cart-target]")].find((el) => el.getBoundingClientRect().width > 0);
  if (!from || !to || !motionOn() || !document.body.animate) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const size = 56;
  const x = a.left + a.width / 2 - size / 2;
  const y = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - x;
  const dy = b.top + b.height / 2 - size / 2 - y;
  const el = document.createElement("img");
  el.src = src;
  el.alt = "";
  el.className = "fly";
  el.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
  document.body.append(el);
  el.animate(
    [
      { transform: "translate(0,0) scale(1.4)", opacity: 0.2 },
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0.15 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 90}px) scale(.8)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0.4 },
    ],
    { duration: 750, easing: "cubic-bezier(.45,0,.6,.5)" }
  ).onfinish = () => {
    el.remove();
    bump(to);
  };
}
