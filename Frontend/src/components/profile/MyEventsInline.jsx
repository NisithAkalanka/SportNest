// Frontend/src/components/profile/MyEventsInline.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMine, deleteEvent } from "@/services/eventsApi";
import EventCard from "@/components/events/EventsCard"; // match your filename
import EmptyState from "@/components/ui/EmptyState";

export default function MyEventsInline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await listMine();
      setItems(data || []);
      setMsg("");
    } catch (e) {
      if (e?.response?.status === 401) setMsg("Login required");
      else setMsg(e?.response?.data?.error || "Failed to load my events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My Events</h2>
        <Link to="/events/submit" className="text-sm underline">+ Create Event</Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : msg ? (
        <div className="text-sm text-rose-600">{msg}</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="You haven’t submitted any events yet."
          cta={<Link to="/events/submit" className="underline">Create one</Link>}
        />
      ) : (
        <div className="grid gap-3">
          {items.map((ev) => {
            const canEdit = ev.status !== "approved";
            return (
              <EventCard
                key={ev._id}
                ev={ev}
                right={
                  <div className="flex gap-2">
                    {canEdit && (
                      <Link
                        to={`/events/${ev._id}/edit-my`}
                        className="px-3 py-1.5 rounded-md ring-1 ring-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    )}
                    {canEdit && (
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this event?")) return;
                          await deleteEvent(ev._id);
                          load();
                        }}
                        className="px-3 py-1.5 rounded-md ring-1 ring-rose-300 text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
