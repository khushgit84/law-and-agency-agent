export default function IndianEmblem({ className = "w-10 h-10", showMotto = true }) {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Ashoka Lion Capital Vector Silhouette with Gold/Bronze Metallic Sheen */}
        <defs>
          <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="chakraBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
        </defs>

        {/* Central & Flanking Lions' Manes and Crowns */}
        <path
          d="M50 8C43 8 38 12 36 17C33 16 28 17 26 21C24 25 25 30 27 33C24 35 21 39 21 44C21 51 26 56 31 58C32 63 35 68 40 70C42 74 46 76 50 76C54 76 58 74 60 70C65 68 68 63 69 58C74 56 79 51 79 44C79 39 76 35 73 33C75 30 76 25 74 21C72 17 67 16 64 17C62 12 57 8 50 8Z"
          fill="url(#emblemGold)"
        />

        {/* Lion Face Details & Features */}
        <path
          d="M50 14C45 14 42 18 42 23C42 27 45 30 50 30C55 30 58 27 58 23C58 18 55 14 50 14Z"
          fill="#78350f"
          opacity="0.25"
        />
        <circle cx="46" cy="22" r="1.5" fill="#78350f" />
        <circle cx="54" cy="22" r="1.5" fill="#78350f" />
        <path d="M48 26Q50 28 52 26" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />

        {/* Left and Right Lions Faces */}
        <path d="M30 25C27 25 25 28 25 32C25 35 27 37 30 37" stroke="#78350f" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M70 25C73 25 75 28 75 32C75 35 73 37 70 37" stroke="#78350f" strokeWidth="1" opacity="0.3" fill="none" />

        {/* Abacus Base / Pedestal */}
        <rect x="18" y="76" width="64" height="12" rx="2" fill="url(#emblemGold)" />
        <rect x="15" y="88" width="70" height="4" rx="1" fill="#b45309" />

        {/* Central Ashoka Chakra on Abacus */}
        <circle cx="50" cy="82" r="5" fill="#ffffff" stroke="url(#chakraBlue)" strokeWidth="1.2" />
        <circle cx="50" cy="82" r="1" fill="url(#chakraBlue)" />
        {/* Spokes */}
        <line x1="50" y1="77" x2="50" y2="87" stroke="url(#chakraBlue)" strokeWidth="0.8" />
        <line x1="45" y1="82" x2="55" y2="82" stroke="url(#chakraBlue)" strokeWidth="0.8" />
        <line x1="46.5" y1="78.5" x2="53.5" y2="85.5" stroke="url(#chakraBlue)" strokeWidth="0.8" />
        <line x1="46.5" y1="85.5" x2="53.5" y2="78.5" stroke="url(#chakraBlue)" strokeWidth="0.8" />

        {/* Galloping Horse (Left) & Bull (Right) reliefs */}
        <path d="M28 80C26 79 24 81 23 83C25 84 27 83 29 82" stroke="#78350f" strokeWidth="1.2" fill="none" />
        <path d="M72 80C74 79 76 81 77 83C75 84 73 83 71 82" stroke="#78350f" strokeWidth="1.2" fill="none" />

        {/* Bell Shaped Lotus Base Foundation */}
        <path
          d="M24 92C32 94 40 95 50 95C60 95 68 94 76 92C78 97 74 100 50 100C26 100 22 97 24 92Z"
          fill="url(#emblemGold)"
        />
      </svg>
      {showMotto && (
        <div className="text-[9px] tracking-widest font-serif font-bold text-amber-900 mt-0.5 whitespace-nowrap">
          सत्यमेव जयते
        </div>
      )}
    </div>
  );
}
