export function CategoryColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 rounded-full ring-2 ring-white shadow-sm"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
