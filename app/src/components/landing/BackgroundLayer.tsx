export function BackgroundLayer() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center bg-slate-950"
    >
      <img
        src="/svgs/parabolic-pentagon.svg"
        alt=""
        className="w-full h-full object-cover object-center opacity-75"
        loading="eager"
      />
    </div>
  );
}

