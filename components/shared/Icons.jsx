function createIcon(path, viewBox = "0 0 24 24") {
  return function Icon({ className = "h-5 w-5", strokeWidth = 1.8 }) {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        viewBox={viewBox}
      >
        {path}
      </svg>
    );
  };
}

export const ArrowRightIcon = createIcon(
  <>
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </>
);

export const ShoppingBagIcon = createIcon(
  <>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </>
);

export const SparklesIcon = createIcon(
  <>
    <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
    <path d="m19 14 .8 1.9L22 16.7l-2.2.8L19 20l-.8-2.5-2.2-.8 2.2-.8L19 14Z" />
    <path d="m5 15 .7 1.6L7.3 17l-1.6.7L5 19.3l-.7-1.6L2.7 17l1.6-.4L5 15Z" />
  </>
);

export const BoltIcon = createIcon(
  <>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </>
);

export const UsersIcon = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <path d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const TargetIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </>
);

export const BookIcon = createIcon(
  <>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </>
);

export const DumbbellIcon = createIcon(
  <>
    <path d="M3 10v4" />
    <path d="M6 8v8" />
    <path d="M18 8v8" />
    <path d="M21 10v4" />
    <path d="M6 12h12" />
  </>
);

export const BottleIcon = createIcon(
  <>
    <path d="M10 2h4" />
    <path d="M11 2v4l-3 4v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9l-3-4V2" />
    <path d="M8.5 11h7" />
  </>
);

export const CalendarIcon = createIcon(
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>
);

export const BackpackIcon = createIcon(
  <>
    <path d="M8 7a4 4 0 1 1 8 0" />
    <path d="M6 9h12a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a2 2 0 0 1 2-2Z" />
    <path d="M9 13h6" />
  </>
);

export const ShirtIcon = createIcon(
  <>
    <path d="m9 3-4 3 2 4v11h10V10l2-4-4-3-3 3-3-3Z" />
  </>
);

export const TruckIcon = createIcon(
  <>
    <path d="M10 17H4V6h10v11" />
    <path d="M14 9h4l3 3v5h-7" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="17.5" cy="17.5" r="1.5" />
  </>
);

export const ShieldIcon = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const CheckCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const WalletIcon = createIcon(
  <>
    <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="M18 9h3v6h-3a2 2 0 0 1 0-6Z" />
  </>
);

export const ClipboardListIcon = createIcon(
  <>
    <rect width="14" height="18" x="5" y="4" rx="2" />
    <path d="M9 4h6v3H9z" />
    <path d="M9 11h6" />
    <path d="M9 16h6" />
  </>
);

export const BarChartIcon = createIcon(
  <>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-8" />
    <path d="M22 20v-4" />
  </>
);

export const LogOutIcon = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17 21 12 16 7" />
    <path d="M21 12H9" />
  </>
);

export const PlusCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </>
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);

export const MenuIcon = createIcon(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);

export const CloseIcon = createIcon(
  <>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </>
);

export const MailIcon = createIcon(
  <>
    <rect width="18" height="14" x="3" y="5" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </>
);

export const PhoneIcon = createIcon(
  <>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72l.45 3a2 2 0 0 1-.57 1.72l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 1.72-.57l3 .45A2 2 0 0 1 22 16.92Z" />
  </>
);

export const MapPinIcon = createIcon(
  <>
    <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z" />
    <circle cx="12" cy="10" r="2" />
  </>
);
