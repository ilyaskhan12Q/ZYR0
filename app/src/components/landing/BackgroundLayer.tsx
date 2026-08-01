export function BackgroundLayer() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center"
    >
      <img
        src="/svgs/parabolic-pentagon.svg"
        alt=""
        className="w-full h-full object-cover object-center opacity-40 dark:opacity-50"
        loading="eager"
      />
      {/* Contrast Overlay for Visual Depth & Typography Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/70 pointer-events-none" />
    </div>
  );
}
