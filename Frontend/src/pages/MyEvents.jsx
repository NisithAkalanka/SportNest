import { useEffect, useState } from "react";
import { listMine, deleteEvent } from "@/services/eventsApi";
import { Link } from "react-router-dom";

export default function MyEvents(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async ()=>{
    try{
      setLoading(true);
      const { data } = await listMine();
      setItems(data);
    }catch(e){
      setMsg(e?.response?.data?.error || "Failed to load");
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">My Events</h1>

      {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}

      {items.length === 0 ? (
        <div className="p-8 text-center border rounded">
          <div className="text-lg font-medium mb-2">You haven’t submitted any events.</div>
          <Link to="/events/submit" className="underline">+ Create one</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(ev => {
            const registered = ev.registrations?.length || 0;
            const canEditDelete = ev.status !== "approved"; // submitter rule
            return (
              <div key={ev._id} className="p-4 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{ev.name}</div>
                  <div className="text-sm opacity-70">
                    {ev.venue} • {ev.date ? new Date(ev.date).toLocaleDateString() : "-"} • {ev.startTime}-{ev.endTime}
                  </div>
                  <div className="text-xs mt-1">
                    Status: <b>{ev.status}</b> • Capacity: <b>{ev.capacity}</b> • Registered: <b>{registered}</b>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/events/${ev._id}`} className="px-3 py-2 rounded border">View</Link>
                  {canEditDelete && (
                    <>
                      <Link to={`/my-events/${ev._id}/edit`} className="px-3 py-2 rounded border">Edit</Link>
                      <button
                        onClick={async()=>{
                          if(!confirm("Delete this event?")) return;
                          await deleteEvent(ev._id);
                          load();
                        }}
                        className="px-3 py-2 rounded border border-red-600 text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
