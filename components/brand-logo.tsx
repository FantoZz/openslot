import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return (
    <Link className="brand-logo" href="/" aria-label="MATAS University">
      <Image src="/matas-wide-logo.svg" alt="MATAS University" width={143} height={32} priority />
    </Link>
  );
}
