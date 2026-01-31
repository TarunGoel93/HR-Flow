import React from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  primaryText?: string;
  secondaryText?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export default function Modal({
  open,
  title,
  children,
  primaryText = "OK",
  secondaryText = "",
  onPrimary,
  onSecondary,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/60 backdrop-blur-sm">
      <div className="w-[min(560px,92vw)] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h3 className="m-0 text-lg font-semibold tracking-tight">{title}</h3>
        </div>

        <div className="px-5 py-4 leading-relaxed text-zinc-700">{children}</div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-4">
          {secondaryText ? (
            <button
              onClick={onSecondary}
              className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50"
            >
              {secondaryText}
            </button>
          ) : null}

          <button
            onClick={onPrimary}
            className="inline-flex items-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}

