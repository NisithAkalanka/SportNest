// src/pages/ApprovedEvents.jsx
import { useEffect, useState } from "react";
import { listApproved, registerEvent } from "@/services/eventsApi";
import { Link } from "react-router-dom";

export default function ApprovedEvents() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await listApproved({ q: q.trim() || undefined });
      setItems(Array.isArray(data) ? data : []);
      setMsg("");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onKeyDown = (e) => e.key === "Enter" && load();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative h-48 md:h-56 lg:h-64 flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(13,27,42,.72),rgba(13,27,42,.72)), url('/events-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Events</h1>
          <p className="text-white/80 mt-1">Discover upcoming events at SportNest.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4">
        <div className="relative z-10 -mt-10 flex flex-col md:flex-row md:items-center gap-3">
          {/* Search input */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-2 pl-3">
            <input
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
              placeholder="Search events by name or venue…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          {/* Filter button */}
          <button
            onClick={load}
            className="inline-flex items-center gap-2 h-12 px-5 rounded-2xl border-2 border-[#0D1B2A] bg-white text-[#0D1B2A]
                       shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition
                       hover:bg-[#0D1B2A] hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M6 12h12M10 18h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Filter
          </button>

          {/* Create button */}
          <Link to="/events/submit" title="Create a new event">
            <button
              className="h-12 px-5 rounded-2xl text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                         transition ring-2 ring-transparent hover:ring-[#ffb37a]"
              style={{
                background: "linear-gradient(180deg,#FF7A1A 0%, #FF6700 100%)",
              }}
            >
              + Create Event
            </button>
          </Link>
        </div>

        {/* Messages */}
        <div className="mt-6">
          {msg && <div className="text-sm text-rose-600 mb-3">{msg}</div>}
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
        </div>

        {/* List */}
        {!loading && (
          <section className="py-6">
            {items.length === 0 ? (
              <EmptyState
                title="No events found"
                subtitle="Try a different search, or create a new event."
                cta={
                  <Link className="underline" to="/events/submit">
                    Create one
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-5">
                {items.map((ev) => (
                  <EventRow key={ev._id} ev={ev} reload={load} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------- Event Card ---------- */
function EventRow({ ev, reload }) {
  const date = ev.date ? new Date(ev.date).toLocaleDateString() : "—";
  const time = `${ev.startTime || "--"} – ${ev.endTime || "--"}`;
  const cap = ev.capacity ?? 0;
  const reg = Array.isArray(ev.registrations)
    ? ev.registrations.length
    : ev.registeredCount || 0;

  return (
    <div
      className="rounded-2xl border shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1"
      style={{
        background: "linear-gradient(135deg, #E6F0FF 0%, #F8FBFF 100%)", // smooth blue gradient
      }}
    >
      <div className="p-5 md:p-6 grid md:grid-cols-3 gap-6">
        {/* Left side info */}
        <div className="md:col-span-2 min-w-0">
          <h3 className="text-lg font-semibold leading-tight truncate text-[#0D1B2A]">
            {ev.name}
          </h3>
          {ev.description && (
            <p className="text-gray-700 mt-1 line-clamp-2">{ev.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-800">
            <InfoPill label="Venue" value={ev.venue || "—"} />
            <InfoPill label="Date" value={date} />
            <InfoPill label="Time" value={time} />
            <InfoPill label="Capacity" value={cap} />
            <InfoPill label="Registered" value={reg} />
          </div>

          <div className="mt-4">
            <Link
              className="underline text-sm text-blue-700"
              to={`/events/${ev._id}`}
            >
              View details
            </Link>
          </div>
        </div>

        {/* Right: Quick Register */}
        <div>
          <RegisterInline ev={ev} onDone={reload} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Info Pills ---------- */
function InfoPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-white/60">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/* ---------- Quick Register ---------- */
function RegisterInline({ ev, onDone }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ validation helpers
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) =>
    /^\d{10}$/.test(phone); // exactly 10 digits

  const click = async () => {
    setMsg("");

    if (!name.trim()) {
      setMsg("⚠️ Please enter your name");
      return;
    }

    if (!validateEmail(email)) {
      setMsg("⚠️ Please enter a valid email");
      return;
    }

    if (!validatePhone(phone)) {
      setMsg("⚠️ Phone number must be 10 digits");
      return;
    }

    try {
      setSaving(true);
      const { data } = await registerEvent(ev._id, { name, email, phone });
      setMsg(`✅ Registered! (${data.registeredCount}/${data.capacity})`);
      setName("");
      setEmail("");
      setPhone("");
      onDone?.();
    } catch (e) {
      setMsg(e?.response?.data?.error || "❌ Registration failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border p-4 bg-white/70 backdrop-blur w-full sm:w-[260px]">
      <div className="text-sm font-medium mb-2">Quick register</div>
      <input
        className="w-full mb-2 rounded-xl border px-3 py-2 bg-white"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full mb-2 rounded-xl border px-3 py-2 bg-white"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full mb-3 rounded-xl border px-3 py-2 bg-white"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={click}
        disabled={saving}
        className="w-full rounded-2xl px-3 py-2 text-white disabled:opacity-60 shadow
                   hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition"
        style={{
          background: "linear-gradient(180deg,#0F2741 0%, #0D1B2A 100%)",
        }}
      >
        {saving ? "Registering…" : "Register"}
      </button>
      {msg && <div className="text-xs mt-2 text-gray-700">{msg}</div>}
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ title, subtitle, cta }) {
  return (
    <div className="border-2 border-dashed rounded-2xl p-10 text-center bg-white">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-gray-600 mt-1">{subtitle}</div>}
      {cta && <div className="mt-3">{cta}</div>}
    </div>
  );
}
