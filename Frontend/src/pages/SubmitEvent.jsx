import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { submitEvent } from "@/services/eventsApi";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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

export default function SubmitEvent() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    venue: "",
    venueFacilities: [],
    requestedItems: [{ item: "", qty: 1 }],
    capacity: 1,
    date: "",
    startTime: "",
    endTime: "",
  });

  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [facilitiesText, setFacilitiesText] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() + 3);
    return d;
  }, []);
  const toISO = (d) => d.toISOString().slice(0, 10);

  //  Word count for description
  const descWords = form.description.trim().split(/\s+/).filter(Boolean).length;

  const addReq = () => {
    if (form.requestedItems.length >= 5) {
      setMsg({ type: "error", text: "You can add up to 5 items only." });
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

  /**  Auto-fill facilities & defaults when venue is selected */
  const onVenueSelect = (id) => {
    setSelectedVenueId(id);
    const v = VENUES.find((x) => x.id === id);
    if (!v) {
      setField("venue", "");
      setFacilitiesText("");
      setField("venueFacilities", []);
      return;
    }
    setField("venue", v.name);
    setFacilitiesText(v.facilities.join(", "));
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
    const d = new Date(form.date + "T00:00:00");
    if (d < today) return "Date cannot be in the past.";
    if (d > maxDate) return "Date must be within the next 3 months.";

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
    setMsg({ type: "", text: "" });

    const facilities = facilitiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      venueFacilities: facilities,
      requestedItems: form.requestedItems.filter(
        (r) => r.item && r.item.trim().length > 0
      ),
      capacity: Number(form.capacity || 1),
    };

    const err = validate();
    if (err) {
      setMsg({ type: "error", text: err });
      return;
    }

    try {
      setSubmitting(true);
      await submitEvent(payload);
      setMsg({ type: "success", text: "Submitted for approval ✅" });
      setForm({
        name: "",
        description: "",
        venue: "",
        venueFacilities: [],
        requestedItems: [{ item: "", qty: 1 }],
        capacity: 1,
        date: "",
        startTime: "",
        endTime: "",
      });
      setFacilitiesText("");
      setSelectedVenueId("");
    } catch (err2) {
      setMsg({
        type: "error",
        text: err2?.response?.data?.error || "Submit failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Top bar with Back button */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/events">
          <Button variant="outline" className="h-9 px-3">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Events
          </Button>
        </Link>
        <div className="w-28" />
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-1">Create Event</h1>
        <p className="text-sm text-gray-500 mb-5">
          Fill in the details below and submit for admin approval. Events can be scheduled up to 3 months ahead.
        </p>

        {msg.text && (
          <div
            className={`mb-4 text-sm rounded-md p-3 ${
              msg.type === "success"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-4">
          {/* Event name */}
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

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 border rounded-md p-2 w-full min-h-24"
              placeholder="Add a short description (max 60 words)..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
            <div
              className={`text-xs mt-1 ${
                descWords > 60 ? "text-rose-600" : "text-gray-500"
              }`}
            >
              {descWords}/60 words
            </div>
          </div>

          {/* Venue (select or type) */}
          <div className="grid gap-2">
            <div className="grid sm:grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Choose a Venue</label>
                <select
                  className="mt-1 border rounded-md p-2 w-full bg-white"
                  value={selectedVenueId}
                  onChange={(e) => onVenueSelect(e.target.value)}
                >
                  <option value="">— Select venue —</option>
                  {VENUES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Or type custom Venue</label>
                <input
                  className="mt-1 border rounded-md p-2 w-full"
                  placeholder="e.g., Court B / Community Hall"
                  value={form.venue}
                  onChange={(e) => {
                    setSelectedVenueId("");
                    setField("venue", e.target.value);
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Requested items */}
          <div className="border rounded-lg p-3">
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
                    type="number"
                    min={1}
                    max={50}
                    className="border rounded-md p-2 w-24"
                    value={r.qty}
                    onChange={(e) => {
                      let val = Number(e.target.value || 1);
                      if (val > 50) val = 50;
                      const a = [...form.requestedItems];
                      a[idx] = { ...a[idx], qty: val };
                      setField("requestedItems", a);
                    }}
                  />
                  {form.requestedItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReq(idx)}
                      className="px-2 py-1 text-xs rounded-md ring-1 ring-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addReq}
              className="mt-2 text-sm underline"
              disabled={form.requestedItems.length >= 5}
            >
              + Add item
            </button>
            <div className="text-xs mt-1 text-gray-500">
              {form.requestedItems.length}/5 items (each qty ≤ 50)
            </div>
          </div>

          {/* Capacity + Date + Times */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="text-sm font-medium">Capacity</label>
              <input
                type="number"
                min={1}
                max={500}
                className="mt-1 border rounded-md p-2 w-full"
                value={form.capacity}
                onChange={(e) => {
                  const v = Number(e.target.value || 1);
                  const clamped = Math.max(1, Math.min(500, v));
                  setField("capacity", clamped);
                }}
                required
              />
              <div className="text-xs text-gray-500 mt-1">Allowed: 1–500</div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                className="mt-1 border rounded-md p-2 w-full"
                value={form.date}
                min={toISO(today)}
                max={toISO(maxDate)}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm font-medium">Start</label>
              <input
                type="time"
                className="mt-1 border rounded-md p-2 w-full"
                value={form.startTime}
                onChange={(e) => setField("startTime", e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm font-medium">End</label>
              <input
                type="time"
                className="mt-1 border rounded-md p-2 w-full"
                value={form.endTime}
                onChange={(e) => setField("endTime", e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            disabled={submitting}
            className="bg-[#FF6700] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
            type="submit"
          >
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </form>
      </div>
    </div>
  );
}
