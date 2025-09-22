export default function StatusBadge({ status }) {
  const map = {
    pending:  "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const cls = map[status] || "bg-gray-50 text-gray-700 ring-gray-200";
  return (
    <span className={`px-2 py-1 text-xs rounded-full ring-1 ${cls} capitalize`}>
      {status}
    </span>
  );
}
