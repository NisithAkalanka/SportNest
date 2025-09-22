// Backend/controllers/eventsReportController.js
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const Event = require("../models/Event");

/* ---------- style & utils ---------- */
const BRAND   = "#0D1B2A";
const ACCENT  = "#FF6700";
const GREEN   = "#22c55e";
const RED     = "#ef4444";
const MUTED   = "#6b7280";
const BG_CARD = "#F7F7F9";
const mm = v => (v * 72) / 25.4;

const toDate = d => (d ? new Date(d) : null);
const cap = s => (s || "").replace(/^\w/, c => c.toUpperCase());

/* ---------- data builder ---------- */
async function buildSummary({ from, to, status }) {
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = toDate(from);
    if (to)   match.date.$lte = toDate(to);
  }
  if (status) match.status = status;

  // KPIs
  const kpiAgg = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        events: { $sum: 1 },
        capacity: { $sum: { $ifNull: ["$capacity", 0] } },
        regs: { $sum: { $size: { $ifNull: ["$registrations", []] } } },
      }
    }
  ]);
  const kpis = kpiAgg[0] || { events: 0, capacity: 0, regs: 0 };

  // By status
  const byStatus = await Event.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Trend by month
  const trend = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: { y: { $year: "$date" }, m: { $month: "$date" } },
        count: { $sum: 1 },
        capacity: { $sum: { $ifNull: ["$capacity", 0] } },
        registrations: { $sum: { $size: { $ifNull: ["$registrations", []] } } },
      }
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
  ]);

  // Top venues
  const topVenues = await Event.aggregate([
    { $match: match },
    { $group: { _id: "$venue", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // Approved list (limited for UI/PDF)
  const approvedQuery = { ...match, status: "approved" };
  const approvedDocs = await Event.find(approvedQuery)
    .sort({ date: 1, startTime: 1 })
    .limit(50)
    .select("name venue date startTime endTime capacity registrations")
    .lean();

  const approvedList = approvedDocs.map(r => ({
    name: r.name || "-",
    venue: r.venue || "-",
    date: r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
    time: [r.startTime, r.endTime].filter(Boolean).join("–"),
    capacity: r.capacity || 0,
    registered: (r.registrations || []).length,
  }));

  return { kpis, byStatus, trend, topVenues, approvedList };
}

/* ---------- JSON summary ---------- */
exports.getSummary = async (req, res, next) => {
  try {
    const data = await buildSummary({
      from: req.query.from,
      to: req.query.to,
      status: req.query.status || "",
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* ---------- CSV export ---------- */
exports.exportCSV = async (req, res, next) => {
  try {
    const match = {};
    if (req.query.from || req.query.to) {
      match.date = {};
      if (req.query.from) match.date.$gte = toDate(req.query.from);
      if (req.query.to)   match.date.$lte = toDate(req.query.to);
    }
    if (req.query.status) match.status = req.query.status;

    const rows = await Event.find(match).sort({ date: 1, startTime: 1 }).lean();
    const flat = rows.map(r => ({
      name: r.name,
      description: r.description || "",
      venue: r.venue || "",
      status: r.status,
      date: r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
      startTime: r.startTime || "",
      endTime: r.endTime || "",
      capacity: r.capacity || 0,
      registered: (r.registrations || []).length,
    }));

    const parser = new Parser({ fields: Object.keys(flat[0] || { name: "", status: "" }) });
    const generatedAt = new Date().toISOString();
    const headerMeta = `SportNest Events Report,Generated at,${generatedAt},Range,${req.query.from||""},${req.query.to||""}\n`;
    const csv = headerMeta + parser.parse(flat);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="events_report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

/* ---------- PDF helpers ---------- */
function kpiCard(doc, x, y, w, h, label, value) {
  doc.save()
    .roundedRect(x, y, w, h, 8).fill(BG_CARD).stroke()
    .fillColor(MUTED).font("Helvetica").fontSize(10).text(label, x + 12, y + 10)
    .fillColor(BRAND).font("Helvetica-Bold").fontSize(22).text(String(value), x + 12, y + 28)
    .restore();
}
function sectionTitle(doc, text, y) {
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(14).text(text, mm(15), y);
  doc.moveTo(mm(15), y + 18).lineTo(mm(195), y + 18).strokeColor("#E5E7EB").lineWidth(1).stroke();
}
function chip(doc, text, color, x, y) {
  const padX = 8, padY = 4;
  const w = doc.widthOfString(text) + padX * 2;
  const h = doc.currentLineHeight() + padY * 2;
  doc.save()
     .roundedRect(x, y, w, h, 6).fillColor(color).fill()
     .fillColor("#fff").font("Helvetica-Bold").fontSize(10).text(text, x + padX, y + padY)
     .restore();
  return { w, h };
}
function table(doc, x, y, cols, rows) {
  const colWidths = cols.map(c => c.w);
  const totalW = colWidths.reduce((a,b)=>a+b,0);
  const rowH = 22;

  doc.save().font("Helvetica-Bold").fontSize(11).fillColor(BRAND);
  cols.forEach((c,i)=>{
    const cx = x + colWidths.slice(0,i).reduce((a,b)=>a+b,0) + 8;
    doc.text(c.label, cx, y + 6);
  });
  doc.restore();

  doc.moveTo(x, y + rowH).lineTo(x + totalW, y + rowH).strokeColor("#E5E7EB").stroke();

  let cy = y + rowH + 4;
  rows.forEach(r=>{
    cols.forEach((c,i)=>{
      const cx = x + colWidths.slice(0,i).reduce((a,b)=>a+b,0) + 8;
      doc.fillColor("#111827").font("Helvetica").fontSize(10).text(String(r[c.key] ?? ""), cx, cy);
    });
    cy += rowH;
    doc.moveTo(x, cy - 4).lineTo(x + totalW, cy - 4).strokeColor("#F3F4F6").stroke();
  });
  return cy;
}

/* ---------- PDF export ---------- */
exports.exportPDF = async (req, res, next) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      status: req.query.status || "",
    };
    const summary = await buildSummary(filters);

    const doc = new PDFDocument({ size: "A4", margin: mm(12) });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="events_report.pdf"');
    doc.pipe(res);

    const W = doc.page.width;
    const M = doc.page.margins.left;

    // banner
    doc.save()
      .rect(0, 0, W, mm(28)).fill(BRAND)
      .fillColor("#fff").font("Helvetica-Bold").fontSize(22).text("SportNest", M, mm(9))
      .fillColor(ACCENT).fontSize(12).text("Events Report", W - M - doc.widthOfString("Events Report"), mm(11))
      .restore();

    const nowStr = new Date().toLocaleString();
    const range = [
      filters.from ? new Date(filters.from).toLocaleDateString() : "—",
      filters.to   ? new Date(filters.to).toLocaleDateString()   : "—",
    ].join("  →  ");
    doc.fillColor(MUTED).font("Helvetica").fontSize(10);
    doc.text(`Generated: ${nowStr}`, M, mm(32));
    doc.text(`Range: ${range}${filters.status ? `   •   Status: ${filters.status}` : ""}`, M, mm(37));

    // KPIs
    const topY = mm(46);
    const cardW = (W - M * 2 - 16) / 3;
    const cardH = 60;
    kpiCard(doc, M, topY, cardW, cardH, "Total Events",      summary.kpis?.events || 0);
    kpiCard(doc, M + cardW + 8, topY, cardW, cardH, "Total Capacity",    summary.kpis?.capacity || 0);
    kpiCard(doc, M + (cardW + 8) * 2, topY, cardW, cardH, "Total Registered", summary.kpis?.regs || 0);

    // by status chips
    let y = topY + cardH + 20;
    sectionTitle(doc, "Events by Status", y); y += 26;

    const statusColors = { approved: GREEN, pending: ACCENT, rejected: RED, default: "#3b82f6" };
    let cx = M, cy = y, maxW = W - M * 2;
    (summary.byStatus || []).forEach(s => {
      const label = `${(s._id || "unknown").toUpperCase()}  •  ${s.count}`;
      const color = statusColors[s._id] || statusColors.default;
      const { w } = chip(doc, label, color, cx, cy);
      cx += w + 8;
      if (cx > M + maxW) { cx = M; cy += 28; }
    });
    y = cy + 40;

    // venues table
    sectionTitle(doc, "Top Venues", y); y += 22;
    const rows = (summary.topVenues || []).map(v => ({ venue: v._id || "-", events: v.count || 0 }));
    y = table(
      doc, M, y,
      [{ label: "Venue", key: "venue", w: mm(120) }, { label: "Events", key: "events", w: mm(60) }],
      rows
    ) + 10;

    // approved events table
    sectionTitle(doc, "Approved Events (within range)", y); y += 22;
    const rowsApproved = (summary.approvedList || []).map(e => ({
      name: e.name,
      date: e.date,
      time: e.time || "-",
      venue: e.venue,
      rc: `${e.registered}/${e.capacity}`,
    }));
    table(
      doc,
      M,
      y,
      [
        { label: "Event",   key: "name", w: mm(70) },
        { label: "Date",    key: "date", w: mm(28) },
        { label: "Time",    key: "time", w: mm(28) },
        { label: "Venue",   key: "venue", w: mm(44) },
        { label: "Reg/Cap", key: "rc",   w: mm(24) },
      ],
      rowsApproved
    );

    // footer
    doc.fillColor(MUTED).fontSize(9);
    doc.text("SportNest • Automated Report", M, doc.page.height - mm(18));
    doc.text(String(nowStr), W - M - doc.widthOfString(nowStr), doc.page.height - mm(18));

    doc.end();
  } catch (err) {
    next(err);
  }
};
