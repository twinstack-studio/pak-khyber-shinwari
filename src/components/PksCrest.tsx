/**
 * The PKS crest, redrawn as vector to match the restaurant's logo:
 * a red hairline ring outside a heavy blue ring, the Khyber gate in
 * sandstone at the centre under the Pakistan flag, and an orange banner
 * on a pole either side.
 *
 * The printed logo reads "SHENWARI"; the client confirmed the correct
 * spelling is "SHINWARI", so that is what ships here.
 *
 * If the client can get the original AI/EPS from their printer, drop it in
 * public/logo/ and this becomes a one-line <Image> swap — a real vector
 * original will always beat a redraw.
 */
export function PksCrest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Pak Khyber Shinwari"
    >
      {/* Rings */}
      <circle cx="100" cy="100" r="98" fill="#ffffff" />
      <circle cx="100" cy="100" r="95" fill="none" stroke="#d8232a" strokeWidth="5" />
      <circle cx="100" cy="100" r="86" fill="#ffffff" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#1b4a8f" strokeWidth="13" />
      <circle cx="100" cy="100" r="72" fill="#ffffff" />

      {/* Ground line */}
      <rect x="46" y="139" width="108" height="3" fill="#5b8f3a" />

      {/* --- Khyber gate --- */}
      <g fill="#cdbb9b" stroke="#a2906f" strokeWidth="1.1">
        {/* Towers */}
        <rect x="55" y="86" width="17" height="53" />
        <rect x="128" y="86" width="17" height="53" />
        {/* Tower caps */}
        <rect x="52" y="80" width="23" height="7" />
        <rect x="125" y="80" width="23" height="7" />
        {/* Curtain wall */}
        <rect x="72" y="96" width="56" height="43" />
      </g>

      {/* Crenellations along the wall */}
      <g fill="#cdbb9b" stroke="#a2906f" strokeWidth="1">
        <rect x="74" y="89" width="8" height="8" />
        <rect x="88" y="89" width="8" height="8" />
        <rect x="104" y="89" width="8" height="8" />
        <rect x="118" y="89" width="8" height="8" />
      </g>

      {/* Gate arch */}
      <path
        d="M86 139 v-22 a14 14 0 0 1 28 0 v22 z"
        fill="#ffffff"
        stroke="#a2906f"
        strokeWidth="1.1"
      />

      {/* --- Pakistan flag above the gate --- */}
      <line x1="100" y1="52" x2="100" y2="82" stroke="#4a423d" strokeWidth="2.4" />
      <path d="M100 53 h30 v19 h-30 z" fill="#01411c" />
      <path d="M100 53 h7.5 v19 H100 z" fill="#ffffff" />
      <circle cx="119" cy="62" r="5.6" fill="#ffffff" />
      <circle cx="121.4" cy="60.2" r="5" fill="#01411c" />
      <path
        d="M125.5 53.6 l1.5 3.4 3.6 .4 -2.7 2.5 .8 3.6 -3.2-1.9 -3.2 1.9 .8-3.6 -2.7-2.5 3.6-.4 z"
        fill="#ffffff"
      />

      {/* --- Banners either side --- */}
      <g>
        <line x1="38" y1="88" x2="38" y2="142" stroke="#4a423d" strokeWidth="2.6" />
        <path d="M38 89 l26 9 -26 9 z" fill="#f36f21" />
        <line x1="162" y1="88" x2="162" y2="142" stroke="#4a423d" strokeWidth="2.6" />
        <path d="M162 89 l-26 9 26 9 z" fill="#f36f21" />
      </g>

      {/* --- Circular wordmark --- */}
      <defs>
        <path id="pks-arc-top" d="M100 100 m-58 0 a58 58 0 0 1 116 0" fill="none" />
        <path id="pks-arc-bottom" d="M100 100 m59 0 a59 59 0 0 1 -118 0" fill="none" />
      </defs>
      <text
        fill="#1b4a8f"
        fontSize="19"
        fontWeight="700"
        letterSpacing="2.4"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <textPath href="#pks-arc-top" startOffset="50%" textAnchor="middle">
          PAK KHYBER
        </textPath>
      </text>
      <text
        fill="#1b4a8f"
        fontSize="19"
        fontWeight="700"
        letterSpacing="2.4"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <textPath href="#pks-arc-bottom" startOffset="50%" textAnchor="middle">
          SHINWARI
        </textPath>
      </text>
    </svg>
  );
}

export default PksCrest;
