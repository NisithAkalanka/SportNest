// Frontend/src/pages/SubmitEvent.jsx

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitEvent } from "@/services/eventsApi";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import toast from 'react-hot-toast'; // react-hot-toast import

/**  Pre-defined venues with auto facilities + default requested items */
const VENUES = [
  {
    id: "court-a",
    name: "Court A",
    facilities: ["Indoor", "Scoreboard", "Benches", "Drinking water"],
    defaults: [{ item: "Chairs", qty: 20 }, { item: "Tables", qty: 2 }],
  },
  {
    id: "auditorium",
    name: "Auditorium",
    facilities: ["Stage", "PA system", "Lighting", "Parking"],
    defaults: [{ item: "Projector", qty: 1 }, { item: "Registration Desk", qty: 1 }],
  },
  {
    id: "main-ground",
    name: "Main Ground",
    facilities: ["Outdoor", "Washrooms", "First Aid", "Parking"],
    defaults: [{ item: "Canopy Tents", qty: 3 }, { item: "Cones", qty: 30 }],
  },
];

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  venue: "",
  venueFacilities: [],
  requestedItems: [{ item: "", qty: 1 }],
  capacity: 10, // වඩා හොඳ default අගයක්
  registrationFee: 0,
  date: "",
  startTime: "",
  endTime: "",
};


export default function SubmitEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  }, []);

  const descWords = form.description.trim().split(/\s+/).filter(Boolean).length;

  const addReq = () => {
    if (form.requestedItems.length >= 5) {
      toast.error("You can add up to 5 items only.");
      return;
    }
    setForm((f) => ({
      ...f,
      requestedItems: [...f.requestedItems, { item: "", qty: 1 }],
    }));
  };

  const removeReq = (idx) =>
    setForm((f) => ({
      ...f,
      requestedItems: f.requestedItems.filter((_, i) => i !== idx),
    }));

  const onVenueSelect = (id) => {
    setSelectedVenueId(id);
    const v = VENUES.find((x) => x.id === id);
    if (!v) {
      setField("venue", "");
      setField("venueFacilities", []);
      return;
    }
    setField("venue", v.name);
    setField("venueFacilities", v.facilities);

    const noCustomItems =
      form.requestedItems.length === 1 &&
      (!form.requestedItems[0].item || form.requestedItems[0].item.trim() === "");
    if (noCustomItems) {
      setField("requestedItems", v.defaults);
    }
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter an event name.";
    if (!form.venue.trim()) return "Please select or enter a venue.";
    const capNum = Number(form.capacity);
    if (!capNum || capNum < 1) return "Capacity must be at least 1.";
    if (capNum > 500) return "Capacity cannot exceed 500.";

    if (!form.date) return "Please pick a date.";
    if (form.date < today) return "Date cannot be in the past.";
    if (form.date > maxDate) return "Date must be within the next 3 months.";

    if (!form.startTime || !form.endTime) return "Please set start/end time.";
    if (form.startTime >= form.endTime)
      return "Start time must be before end time.";

    if (descWords > 60) return "Description cannot exceed 60 words.";
    if (form.requestedItems.length > 5)
      return "You cannot request more than 5 items.";

    for (const r of form.requestedItems) {
      if ((r.item && r.item.trim().length > 0)) {
        if (!r.qty || r.qty < 1) return "Item quantities must be at least 1.";
        if (r.qty > 50) return "Each item quantity cannot exceed 50.";
      }
    }
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    
    const payload = {
        ...form,
        requestedItems: form.requestedItems.filter(
          (r) => r.item && r.item.trim().length > 0
        ),
        capacity: Number(form.capacity || 1),
    };

    try {
      setSubmitting(true);
      const loadingPromise = submitEvent(payload);

      await toast.promise(loadingPromise, {
        loading: 'Submitting event...',
        success: 'Submitted for approval! ✅',
        error: (err) => err?.response?.data?.error || "Submit failed. Please try again.",
      });

      setForm(INITIAL_FORM_STATE);
      setSelectedVenueId("");
      
      // සාර්ථක වූ පසු, තත්පර 2කින් my-events page එකට යවමු.
      setTimeout(() => navigate('/my-events'), 2000);

    } catch (err2) {
      // toast.promise එකෙන් error එක handle කරන නිසා මෙතන code එකක් අවශ්‍ය නැහැ
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/events">
          <Button variant="outline" className="h-9 px-3">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Create Event</h1>
        <p className="text-sm text-gray-500 mb-5">
          Fill in the details below and submit for admin approval.
        </p>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Event Name</label>
            <input
              className="mt-1 border rounded-md p-2 w-full"
              placeholder="e.g., Badminton Friendly Meet"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 border rounded-md p-2 w-full min-h-24"
              placeholder="Add a short description (max 60 words)..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
            <div
              className={`text-xs mt-1 text-right pr-1 ${
                descWords > 60 ? "text-rose-600 font-semibold" : "text-gray-500"
              }`}
            >
              {descWords}/60 words
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Choose a Venue</label>
              <select
                className="mt-1 border rounded-md p-2 w-full bg-white"
                value={selectedVenueId}
                onChange={(e) => onVenueSelect(e.target.value)}
              >
                <option value="">— Select venue —</option>
                {VENUES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Or type custom Venue</label>
              <input
                className="mt-1 border rounded-md p-2 w-full"
                placeholder="e.g., Community Hall"
                value={form.venue}
                onChange={(e) => { setSelectedVenueId(""); setField("venue", e.target.value); }}
                required
              />
            </div>
          </div>
          
          <div className="border rounded-lg p-3 bg-gray-50/50">
            <div className="text-sm font-medium mb-2">Items needed from admin</div>
            <div className="grid gap-2">
              {form.requestedItems.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="border rounded-md p-2 flex-1"
                    placeholder="Item (e.g., chairs)"
                    value={r.item}
                    onChange={(e) => {
                      const a = [...form.requestedItems];
                      a[idx] = { ...a[idx], item: e.target.value };
                      setField("requestedItems", a);
                    }}
                  />
                  <input
                    type="number" min={1} max={50}
                    className="border rounded-md p-2 w-24" value={r.qty}
                    onChange={(e) => {
                      let val = Number(e.target.value || 1);
                      if (val > 50) val = 50;
                      const a = [...form.requestedItems]; a[idx] = { ...a[idx], qty: val };
                      setField("requestedItems", a);
                    }}
                  />
                  {form.requestedItems.length > 1 && (
                    <button type="button" onClick={() => removeReq(idx)}
                      className="px-2 py-1 text-xs rounded-md ring-1 ring-rose-300 text-rose-600 hover:bg-rose-50">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addReq}
              className="mt-2 text-sm text-emerald-600 hover:underline disabled:text-gray-400"
              disabled={form.requestedItems.length >= 5}>
              + Add item
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-1">
                <label className="text-sm font-medium">Fee (Rs.)</label>
                <input
                  type="number" min={0}
                  className="mt-1 border rounded-md p-2 w-full" value={form.registrationFee}
                  onChange={(e) => setField("registrationFee", Number(e.target.value < 0 ? 0 : e.target.value))}
                  required
                />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium">Capacity</label>
              <input
                type="number" min={1} max={500}
                className="mt-1 border rounded-md p-2 w-full" value={form.capacity}
                onChange={(e) => {
                  const v = Number(e.target.value || 1);
                  const clamped = Math.max(1, Math.min(500, v)); setField("capacity", clamped);
                }} required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date" className="mt-1 border rounded-md p-2 w-full"
                value={form.date} min={today} max={maxDate}
                onChange={(e) => setField("date", e.target.value)} required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="time" className="mt-1 border rounded-md p-2 w-full"
                value={form.startTime}
                onChange={(e) => setField("startTime", e.target.value)} required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">End Time</label>
              <input
                type="time" className="mt-1 border rounded-md p-2 w-full"
                value={form.endTime}
                onChange={(e) => setField("endTime", e.target.value)} required
              />
            </div>
          </div>
          
          <Button disabled={submitting} className="w-full bg-[#FF6700] text-white py-2.5 rounded-md hover:opacity-90 disabled:opacity-60 transition-opacity">
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </form>
      </div>
    </div>
  );
}