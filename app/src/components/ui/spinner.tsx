import React from "react";
import { Loader } from "@/components/common/Loader";

export interface SpinnerProps {
  className?: string;
  size?: number;
  "aria-label"?: string;
}

function Spinner({ className, size = 18, "aria-label": ariaLabel = "Loading" }: SpinnerProps) {
  return (
    <Loader
      variant="inline"
      size={size}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}

export { Spinner };
