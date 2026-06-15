import { useCallback, useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface HorizontalScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  wheelToHorizontal?: boolean;
}

export function HorizontalScrollArea({
  className,
  children,
  wheelToHorizontal = true,
  ...props
}: HorizontalScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!wheelToHorizontal) return;
      const el = scrollRef.current;
      if (!el || el.scrollWidth <= el.clientWidth) return;

      const atLeft = el.scrollLeft <= 0;
      const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

      if (e.deltaY > 0 && !atRight) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      } else if (e.deltaY < 0 && !atLeft) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    },
    [wheelToHorizontal],
  );

  return (
    <div
      ref={scrollRef}
      className={cn("overflow-x-auto", className)}
      onWheel={onWheel}
      {...props}
    >
      {children}
    </div>
  );
}
