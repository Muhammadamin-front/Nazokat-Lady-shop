"use client";

import { useRef } from "react";
import type { ToastAction } from "@/lib/ui";
import Icon from "./Icon";

type T = { msg: string; action?: ToastAction; id: number };

export default function Toast({ toast, onDone }: { toast: T | null; onDone: () => void }) {
  // Yopilish animatsiyasi davomida oxirgi matn ko'rinib turadi (bo'sh "pilyula" so'nmasligi uchun)
  const last = useRef<T | null>(null);
  if (toast) last.current = toast;
  const t = toast ?? last.current;

  return (
    <div className={`toast ${toast ? "is-on" : ""}`} role="status" aria-live="polite">
      {t && (
        <>
          <Icon name="check" className="toast__ico" />
          <span>{t.msg}</span>
          {t.action && (
            <button
              className="toast__btn"
              tabIndex={toast ? 0 : -1}
              onClick={() => {
                t.action!.onClick();
                onDone();
              }}
            >
              {t.action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}
