import { useEffect, useMemo, useState } from "react";
import { getEventsReport, downloadEventsCSV, downloadEventsPDF } from "@/services/eventsApi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = ["#22c55e","#f97316","#ef4444","#3b82f6","#a855f7"];

export default function EventsReport(){
  const navigate = useNavigate();

  const [filters, setFilters] = useState(()=> {
    const today = new Date(); today.setHours(0,0,0,0);
    const from = new Date(); from.setMonth(from.getMonth()-3);
    return { from: toISO(from), to: toISO(today), status: "" };
  });
  const [data, setData] = useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");

  const load = async ()=>{
    try{
      setLoading(true);
      const { data } = await getEventsReport(filters);
      setData(data); setErr("");
    }catch(e){
      setErr(e?.response?.data?.error || "Failed to load report");
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);

  const pieData = useMemo(()=> (data?.byStatus||[]).map(s=>({ name: cap(s._id), value: s.count })), [data]);
  const barData = useMemo(()=> (data?.trend||[]).map(t=>({
    month: `${t._id.y}-${String(t._id.m).padStart(2,"0")}`,
    Events: t.count,
    Capacity: t.capacity,
    Registered: t.registrations
  })), [data]);

  const download = async (fmt) => {
    try {
      const resp = fmt === "csv"
        ? await downloadEventsCSV(filters)
        : await downloadEventsPDF(filters);

      const type = fmt === "csv" ? "text/csv;charset=utf-8" : "application/pdf";
      const blob = new Blob([resp.data], { type });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fmt === "csv" ? "events_report.csv" : "events_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Download failed. Check console for details.");
    }
  };

  return (
    <div className="p-6">
      {/* Top bar with Back */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Events Report</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>navigate(-1)}>Back</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-end gap-2">
          <div className="grid gap-1">
            <label className="text-xs text-gray-500">From</label>
            <input type="date" value={filters.from} onChange={e=>setFilters(f=>({...f,from:e.target.value}))}
                   className="border rounded p-2"/>
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-gray-500">To</label>
            <input type="date" value={filters.to} onChange={e=>setFilters(f=>({...f,to:e.target.value}))}
                   className="border rounded p-2"/>
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-gray-500">Status</label>
            <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}
                    className="border rounded p-2">
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Button onClick={load} className="h-10 px-4" style={{ backgroundColor: "#FF6700" }}>Apply</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>download("csv")}>Download CSV</Button>
          <Button variant="outline" onClick={()=>download("pdf")}>Download PDF</Button>
        </div>
      </div>

      {err && <div className="text-rose-600 mb-3">{err}</div>}
      {loading && <div className="text-gray-500">Loading…</div>}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KPIs */}
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPI label="Total Events" value={data.kpis?.events || 0}/>
              <KPI label="Total Capacity" value={data.kpis?.capacity || 0}/>
              <KPI label="Total Registered" value={data.kpis?.regs || 0}/>
            </CardContent>
          </Card>

          {/* By Status Pie */}
          <Card>
            <CardHeader><CardTitle>Events by Status</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Monthly Trend</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Events" />
                  <Bar dataKey="Registered" />
                  <Bar dataKey="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Venues */}
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Top Venues</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {(data.topVenues || []).map(v=>(
                  <div key={v._id} className="flex justify-between border rounded p-2">
                    <span className="font-medium">{v._id || "-"}</span>
                    <span className="text-gray-600">{v.count} events</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approved Events list (within current filters) */}
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Approved Events</CardTitle></CardHeader>
            <CardContent>
              {(!data.approvedList || data.approvedList.length === 0) ? (
                <div className="text-sm text-gray-500">No approved events in this range.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border rounded-md overflow-hidden">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-3 py-2">Event</th>
                        <th className="text-left px-3 py-2">Date</th>
                        <th className="text-left px-3 py-2">Time</th>
                        <th className="text-left px-3 py-2">Venue</th>
                        <th className="text-right px-3 py-2">Registered / Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.approvedList.map((e, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2 font-medium">{e.name}</td>
                          <td className="px-3 py-2">{e.date}</td>
                          <td className="px-3 py-2">{e.time || '-'}</td>
                          <td className="px-3 py-2">{e.venue}</td>
                          <td className="px-3 py-2 text-right">
                            <span className="inline-block rounded-full px-2 py-0.5 bg-green-50 text-green-700">
                              {e.registered}/{e.capacity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-xs text-gray-500 mt-2">
                    Showing up to 50 items.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value }){
  return (
    <div className="rounded-xl p-4 bg-white border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function toISO(d){ return d.toISOString().slice(0,10); }
function cap(s){ return (s||"").replace(/^\w/, c=>c.toUpperCase()); }
