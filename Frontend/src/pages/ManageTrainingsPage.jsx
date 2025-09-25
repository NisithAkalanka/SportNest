// File: src/pages/ManageTrainingsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import trainingApi from "../services/trainingApi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarStyles.css";
import { FaCalendarAlt, FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const localizer = momentLocalizer(moment);

// --- Venue Images ---
const locationImages = {
  Ground: "/assets/ground.jpeg",
  Pool: "/assets/pool.jpeg",
  "Netball Court": "/assets/netball.jpeg",
  "Indoor Court": "/assets/indoor.jpeg",
  "Tennis Court": "/assets/tennis.jpeg",
  Default: "/assets/ground.jpeg",
};

// --- Custom Event Component ---
const EventCard = ({ event }) => (
  <div className="calendar-event" data-tooltip-id={`event-${event.id}`}>
    {event.title}
    <Tooltip
      id={`event-${event.id}`}
      place="top"
      effect="solid"
      style={{
        maxWidth: "280px",
        backgroundColor: "#1f1f1f",
        color: "#fff",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "0.85rem",
        textAlign: "left",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
      }}
    >
      <div>
        <strong style={{ fontSize: "0.95rem" }}>{event.title}</strong>
        <br />
        📍 {event.location}
        <br />
        🗓 {moment(event.start).format("MMMM Do YYYY")}
        <br />
        ⏰ {moment(event.start).format("HH:mm")} -{" "}
        {moment(event.end).format("HH:mm")}
      </div>
    </Tooltip>
  </div>
);

// --- Report Generation ---
const generateReport = (sessions) => {
  if (!sessions || sessions.length === 0) {
    alert("No sessions available to generate report.");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("My Created Training Sessions Report", 14, 22);

  const tableColumn = ["Title", "Venue", "Date", "Start Time", "End Time"];
  const tableRows = [];

  sessions.forEach((session) => {
    tableRows.push([
      session.title || "N/A",
      session.location || "N/A",
      moment(session.date).format("YYYY-MM-DD"),
      session.startTime || "--",
      session.endTime || "--",
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.setFontSize(10);
  doc.text(
    `Generated on ${moment(new Date()).format("YYYY-MM-DD HH:mm")}`,
    14,
    doc.internal.pageSize.height - 10
  );

  doc.save("training-sessions-report.pdf");
};

// --- Modal for Add/Edit ---
const SessionModal = ({ slotInfo, existingSession, onClose, onSave, allSessions }) => {
  const isEditing = !!existingSession;

  const [title, setTitle] = useState(isEditing ? existingSession.title : "");
  const [location, setLocation] = useState(
    isEditing ? existingSession.location : "Ground"
  );
  const [date, setDate] = useState(
    isEditing
      ? moment(existingSession.date).format("YYYY-MM-DD")
      : moment(slotInfo?.start).format("YYYY-MM-DD")
  );
  const [startTime, setStartTime] = useState(
    isEditing
      ? existingSession.startTime
      : moment(slotInfo?.start).format("HH:mm")
  );
  const [endTime, setEndTime] = useState(
    isEditing ? existingSession.endTime : moment(slotInfo?.end).format("HH:mm")
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const selectedDate = moment(date, "YYYY-MM-DD");
      const now = moment().startOf("day");
      const maxDate = moment().add(3, "weeks").endOf("day");

      // --- Date Validation ---
      if (selectedDate.isBefore(now, "day")) {
        setError("❌ You cannot create a session for past dates.");
        setLoading(false);
        return;
      }
      if (selectedDate.isAfter(maxDate, "day")) {
        setError("⚠️ You can only schedule sessions within the next 3 weeks.");
        setLoading(false);
        return;
      }

      // --- Time Overlap Validation ---
      const newStart = moment(`${date} ${startTime}`, "YYYY-MM-DD HH:mm");
      const newEnd = moment(`${date} ${endTime}`, "YYYY-MM-DD HH:mm");

      if (newEnd.isSameOrBefore(newStart)) {
        setError("❌ End time must be after start time.");
        setLoading(false);
        return;
      }

      const conflict = allSessions.some((s) => {
        if (isEditing && s._id === existingSession._id) return false; // ignore same session when editing
        if (s.location !== location) return false;
        if (moment(s.date).format("YYYY-MM-DD") !== date) return false;

        const existingStart = moment(`${s.date} ${s.startTime}`, "YYYY-MM-DD HH:mm");
        const existingEnd = moment(`${s.date} ${s.endTime}`, "YYYY-MM-DD HH:mm");

        return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
      });

      if (conflict) {
        setError("⚠️ This session conflicts with another at the same venue & time.");
        setLoading(false);
        return;
      }

      // --- Save ---
      const trainingData = { title, location, date, startTime, endTime };
      if (isEditing) {
        await trainingApi.updateSession(existingSession._id, trainingData);
      } else {
        await trainingApi.createTraining(trainingData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>
          {isEditing
            ? "Edit Training Session"
            : `Add Session for ${moment(slotInfo.start).format("MMMM Do")}`}
        </h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <p
              style={{
                color: "red",
                background: "#ffebeb",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </p>
          )}
          <div style={{ margin: "0.5rem 0" }}>
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ margin: "0.5rem 0" }}>
            <label>Venue *</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="Pool">Pool</option>
              <option value="Ground">Ground</option>
              <option value="Netball Court">Netball Court</option>
              <option value="Indoor Court">Indoor Court</option>
              <option value="Tennis Court">Tennis Court</option>
            </select>
          </div>
          <div style={{ margin: "0.5rem 0" }}>
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", margin: "0.5rem 0" }}>
            <div style={{ flex: 1 }}>
              <label>Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>End Time *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, background: "#6c757d" }}
            >
              Cancel
            </button>
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                ? "Update Session"
                : "Save Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
const ManageTrainingsPage = () => {
  const [mySessions, setMySessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    slot: null,
    session: null,
  });
  const [error, setError] = useState("");

  // Filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");

  const fetchAllData = useCallback(async () => {
    try {
      setError("");
      const coachSessions = await trainingApi.getMySessions();
      setMySessions(
        coachSessions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
      const formattedEvents = coachSessions.map((session) => ({
        id: session._id,
        title: `${session.title}`,
        location: session.location,
        start: moment(
          `${moment(session.date).format("YYYY-MM-DD")} ${session.startTime}`
        ).toDate(),
        end: moment(
          `${moment(session.date).format("YYYY-MM-DD")} ${session.endTime}`
        ).toDate(),
      }));
      setEvents(formattedEvents);
    } catch (err) {
      setError("Could not fetch sessions. Please make sure you are logged in as a Coach.");
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this session?")) {
      try {
        await trainingApi.deleteSession(id);
        fetchAllData();
      } catch {
        alert("Could not delete the session.");
      }
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (moment(slotInfo.start).isBefore(moment())) return;
    setModalInfo({ isOpen: true, slot: slotInfo, session: null });
  };

  const handleEditClick = (session) => {
    setModalInfo({ isOpen: true, slot: null, session });
  };

  const handleSaveOrUpdate = () => fetchAllData();

  // --- Filtered Sessions for Report ---
  const filteredSessions = mySessions.filter((session) => {
    const sessionMonth = moment(session.date).month() + 1;
    const monthMatch = selectedMonth
      ? sessionMonth === parseInt(selectedMonth)
      : true;
    const venueMatch = selectedVenue
      ? session.location === selectedVenue
      : true;
    return monthMatch && venueMatch;
  });

  return (
    <div className="calendar-page-container">
      <div className="calendar-container" style={{ height: "85vh" }}>
        {/* Header with Filters + Report Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.3rem" }}>
              Training Session Scheduler
            </h2>
            <p style={{ margin: 0, color: "#666" }}>
              To add a new session, click and drag on an available time slot below.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* Month Filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="">All Months</option>
              {moment.months().map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Venue Filter */}
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="">All Venues</option>
              <option value="Ground">Ground</option>
              <option value="Pool">Pool</option>
              <option value="Netball Court">Netball Court</option>
              <option value="Indoor Court">Indoor Court</option>
              <option value="Tennis Court">Tennis Court</option>
            </select>

            {/* Report Button */}
            {filteredSessions.length > 0 && (
              <button
                onClick={() => generateReport(filteredSessions)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "5px",
                  background: "#28a745",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  height: "40px",
                }}
              >
                📄 Generate Report
              </button>
            )}
          </div>
        </div>

        {/* Calendar */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable={true}
          onSelectSlot={handleSelectSlot}
          defaultView="week"
          components={{ event: EventCard }}
        />
      </div>

      {/* My Created Sessions */}
      <div style={{ padding: "1rem", marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          My Created Sessions
        </h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!error && mySessions.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {mySessions.map((session) => {
              const bgImage = locationImages[session.location] || locationImages["Default"];
              return (
                <div
                  key={session._id}
                  className="session-card"
                  style={{
                    ...sessionCardStyle,
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.65)), url(${bgImage})`,
                  }}
                >
                  <div style={sessionInfoStyle}>
                    <strong style={sessionTitleStyle}>{session.title}</strong>
                    <div style={sessionDetailsWrapperStyle}>
                      <p style={sessionDetailItemStyle}>
                        <FaCalendarAlt style={{ marginRight: "8px" }} />
                        {moment(session.date).format("dddd, MMMM Do YYYY")} at {session.startTime}
                      </p>
                      <p style={sessionDetailItemStyle}>
                        <FaMapMarkerAlt style={{ marginRight: "8px" }} />
                        {session.location}
                      </p>
                    </div>
                  </div>
                  <div style={sessionActionsStyle}>
                    <button
                      onClick={() => handleEditClick(session)}
                      style={{
                        ...actionButtonStyle,
                        background: "rgba(255, 193, 7, 0.9)",
                        color: "#212529",
                      }}
                    >
                      <FaEdit style={{ marginRight: "6px" }} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      style={{
                        ...actionButtonStyle,
                        background: "rgba(220, 53, 69, 0.9)",
                      }}
                    >
                      <FaTrash style={{ marginRight: "6px" }} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !error && <p>You have not created any sessions yet.</p>
        )}
      </div>

      {modalInfo.isOpen && (
        <SessionModal
          slotInfo={modalInfo.slot}
          existingSession={modalInfo.session}
          allSessions={mySessions}
          onClose={() => setModalInfo({ isOpen: false, slot: null, session: null })}
          onSave={handleSaveOrUpdate}
        />
      )}
    </div>
  );
};

// --- Styles ---
const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  marginTop: "4px",
};
const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  background: "#007bff",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalStyle = {
  background: "white",
  padding: "2rem",
  borderRadius: "8px",
  width: "450px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
};

// Card Styles
const sessionCardStyle = {
  color: "#ffffff",
  backgroundSize: "cover",
  backgroundPosition: "center",
  padding: "1.5rem",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "220px",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
};

const sessionInfoStyle = { zIndex: 2 };
const sessionTitleStyle = {
  fontSize: "1.6rem",
  fontWeight: "bold",
  textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
  marginBottom: "0.75rem",
  color: "#fff",
};
const sessionDetailsWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};
const sessionDetailItemStyle = {
  display: "flex",
  alignItems: "center",
  margin: 0,
  fontSize: "0.95rem",
  textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
  fontWeight: "500",
  color: "#f0f0f0",
};
const sessionActionsStyle = {
  display: "flex",
  gap: "0.75rem",
  marginTop: "1.5rem",
  alignSelf: "flex-end",
  zIndex: 2,
};
const actionButtonStyle = {
  display: "flex",
  alignItems: "center",
  padding: "9px 15px",
  border: "none",
  borderRadius: "5px",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  transition: "opacity 0.2s, transform 0.2s",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
};

export default ManageTrainingsPage;
