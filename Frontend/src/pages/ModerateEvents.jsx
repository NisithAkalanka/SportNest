// src/pages/ModerateEvents.jsx
import { useEffect, useMemo, useState } from "react";
import { listEvents, approveEvent, rejectEvent, deleteEvent } from "@/services/eventsApi";
import { Link } from "react-router-dom";

const LIMIT = 10; // rows per page

export default function ModerateEvents() {
  // filters
  const [status, setStatus]   = useState("pending");
  const [q, setQ]             = useState("");
  const [debouncedQ, setDebQ] = useState("");
  const [sort, setSort]       = useState("-date,-startTime"); // default: newest first

  // paging
  const [page, setPage]       = useState(1);

  // data
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");
  const [workingId, setWorkingId] = useState(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / LIMIT)),
    [total]
  );

  const load = async () => {
    try {
      setLoading(true);

      // Try server-side pagination if backend supports it
      const { data } = await listEvents({
        status,
        q: debouncedQ || undefined,
        sort,
        page,
        limit: LIMIT,
      });

      // --- Flexible shape handling ---
      // If backend returns {items,total} use it; if it returns array, paginate here.
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setTotal(Number.isFinite(data.total) ? data.total : data.items.length);
      } else if (Array.isArray(data)) {
        // client-side paginate fallback
        const start = (page - 1) * LIMIT;
        const end = start + LIMIT;
        setItems(data.slice(start, end));
        setTotal(data.length);
      } else {
        // unknown shape – try to coerce
        const arr = Array.isArray(data?.data) ? data.data : [];
        const start = (page - 1) * LIMIT;
        const end = start + LIMIT;
        setItems(arr.slice(start, end));
        setTotal(arr.length);
      }

      setMsg("");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Failed to load events");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // reset page when filters change
  useEffect(() => { setPage(1); }, [status, debouncedQ, sort]);

  // fetch when inputs change
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, debouncedQ, sort, page]);

  const act = async (fn, id) => {
    try {
      setWorkingId(id);
      await fn(id);
      await load();
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Events Management</h1>
        <Link
          to="/admin-dashboard/events/report"
          className="px-3 py-2 rounded border hover:bg-gray-50"
          title="Open Events Report"
        >
          📊 Reports
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex gap-2">
          {["pending","approved","rejected"].map(s => (
            <button
              key={s}
              className={`px-3 py-2 rounded-full text-sm ${status===s ? "bg-black text-white" : "border"}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex gap-2">
          <input
            placeholder="Search by name or venue"
            className="border rounded px-3 py-2 w-56"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2"
            value={sort}
            onChange={(e)=>setSort(e.target.value)}
            title="Sort"
          >
            <option value="-date,-startTime">Newest first</option>
            <option value="date,startTime">Oldest first</option>
            <option value="name">Name A→Z</option>
            <option value="-name">Name Z→A</option>
            <option value="-capacity">Capacity ↓</option>
            <option value="capacity">Capacity ↑</option>
          </select>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div>Loading…</div>
      ) : msg ? (
        <div className="text-rose-600">{msg}</div>
      ) : items.length === 0 ? (
        <div className="p-6 border rounded">No {status} events.</div>
      ) : (
        <>
          <div className="w-full overflow-auto">
            <table className="w-full text-sm border rounded">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <Th>Name</Th>
                  <Th>Venue</Th>
                  <Th>Date &amp; Time</Th>
                  <Th className="text-right">Cap.</Th>
                  <Th className="text-right">Reg.</Th>
                  <Th className="text-right">Fee (Rs.)</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-3">Actions</Th>
                 
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => {
                  const date = ev.date ? new Date(ev.date).toLocaleDateString() : "-";
                  const dt = `${date} • ${ev.startTime || "--"}-${ev.endTime || "--"}`;
                  const regs = Array.isArray(ev.registrations)
                    ? ev.registrations.length
                    : ev.registeredCount || 0;

                  return (
                    <tr key={ev._id} className="border-t">
                      <Td>
                        <div className="font-medium line-clamp-1">{ev.name}</div>
                        <div className="text-gray-500 line-clamp-1">{ev.description}</div>
                      </Td>
                      <Td className="line-clamp-1">{ev.venue || "-"}</Td>
                      <Td>{dt}</Td>
                      <Td className="text-right">{ev.capacity ?? "-"}</Td>
                      <Td className="text-right">{regs}</Td>
                      <Td className="text-right">{ev.registrationFee ?? 0}</Td>
                      <Td>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            ev.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : ev.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </Td>
                      <Td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            to={`/admin-dashboard/events/${ev._id}/edit`}
                            className="px-3 py-1.5 rounded border"
                          >
                            Edit
                          </Link>

                          <button
                            disabled={workingId === ev._id}
                            onClick={() => {
                              if (!confirm("Delete this event?")) return;
                              act(deleteEvent, ev._id);
                            }}
                            className="px-3 py-1.5 rounded border border-rose-300 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                          >
                            Delete
                          </button>

                          {status === "pending" && (
                            <>
                              <button
                                disabled={workingId === ev._id}
                                onClick={() => act(approveEvent, ev._id)}
                                className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-60"
                              >
                                Approve
                              </button>
                              <button
                                disabled={workingId === ev._id}
                                onClick={() => act(rejectEvent, ev._id)}
                                className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages} • {total} items
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded border"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="px-3 py-2 rounded border"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-3 py-2 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}
