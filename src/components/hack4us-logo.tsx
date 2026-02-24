import Link from "next/link";

interface Hack4UsLogoProps {
  /** Optional className for size and other styling. Default: "text-4xl" */
  className?: string;
  /** If provided, wraps the logo in a Link to this href */
  href?: string;
}

export function Hack4UsLogo({ className = "text-4xl font-black tracking-tight", href }: Hack4UsLogoProps) {
  const content = (
    <h1 className={className}>
      <span className="text-foreground">HACK</span>
      <span className="text-primary">4</span>
      <span className="text-foreground">US</span>
    </h1>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
