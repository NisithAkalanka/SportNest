// src/pages/EditMyEvent.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEvent, updateEvent } from "@/services/eventsApi";

export default function EditMyEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [status, setStatus] = useState("pending");
  const [registeredCount, setRegisteredCount] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // per-field validation errors
  const [vErr, setVErr] = useState({});

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addReq = () =>
    setForm((f) => ({
      ...f,
      requestedItems: [...f.requestedItems, { item: "", qty: 1 }],
    }));
  const removeReq = (i) =>
    setForm((f) => ({
      ...f,
      requestedItems: f.requestedItems.filter((_, idx) => idx !== i),
    }));

  // date limits (today .. +3 months)
  const limits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const max = new Date();
    max.setMonth(max.getMonth() + 3);
    const toISO = (d) => d.toISOString().slice(0, 10);
    return { min: toISO(today), max: toISO(max) };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await getEvent(id);
        setForm({
          name: data.name || "",
          description: data.description || "",
          venue: data.venue || "",
          venueFacilities: data.venueFacilities || [],
          requestedItems:
            Array.isArray(data.requestedItems) && data.requestedItems.length
              ? data.requestedItems.map((r) => ({
                  item: r.item || "",
                  qty: Number(r.qty || 1),
                }))
              : [{ item: "", qty: 1 }],
          capacity: Number(data.capacity || 1),
          date: data.date ? new Date(data.date).toISOString().slice(0, 10) : "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
        });
        setStatus(data.status);
        setRegisteredCount((data.registrations || []).length);
        setMsg("");
      } catch (e) {
        setMsg(e?.response?.data?.error || "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function validate(f) {
    const e = {};
    const empty = (s) => !s || String(s).trim() === "";

    if (empty(f.name)) e.name = "Required";
    if (empty(f.venue)) e.venue = "Required";

    const cap = Number(f.capacity);
    if (!Number.isInteger(cap)) {
      e.capacity = "Must be a whole number";
    } else {
      if (cap < registeredCount) {
        e.capacity = `Must be ≥ current registrations (${registeredCount})`;
      } else if (cap > 500) {
        e.capacity = "Cannot exceed 500";
      }
    }

    if (empty(f.date)) e.date = "Pick a date";
    else {
      if (f.date < limits.min) e.date = "Date cannot be in the past";
      if (f.date > limits.max) e.date = "Date must be within next 3 months";
    }

    if (empty(f.startTime)) e.startTime = "Required";
    if (empty(f.endTime)) e.endTime = "Required";
    if (!e.startTime && !e.endTime && f.endTime <= f.startTime) {
      e.endTime = "End time must be after start time";
    }

    f.requestedItems.forEach((it, i) => {
      if (!it.item?.trim()) e[`req-${i}`] = "Item name required";
      const q = Number(it.qty);
      if (!Number.isFinite(q) || q < 1) e[`reqqty-${i}`] = "Qty ≥ 1";
    });

    setVErr(e);
    return Object.keys(e).length === 0;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // block edits on approved
    if (status === "approved") {
      setMsg("Approved events cannot be edited by members.");
      return;
    }

    if (!validate(form)) return;

    try {
      setSaving(true);
      // normalize payload
      const capClamped = Math.max(registeredCount, Math.min(500, Number(form.capacity)));
      const payload = {
        ...form,
        capacity: capClamped,
        requestedItems: form.requestedItems.map((r) => ({
          item: r.item.trim(),
          qty: Number(r.qty || 1),
        })),
        venueFacilities: Array.isArray(form.venueFacilities)
          ? form.venueFacilities
          : String(form.venueFacilities || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      };
      await updateEvent(id, payload);
      navigate("/my-events");
    } catch (e2) {
      setMsg(e2?.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (status === "approved") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-3">
          This event is already <b>approved</b>; only admins can edit.
        </div>
        <div className="flex gap-2">
          <Link to={`/events/${id}`} className="underline">
            View event
          </Link>
          <button onClick={() => navigate(-1)} className="underline">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-semibold">Edit My Event</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-2 rounded border">
          Back
        </button>
      </div>
      <div className="text-sm opacity-70 mb-3">
        Status: <b>{status}</b> • Current registrations: <b>{registeredCount}</b>
      </div>

      {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}

      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <input
            className={`border p-2 rounded w-full ${vErr.name ? "border-rose-400" : ""}`}
            placeholder="Event name *"
            value={form.name}
            onChange={(e) => setF("name", e.target.value)}
          />
          {vErr.name && <p className="text-xs text-rose-600 mt-1">{vErr.name}</p>}
        </div>

        <textarea
          className="border p-2 rounded w-full"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setF("description", e.target.value)}
        />

        <div>
          <input
            className={`border p-2 rounded w-full ${vErr.venue ? "border-rose-400" : ""}`}
            placeholder="Venue *"
            value={form.venue}
            onChange={(e) => setF("venue", e.target.value)}
          />
          {vErr.venue && <p className="text-xs text-rose-600 mt-1">{vErr.venue}</p>}
        </div>

        <input
          className="border p-2 rounded"
          placeholder="Venue facilities (comma separated)"
          value={
            Array.isArray(form.venueFacilities)
              ? form.venueFacilities.join(", ")
              : form.venueFacilities
          }
          onChange={(e) =>
            setF(
              "venueFacilities",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />

        <div className="border p-3 rounded">
          <div className="font-medium mb-2">Items needed from admin</div>
          {form.requestedItems.map((r, idx) => (
            <div key={idx} className="flex gap-2 items-start mb-2">
              <div className="flex-1">
                <input
                  className={`border p-2 rounded w-full ${vErr[`req-${idx}`] ? "border-rose-400" : ""}`}
                  placeholder="Item"
                  value={r.item}
                  onChange={(e) => {
                    const a = [...form.requestedItems];
                    a[idx].item = e.target.value;
                    setF("requestedItems", a);
                  }}
                />
                {vErr[`req-${idx}`] && (
                  <p className="text-xs text-rose-600 mt-1">{vErr[`req-${idx}`]}</p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  min={1}
                  className={`border p-2 rounded w-24 ${vErr[`reqqty-${idx}`] ? "border-rose-400" : ""}`}
                  value={r.qty}
                  onChange={(e) => {
                    const a = [...form.requestedItems];
                    a[idx].qty = Number(e.target.value || 1);
                    setF("requestedItems", a);
                  }}
                />
                {vErr[`reqqty-${idx}`] && (
                  <p className="text-xs text-rose-600 mt-1">{vErr[`reqqty-${idx}`]}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeReq(idx)}
                className="px-2 py-2 border rounded"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addReq} className="underline text-sm">
            + Add item
          </button>
        </div>

        <div>
          <input
            type="number"
            min={registeredCount}
            max={500}
            className={`border p-2 rounded w-full ${vErr.capacity ? "border-rose-400" : ""}`}
            placeholder="Capacity *"
            title={`Must be between ${registeredCount} and 500`}
            value={form.capacity}
            onChange={(e) => {
              const raw = Number(e.target.value || registeredCount);
              const clamped = Math.max(registeredCount, Math.min(500, raw));
              setF("capacity", clamped);
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Allowed: {registeredCount}–500
          </p>
          {vErr.capacity && <p className="text-xs text-rose-600 mt-1">{vErr.capacity}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <input
              type="date"
              className={`border p-2 rounded w-full ${vErr.date ? "border-rose-400" : ""}`}
              value={form.date}
              min={limits.min}
              max={limits.max}
              onChange={(e) => setF("date", e.target.value)}
            />
            {vErr.date && <p className="text-xs text-rose-600 mt-1">{vErr.date}</p>}
          </div>
          <div>
            <input
              type="time"
              className={`border p-2 rounded w-full ${vErr.startTime ? "border-rose-400" : ""}`}
              value={form.startTime}
              onChange={(e) => setF("startTime", e.target.value)}
            />
            {vErr.startTime && <p className="text-xs text-rose-600 mt-1">{vErr.startTime}</p>}
          </div>
          <div>
            <input
              type="time"
              className={`border p-2 rounded w-full ${vErr.endTime ? "border-rose-400" : ""}`}
              value={form.endTime}
              onChange={(e) => setF("endTime", e.target.value)}
            />
            {vErr.endTime && <p className="text-xs text-rose-600 mt-1">{vErr.endTime}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link to="/my-events" className="px-4 py-2 rounded border">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
