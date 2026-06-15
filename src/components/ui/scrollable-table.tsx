import { type TableHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";

interface ScrollableTableProps extends TableHTMLAttributes<HTMLTableElement> {
  minWidthClass?: string;
}

export function ScrollableTable({
  className,
  minWidthClass = "min-w-[56rem]",
  children,
  ...props
}: ScrollableTableProps) {
  return (
    <HorizontalScrollArea>
      <table className={cn("w-full text-sm", minWidthClass, className)} {...props}>
        {children}
      </table>
    </HorizontalScrollArea>
  );
}
