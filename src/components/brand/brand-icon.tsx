import { cn } from "@/lib/utils";

interface BrandIconProps {
  className?: string;
  alt?: string;
}

const BRAND_MARK_PATH =
  "M587.37,508.1h-79.29v9.04h18.51v33.27c0,3.75-1.11,6.7-3.33,8.83-2.22,2.13-5.06,3.2-8.53,3.2s-6.4-1.07-8.62-3.2c-2.22-2.13-3.33-5.08-3.33-8.83v-3.75h-10.15v2.47c0,5,.94,9.18,2.81,12.54,1.88,3.36,4.49,5.9,7.85,7.63,3.35,1.74,7.17,2.6,11.43,2.6s8.15-.87,11.47-2.6c3.33-1.73,5.93-4.28,7.8-7.63,1.88-3.35,2.81-7.53,2.81-12.54v-31.99h21.8v53.23h10.24v-53.23h18.51v-9.04Z";

/** Centro geométrico do símbolo π no canvas original (1080×1080). */
const MARK_CENTER_X = 540;
const MARK_CENTER_Y = 540;

export function BrandIcon({ className, alt = "Projetse" }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 150 150"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
      className={cn("block h-full w-full shrink-0", className)}
    >
      <rect width="150" height="150" fill="#2c4935" />
      <g transform={`translate(${150 / 2} ${150 / 2})`}>
        <path
          fill="#4e7f5c"
          transform={`translate(${-MARK_CENTER_X} ${-MARK_CENTER_Y})`}
          d={BRAND_MARK_PATH}
        />
      </g>
    </svg>
  );
}
