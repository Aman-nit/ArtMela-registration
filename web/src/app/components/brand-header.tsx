import Link from "next/link";
import Image from "next/image";

export function BrandHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="Pahchan Foundation home">
          <Image
            className="brand__logo"
            src="https://www.pahchanfoundation.org/img/Gol%20logo.png"
            alt="Pahchan Foundation logo"
            width={50}
            height={50}
          />
          <span className="brand__copy">
            <strong>Pahchan Foundation</strong>
            <small>Art Mela 2026 &mdash; Registration</small>
          </span>
        </Link>
      </div>
    </header>
  );
}
