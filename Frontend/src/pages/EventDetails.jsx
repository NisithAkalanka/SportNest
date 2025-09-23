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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

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

  const onRegister = async () => {
    try {
      setSaving(true);
      const { data } = await registerEvent(id, { name, email, phone });
      setMsg(`✅ Registered (${data.registeredCount}/${data.capacity})`);
      setName(""); setEmail(""); setPhone("");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Failed");
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
        {ev.venue || "—"} • {ev.date ? new Date(ev.date).toLocaleDateString() : "—"} • {ev.startTime}-{ev.endTime}
      </div>
      <p className="mb-4">{ev.description}</p>

      {/* Quick facts */}
      <div className="mb-4 text-sm">
        Capacity: <b>{ev.capacity}</b> • Registered: <b>{ev.registrations?.length || 0}</b>
      </div>

      {/* Inline register form */}
      <div className="border rounded p-3 grid gap-2 max-w-md">
        <div className="font-medium">Register</div>
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <Button onClick={onRegister} disabled={saving}>
          {saving ? "Registering..." : "Register"}
        </Button>
        {msg && <div className="text-sm">{msg}</div>}
      </div>
    </div>
  );
}
