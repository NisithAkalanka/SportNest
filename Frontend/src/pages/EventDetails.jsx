// src/pages/EventDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEvent, registerEvent } from "@/services/eventsApi";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function EventDetails() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);

  // form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getEvent(id);
        setEv(data);
        setMsg("");
      } catch {
        setMsg("Event not found");
      }
    })();
  }, [id]);

  const validateForm = () => {
    if (!name || !email || !phone) {
      setMsg("❌ All fields are required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMsg("❌ Invalid email format");
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setMsg("❌ Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const onRegister = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const { data } = await registerEvent(id, { name, email, phone });
      setMsg(`✅ Registered (${data.registeredCount}/${data.capacity})`);
      setName(""); setEmail(""); setPhone("");
    } catch (e) {
      setMsg(e?.response?.data?.error || "❌ Failed to register");
    } finally {
      setSaving(false);
    }
  };

  if (!ev) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Link to="/events">
          <Button variant="outline" className="h-9 px-3 mb-4">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Events
          </Button>
        </Link>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
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

      <h1 className="text-2xl font-semibold mb-2">{ev.name}</h1>
      <div className="opacity-70 mb-4">
        {ev.venue || "—"} • {ev.date ? new Date(ev.date).toLocaleDateString() : "—"} •{" "}
        {ev.startTime}-{ev.endTime}
      </div>
      <p className="mb-4">{ev.description}</p>

      {/* Quick facts */}
      <div className="mb-4 text-sm">
        Capacity: <b>{ev.capacity}</b> • Registered: <b>{ev.registrations?.length || 0}</b>
      </div>

      {/* Register button */}
      <Button onClick={() => setOpen(true)} className="bg-green-600 hover:bg-green-700">
        Register Now
      </Button>

      {/* ✅ Popup Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-green-50 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4 text-green-800">Register for Event</h2>

            {/* Form */}
            <div className="grid gap-3">
              <input
                className="border p-2 rounded focus:ring-2 focus:ring-green-500"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="border p-2 rounded focus:ring-2 focus:ring-green-500"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="border p-2 rounded focus:ring-2 focus:ring-green-500"
                placeholder="Phone (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Button
                onClick={onRegister}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? "Registering..." : "Register"}
              </Button>

              {msg && (
                <div
                  className={`text-sm mt-1 ${
                    msg.startsWith("✅") ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
