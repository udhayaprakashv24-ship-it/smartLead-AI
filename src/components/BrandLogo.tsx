interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 18 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Geometric White "S" forming the left triangle wing */}
      <path
        d="M9.6 6.2L11.5 9.8H9.5L8.6 11.4H12.2L14.6 19.4H2.8L4.2 16.9H10.5L9.9 14.2H5.6L9.6 6.2Z"
        fill="#FFFFFF"
      />
      {/* Geometric Cyan ascending wing forming the right triangle half */}
      <path
        d="M11.3 4.0L16.2 17.2H18.1L15.8 12.8L17.6 11.8L21.3 19.4H15.5L10.5 5.4L11.3 4.0Z"
        fill="#67E8F9"
      />
    </svg>
  );
}

interface BrandLogoProps {
  variant?: 'light' | 'dark';
}

export function BrandLogo({ variant = 'light' }: BrandLogoProps) {
  const pillClasses =
    variant === 'dark'
      ? 'bg-white/10 text-white ring-1 ring-white/15'
      : 'bg-[#101828] text-white shadow-[0_10px_24px_-8px_rgba(16,24,40,0.4)] ring-1 ring-white/15';

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 whitespace-nowrap shrink-0 transition-transform duration-150 ${pillClasses}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] ring-1 ring-white/20">
        <BrandMark size={18} />
      </span>
      <span className="font-display text-sm font-semibold tracking-tight text-white">
        SmartLead AI
      </span>
    </span>
  );
}
