// Frontend/src/components/profile/MyEventsInline.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast'; // Toast import කරගන්න
import { listMine, deleteEvent } from "@/services/eventsApi";
import EventCard from "@/components/events/EventsCard"; // මේ component එක දැනටමත් පාවිච්චි වෙනවා
import EmptyState from "@/components/ui/EmptyState";

// Status එකට අනුව ලස්සන Badge එකක් පෙන්වන Component එකක්
const StatusBadge = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
    let colorClasses = "";
  
    switch (status) {
      case "approved":
        colorClasses = "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
        break;
      case "rejected":
        colorClasses = "bg-rose-100 text-rose-800 ring-1 ring-rose-200";
        break;
      default: // pending
        colorClasses = "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
    }
  
    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};


export default function MyEventsInline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await listMine();
      setItems(data || []);
    } catch (e) {
      if (e?.response?.status !== 401) { // 401 (Unauthorized) නම් toast එකක් පෙන්වන්න අවශ්‍ය නෑ
         toast.error(e?.response?.data?.error || "Failed to load my events");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if(!confirm("Are you sure you want to delete this event?")) return;
    
    const promise = deleteEvent(id).then(() => load()); // Delete කරාට පස්සේ list එක reload කරනවා
    
    toast.promise(promise, {
      loading: 'Deleting...',
      success: 'Event Deleted!',
      error: 'Could not delete event.',
    });
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My Events</h2>
        <Link to="/my-events" className="text-sm underline hover:text-emerald-600">View All</Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading events...</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="You haven’t submitted any events yet."
          cta={<Link to="/events/submit" className="text-sm bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700">Create one</Link>}
        />
      ) : (
        <div className="grid gap-3">
          {/* We only show the latest 3-4 events here for a clean look */}
          {items.slice(0, 4).map((ev) => {
            const canEditDelete = ev.status !== "approved";
            const fee = ev.registrationFee ?? 0;

            return (
                <div key={ev._id} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start gap-3 hover:shadow-sm transition-shadow">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3">
                           <h3 className="font-semibold text-gray-800">{ev.name}</h3>
                           <StatusBadge status={ev.status} />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {ev.venue} • {ev.date ? new Date(ev.date).toLocaleDateString() : "-"}
                        </p>
                        {/* --- Fee එක සහ අනිත් විස්තර එකතු කළ කොටස --- */}
                        <div className="text-xs text-gray-600 mt-2 flex items-center gap-4">
                            <span>Capacity: <b>{ev.capacity}</b></span>
                            <span>Registered: <b>{ev.registrations?.length || 0}</b></span>
                            <span className="font-semibold">Fee: <b>Rs. {fee.toFixed(2)}</b></span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                        {canEditDelete && (
                            <>
                               <Link to={`/events/${ev._id}/edit-my`} className="flex-1 sm:flex-none text-center px-3 py-1.5 text-xs rounded-md ring-1 ring-gray-300 text-gray-700 hover:bg-gray-50">
                                   Edit
                               </Link>
                               <button onClick={() => handleDelete(ev._id)} className="flex-1 sm:flex-none text-center px-3 py-1.5 text-xs rounded-md ring-1 ring-rose-300 text-rose-600 hover:bg-rose-50">
                                   Delete
                               </button>
                            </>
                        )}
                         <Link to={`/events/${ev._id}`} className="flex-1 sm:flex-none text-center px-3 py-1.5 text-xs rounded-md ring-1 ring-emerald-500 text-emerald-700 hover:bg-emerald-50">
                            View
                         </Link>
                    </div>
                </div>
            );
          })}
           {items.length > 4 && (
             <div className="text-center mt-2">
                 <Link to="/my-events" className="text-sm text-emerald-600 hover:underline">... and {items.length - 4} more events</Link>
             </div>
           )}
        </div>
      )}
    </section>
  );
}