import StatusBadge from "@/components/ui/StatusBadge";

export default function EventCard({ ev, right }) {
  return (
    <div className="bg-white border rounded-xl p-4 sm:p-5 hover:shadow-md transition-all flex items-start justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base sm:text-lg truncate">{ev.name}</h3>
          {ev.status && <StatusBadge status={ev.status} />}
        </div>
        <div className="text-sm text-gray-500 mt-1 truncate">
          {ev.venue || "—"} • {ev.date ? new Date(ev.date).toLocaleDateString() : "—"} • {ev.startTime}-{ev.endTime}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Capacity <b>{ev.capacity}</b> • Registered <b>{ev.registrations?.length || 0}</b>
        </div>
      </div>
      {right && <div className="flex-shrink-0 ml-4 sm:ml-6">{right}</div>}
    </div>
  );
}
