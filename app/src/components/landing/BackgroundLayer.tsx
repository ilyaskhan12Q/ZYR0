export function BackgroundLayer() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center"
    >
      <img
        src="/svgs/final.svg"
        alt=""
        className="w-full h-full object-cover object-center opacity-40 dark:opacity-50"
        loading="eager"
      />
    </div>
  );
}
