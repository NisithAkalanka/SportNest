// Frontend/src/pages/MyEvents.jsx

import { useEffect, useState } from "react";
import { listMine, deleteEvent } from "@/services/eventsApi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faCalendarDays, 
    faClock, 
    faLocationDot, 
    faUsers, 
    faTag,
    faArrowLeft // <-- මේ Icon එක අලුතින් import කරගන්න
} from "@fortawesome/free-solid-svg-icons";

// Status Badge Component (මෙය එලෙසම තබන්න)
const StatusBadge = ({ status }) => {
    // ... (no changes here)
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


export default function MyEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await listMine();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load your events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);
  
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    const promise = deleteEvent(id).then(() => {
      return load();
    });

    toast.promise(promise, {
      loading: 'Deleting event...',
      success: 'Event deleted successfully!',
      error: 'Failed to delete event.'
    });
  }


  if (loading) {
    return <div className="p-6 text-center">Loading your events...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">

        {/* ----- මේ Back Button එක අලුතින් එකතු කළ කොටස START ----- */}
        <Link 
            to="/member-dashboard" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 mb-4"
        >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to My Profile
        </Link>
        {/* ----- මේ Back Button එක අලුතින් එකතු කළ කොටස END ----- */}


      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">My Submitted Events</h1>
        <Link to="/events/submit">
          <button className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            + Create New Event
          </button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-8 mt-4 text-center border-2 border-dashed rounded-lg bg-white">
          <h2 className="text-lg font-medium text-gray-800 mb-2">You haven’t submitted any events yet.</h2>
          <p className="text-sm text-gray-500 mb-4">Ready to host? Create your first event now!</p>
          <Link to="/events/submit" className="text-emerald-600 font-semibold hover:underline">
            Click here to create one
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {items.map(ev => {
            const canEditDelete = ev.status !== "approved";
            const fee = ev.registrationFee ?? 0;
            const registered = ev.registrations?.length || 0;
            const date = ev.date ? new Date(ev.date).toLocaleDateString() : "-";
            const time = `${ev.startTime}-${ev.endTime}`;

            return (
              <div key={ev._id} className="bg-white border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  
                  {/* Event Details Section */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-gray-800 truncate">{ev.name}</h2>
                      <StatusBadge status={ev.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                      <InfoPill icon={faLocationDot} text={ev.venue || "No venue"} />
                      <InfoPill icon={faCalendarDays} text={date} />
                      <InfoPill icon={faClock} text={time} />
                      <InfoPill icon={faTag} text={`Fee: Rs. ${fee.toFixed(2)}`} />
                    </div>
                     <div className="mt-3 text-xs text-gray-500">
                        Capacity: <b>{ev.capacity}</b> • Registered: <b>{registered}</b>
                     </div>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="flex-shrink-0 flex sm:flex-col justify-start gap-2 w-full sm:w-auto">
                    <Link to={`/events/${ev._id}`} className="px-3 py-2 text-sm text-center rounded-md border bg-gray-50 hover:bg-gray-100 w-full sm:w-28">View</Link>
                    {canEditDelete && (
                      <>
                        <Link to={`/events/${ev._id}/edit-my`} className="px-3 py-2 text-sm text-center rounded-md border bg-blue-50 text-blue-700 hover:bg-blue-100 w-full sm:w-28">Edit</Link>
                        <button
                          onClick={() => handleDelete(ev._id)}
                          className="px-3 py-2 text-sm text-center rounded-md border bg-rose-50 text-rose-700 hover:bg-rose-100 w-full sm:w-28"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// InfoPill Component (මෙය එලෙසම තබන්න)
const InfoPill = ({ icon, text }) => (
    <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={icon} className="text-gray-400" />
        <span>{text}</span>
    </div>
);