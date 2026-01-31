export default function Columns11({ children, gap = 8 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap,
      }}
    >
      {children}
    </div>
  );
}
