// Frontend/src/pages/EventDetails.jsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { getEvent } from "@/services/eventsApi";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDay,
  faClock,
  faLocationDot,
  faUsers,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registration form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await getEvent(id);
        setEv(data);
      } catch {
        setEv(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  
  const validateForm = () => {
    if (!name.trim()) return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits.";
    
    return null;
  };

  const onRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setSaving(true);
    
    const navigationPromise = new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
            navigate('/events/payment', {
                state: {
                  eventData: ev,
                  registrationData: { name, email, phone },
                  amount: ev?.registrationFee || 0,
                }
            });
            resolve();
        }, 500);
      } catch (error) {
        reject(error);
      }
    });

    await toast.promise(navigationPromise, {
        loading: 'Processing registration...',
        success: 'Redirecting to payment! 💳',
        error: 'Failed to proceed. Please try again.',
    });
    
    setSaving(false);
  };

  if (loading) {
    return (<div className="p-6 text-center">Loading event details...</div>);
  }

  if (!ev) {
    return (
      <div className="p-6 text-center max-w-3xl mx-auto">
        <Link to="/events" className="text-sm underline mb-4 inline-block">← Back to All Events</Link>
        <div className="p-8 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-rose-600">Event Not Found</h2>
          <p className="text-gray-600 mt-2">Sorry, we couldn't find the event you're looking for.</p>
        </div>
      </div>
    );
  }

  const eventDate = ev.date ? new Date(ev.date).toLocaleString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Not specified";
  const eventTime = `${ev.startTime || "--:--"} – ${ev.endTime || "--:--"}`;
  const fee = ev.registrationFee ?? 0;
  const isFree = fee === 0;
  const isFull = ev.isFull ?? (ev.registrations?.length >= ev.capacity);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/events" className="mb-4 inline-block">
          <Button variant="outline" className="h-9 px-3 bg-white">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to All Events
          </Button>
        </Link>

        <div className="bg-white border rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5">

            {/* ----- Left Column (Main Details) ----- */}
            <div className="md:col-span-3 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">{ev.name}</h1>
              {/* --- ඔබේ Screenshot එකේ තිබූ "Health & Wellness -..." කොටස මෙතන description එකෙන් එන්නේ --- */}
              <p className="mt-4 text-gray-600 leading-relaxed">{ev.description}</p>
              
              <div className="mt-6">
                {/* --- ඔබේ Screenshot එකේ "ಸ್ಥಳದ ಸೌಲಭ್ಯಗಳು" වෙනුවට --- */}
                <h3 className="font-semibold text-gray-700">Venue Facilities</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {ev.venueFacilities && ev.venueFacilities.length > 0 ? (
                    ev.venueFacilities.map((facility, index) => (
                      <span key={index} className="text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 ring-1 ring-emerald-200">
                        {facility}
                      </span>
                    ))
                  ) : <p className="text-sm text-gray-500">No facilities listed.</p>
                  }
                </div>
              </div>
            </div>

            {/* ----- Right Column (Sidebar) ----- */}
            <div className="md:col-span-2 bg-gray-50/70 border-l p-6">
              
              <div className="space-y-4">
                {/* --- ඔබේ Screenshot එකේ "ದಿನಾಂಕ", "ಸಮಯ", "ಸ್ಥಳ", etc. වෙනුවට --- */}
                <InfoItem icon={faCalendarDay} label="Date" value={eventDate} />
                <InfoItem icon={faClock} label="Time" value={eventTime} />
                <InfoItem icon={faLocationDot} label="Venue" value={ev.venue || "—"} />
                <InfoItem icon={faUsers} label="Capacity" value={`${ev.registrations?.length || 0} / ${ev.capacity}`} />
                <InfoItem 
                  icon={faTag} 
                  label="Fee" 
                  value={isFree ? "Free Event" : `Rs. ${fee.toFixed(2)}`} 
                  valueClass={isFree ? "text-green-600 font-bold" : "font-bold"}
                />
              </div>
              
              <hr className="my-6" />

              <div>
                {/* --- ඔබේ Screenshot එකේ "ಈಗಲೇ ನೋಂದಾಯಿಸಿ!" වෙනුවට --- */}
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  {isFull ? "Registrations Full" : "Register Now!"}
                </h3>

                {isFull ? (
                   <div className="p-4 text-center bg-rose-50 text-rose-700 rounded-lg">
                     This event has reached its maximum capacity.
                   </div>
                ) : (
                  <div className="grid gap-3">
                    {/* --- ඔබේ Screenshot එකේ "ಹೆಸರು", "ಇಮೇಲ್", "ಫೋನ್" වෙනුවට --- */}
                    <input className="border p-2 rounded focus:ring-2 focus:ring-emerald-500" placeholder="Name" value={name} onChange={(e) => { const filteredName = e.target.value.replace(/[^a-zA-Z\s]/g, ''); setName(filteredName); }} />
                    <input type="email" className="border p-2 rounded focus:ring-2 focus:ring-emerald-500" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="tel" inputMode="numeric" maxLength={10} className="border p-2 rounded focus:ring-2 focus:ring-emerald-500" placeholder="Phone (10 digits)" value={phone} onChange={(e) => { const filteredPhone = e.target.value.replace(/\D/g, ''); setPhone(filteredPhone); }} />

                    {/* --- ඔබේ Screenshot එකේ "ಪಾವತಿಗೆ ಮುಂದುವರಿಯಿರಿ" වෙනුවට --- */}
                    <Button onClick={onRegister} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 w-full mt-2">
                      {saving ? "Processing..." : "Proceed to Payment"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-start">
      <FontAwesomeIcon icon={icon} className="text-emerald-500 h-5 w-5 mt-1 mr-4" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-medium text-gray-800 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}