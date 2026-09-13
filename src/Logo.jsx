import React from "react";

export default function Logo({ size = 60 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: "linear-gradient(135deg,#F5385D,#7B61FF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px rgba(245,56,93,.35)",
        flex: "0 0 auto",
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17 Q7 17 8 12 Q9 5 12 5 Q15 5 16 12 Q17 19 21 19"
          stroke="#fff"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="19" r="2.1" fill="#fff" />
        <circle cx="3" cy="17" r="2.1" fill="#fff" fillOpacity="0.55" />
      </svg>
    </div>
  );
}
