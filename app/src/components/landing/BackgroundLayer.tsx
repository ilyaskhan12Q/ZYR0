export function BackgroundLayer() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center bg-slate-100 dark:bg-slate-950"
    >
      <img
        src="/svgs/parabolic-pentagon.svg"
        alt=""
        className="w-full h-full object-cover object-center opacity-15 dark:opacity-25 mix-blend-multiply dark:mix-blend-screen"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200/70 via-transparent to-slate-200/70 dark:from-slate-950/50 dark:via-transparent dark:to-slate-950/80 pointer-events-none" />
    </div>
  );
}

