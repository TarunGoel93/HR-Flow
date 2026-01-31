import React from "react";

type BannerVariant = "info" | "success" | "warning" | "error" | "locked";

interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  message?: string;
  className?: string;
}

const variantStyles: Record<BannerVariant, string> = {
  info: "bg-blue-50 text-blue-900 border-blue-200",
  success: "bg-emerald-50 text-emerald-900 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  error: "bg-rose-50 text-rose-900 border-rose-200",
  locked: "bg-zinc-50 text-zinc-900 border-zinc-200",
};

const variantAccent: Record<BannerVariant, string> = {
  info: "bg-blue-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-rose-400",
  locked: "bg-zinc-400",
};

export default function Banner({ variant = "info", title, message, className = "" }: BannerProps) {
  const base = "relative w-full overflow-hidden rounded-xl border shadow-sm";
  const colors = variantStyles[variant];
  const accent = variantAccent[variant];

  return (
    <div className={`${base} ${colors} ${className}`}>
      <div className="absolute -left-10 top-0 h-full w-28 rotate-12 opacity-20 blur-xl"/>
      <div className={`absolute left-0 top-0 h-full w-1.5 ${accent}`}/>
      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${accent}`}/>
        <div className="flex-1">
          {title ? <div className="font-semibold tracking-tight">{title}</div> : null}
          {message ? <div className="mt-1 text-sm leading-relaxed opacity-90">{message}</div> : null}
        </div>
      </div>
    </div>
  );
}
