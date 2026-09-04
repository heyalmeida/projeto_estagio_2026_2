import clsx from "clsx";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}

/**
 * Brand mark. Renders the logo image at three preset sizes; optionally
 * followed by the wordmark "Vestaply" in the editorial serif typeface.
 */
export function Logo({ size = "md", withWordmark = true, className }: LogoProps) {
  const dim = {
    sm: 24,
    md: 32,
    lg: 48,
  }[size];
  const word = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="Vestaply"
        width={dim}
        height={dim}
        className="inline-block h-auto w-auto"
        priority
      />
      {withWordmark && (
        <span className={clsx("font-editorial font-semibold tracking-tight", word)}>
          Vestaply
        </span>
      )}
    </span>
  );
}