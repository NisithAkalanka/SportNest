// src/pages/ApprovedEvents.jsx
import { useEffect, useState } from "react";
import { listApproved } from "@/services/eventsApi";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";

export default function ApprovedEvents() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [sortBy, setSortBy] = useState("date-asc"); // date-asc | date-desc | name-asc

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

  // Client-side sort
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
    const ad = a.date ? new Date(a.date).getTime() : Infinity;
    const bd = b.date ? new Date(b.date).getTime() : Infinity;
    return sortBy === "date-desc" ? bd - ad : ad - bd;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
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
          {/* Search */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-2 pl-3 focus-within:ring-2 focus-within:ring-emerald-500 flex items-center">
            <input
              className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
              placeholder="Search events by name or venue…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {q && (
              <button
                type="button"
                onClick={() => { setQ(""); load(); }}
                className="px-2 text-slate-500 hover:text-slate-700"
                aria-label="Clear search"
                title="Clear"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter */}
          <button
            onClick={load}
            className="inline-flex items-center gap-2 h-12 px-5 rounded-2xl border-2 border-emerald-600 bg-white text-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition hover:bg-emerald-600 hover:text-white"
            title="Apply current filters"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Filter
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white px-3 text-sm text-slate-700 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Sort events"
          >
            <option value="date-asc">Date: Soonest</option>
            <option value="date-desc">Date: Latest</option>
            <option value="name-asc">Name: A–Z</option>
          </select>

          {/* Create */}
          <Link to="/events/submit" title="Create a new event">
            <button className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition">
              + Create Event
            </button>
          </Link>
        </div>

        {/* Messages */}
        <div className="mt-6">
          {msg && (
            <div className="text-sm mb-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3 py-2">{msg}</div>
          )}
          {loading && (
            <div className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Loading…
            </div>
          )}
        </div>

        {/* List */}
        <section className="py-6">
          {loading ? (
            <SkeletonList />
          ) : sortedItems.length === 0 ? (
            <EmptyState
              title="No events found"
              subtitle="Try a different search, or create a new event."
              cta={<Link className="underline" to="/events/submit">Create one</Link>}
            />
          ) : (
            <div className="grid gap-5">
              {sortedItems.map((ev) => (
                <EventRow key={ev._id} ev={ev} reload={load} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Event Card ---------- */
function EventRow({ ev, reload }) {
  const date = ev.date ? new Date(ev.date).toLocaleDateString() : "—";
  const d = ev.date ? new Date(ev.date) : null;
  const month = d ? d.toLocaleString("en-US", { month: "short" }) : "";
  const day = d ? d.getDate() : "";
  const time = `${ev.startTime || "--"} – ${ev.endTime || "--"}`;
  const cap = ev.capacity ?? 0;
  const reg = Array.isArray(ev.registrations) ? ev.registrations.length : ev.registeredCount || 0;
  const pct = cap > 0 ? Math.min(100, Math.round((reg / cap) * 100)) : 0;
  const left = cap > 0 ? Math.max(0, cap - reg) : 0;

  return (
    <div
      className="rounded-2xl border shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1"
      style={{ background: "linear-gradient(135deg, #E6F0FF 0%, #F8FBFF 100%)" }}
    >
      <div className="p-5 md:p-6 grid md:grid-cols-3 gap-6">
        {/* Left side info */}
        <div className="md:col-span-2 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold leading-tight truncate">{ev.name}</h3>
            {d && (
              <span className="shrink-0 grid place-content-center text-xs font-semibold text-white bg-emerald-600 rounded-md px-2 py-1">
                {month} {day}
              </span>
            )}
          </div>
          {ev.description && <p className="text-gray-600 mt-1 line-clamp-2">{ev.description}</p>}

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-800">
            <InfoPill label="Venue" value={ev.venue || "—"} />
            <InfoPill label="Date" value={date} />
            <InfoPill label="Time" value={time} />
            <InfoPill label="Capacity" value={cap} />
            <InfoPill label="Registered" value={reg} />
            <InfoPill label="Fee" value={ev.registrationFee ? `Rs. ${ev.registrationFee}` : "Rs. 200"} />
          </div>

          <div className="mt-4">
            {cap > 0 && (
              <>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {reg} / {cap} registered · {left} left
                </div>
              </>
            )}
            <div className="mt-3">
              <Link
                className="inline-flex items-center text-sm rounded-xl border border-emerald-600 text-emerald-700 px-3 py-1.5 hover:bg-emerald-50"
                to={`/events/${ev._id}`}
              >
                View details
              </Link>
            </div>
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
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 bg-white">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/* ---------- Quick Register ---------- */
function RegisterInline({ ev, onDone }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const click = async () => {
    setMsg("");

    if (!name.trim()) return setMsg("⚠️ Please enter your name");
    if (!validateEmail(email)) return setMsg("⚠️ Please enter a valid email");
    if (!validatePhone(phone)) return setMsg("⚠️ Phone number must be 10 digits");

    try {
      setSaving(true);
      // Go to payment page with event + registration data
      navigate("/events/payment", {
        state: {
          eventData: ev,
          registrationData: { name, email, phone },
          amount: ev.registrationFee || 200,
        },
      });
      onDone?.();
    } catch {
      setMsg("Failed to proceed to payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white w-full sm:w-[260px] shadow-sm">
      <div className="text-sm font-medium mb-2">
        Quick register {ev.registrationFee ? `(Rs. ${ev.registrationFee})` : "(Rs. 200)"}
      </div>
      <input
        className="w-full mb-2 rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full mb-2 rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full mb-3 rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={click}
        disabled={saving}
        className="w-full rounded-2xl px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
        {saving ? "Processing…" : "Register"}
      </button>
      {msg && <div className="text-xs mt-2 text-gray-700">{msg}</div>}
    </div>
  );
}

/* ---------- Skeletons ---------- */
function EventSkeleton() {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5 md:p-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-5 w-1/2 bg-slate-200 rounded"></div>
        <div className="h-5 w-14 bg-slate-200 rounded"></div>
      </div>
      <div className="mt-3 h-4 w-2/3 bg-slate-200 rounded"></div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
      </div>
      <div className="mt-4 h-2 bg-slate-200 rounded"></div>
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2"></div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="h-4 w-28 bg-slate-200 rounded mb-3"></div>
          <div className="h-10 w-full bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-5">
      {[0, 1, 2].map((i) => (
        <EventSkeleton key={i} />
      ))}
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