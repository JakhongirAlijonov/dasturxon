export default function UzbekPattern({ className = "" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 120 120"
    >
      <defs>
        <pattern
          id="girih"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* Central 8-pointed star */}
          <polygon
            points="30,8 34,22 48,22 37,31 41,45 30,36 19,45 23,31 12,22 26,22"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.4"
          />
          {/* Corner diamonds */}
          <polygon
            points="0,0 8,6 0,12 -8,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
          <polygon
            points="60,0 68,6 60,12 52,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
          <polygon
            points="0,60 8,66 0,72 -8,66"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            opacity="0.3"
          />
          {/* Connecting lines */}
          <line
            x1="0"
            y1="30"
            x2="12"
            y2="22"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <line
            x1="60"
            y1="30"
            x2="48"
            y2="22"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <line
            x1="30"
            y1="0"
            x2="26"
            y2="22"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
          <line
            x1="30"
            y1="60"
            x2="34"
            y2="38"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.2"
          />
        </pattern>
      </defs>
      <rect width="120" height="120" fill="url(#girih)" />
    </svg>
  );
}
