// src/components/ProgressBar.jsx
export default function ProgressBar({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div style={{ width: "100%", margin: "8px 0" }}>
      <div style={{ height: 8, background: "#eee", borderRadius: 4 }}>
        <div
          style={{
            width: `${pct}%`,
            height: 8,
            background: "#4f46e5",
            borderRadius: 4,
            transition: "width 200ms ease",
          }}
        />
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>{pct}%</div>
    </div>
  );
}