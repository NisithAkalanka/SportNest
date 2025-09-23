export default function EmptyState({ title="Nothing here", subtitle, cta }) {
  return (
    <div className="border-2 border-dashed rounded-xl p-8 text-center bg-white">
      <div className="text-lg font-medium">{title}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
