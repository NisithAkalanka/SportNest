import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEvent, updateEvent } from "@/services/eventsApi";

export default function EditEvent(){
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:"", description:"", venue:"",
    venueFacilities:[], requestedItems:[{item:"", qty:1}],
    capacity:1, date:"", startTime:"", endTime:"",
    registrationFee: 0
  });
  const [msg, setMsg] = useState("");

  const setF = (k,v)=> setForm(f=>({...f,[k]:v}));
  const addReq = ()=> setForm(f=>({...f, requestedItems:[...f.requestedItems, {item:"",qty:1}]}));

  useEffect(()=>{ (async()=>{
    try{
      const {data} = await getEvent(id);
      setForm({
        name: data.name || "",
        description: data.description || "",
        venue: data.venue || "",
        venueFacilities: data.venueFacilities || [],
        requestedItems: (data.requestedItems?.length ? data.requestedItems : [{item:"",qty:1}]),
        capacity: data.capacity || 1,
        date: data.date ? new Date(data.date).toISOString().slice(0,10) : "",
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        registrationFee: data.registrationFee ?? 0
      });
    }catch{ setMsg("Failed to load event"); }
  })(); },[id]);

  const onSubmit = async (e)=>{
    e.preventDefault(); setMsg("");
    try{
      await updateEvent(id, form);
      navigate("/admin-dashboard/events/moderate");
    }catch(e){
      setMsg(e?.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Edit Event (Admin)</h1>
      {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}

      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="border p-2 rounded" placeholder="Event name" value={form.name} onChange={e=>setF("name",e.target.value)} required/>
        <textarea className="border p-2 rounded" placeholder="Description" value={form.description} onChange={e=>setF("description",e.target.value)}/>
        <input className="border p-2 rounded" placeholder="Venue" value={form.venue} onChange={e=>setF("venue",e.target.value)} required/>

        <input className="border p-2 rounded" placeholder="Venue facilities (comma separated)"
               value={form.venueFacilities.join(", ")}
               onChange={e=>setF("venueFacilities", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}/>

        <div className="border p-3 rounded">
          <div className="font-medium mb-2">Items needed from admin</div>
          {form.requestedItems.map((r,idx)=>(
            <div key={idx} className="flex gap-2 mb-2">
              <input className="border p-2 rounded flex-1" placeholder="Item" value={r.item}
                     onChange={e=>{
                       const a=[...form.requestedItems]; a[idx].item=e.target.value; setF("requestedItems",a);
                     }}/>
              <input type="number" min={1} className="border p-2 rounded w-24" value={r.qty}
                     onChange={e=>{
                       const a=[...form.requestedItems]; a[idx].qty=Number(e.target.value||1); setF("requestedItems",a);
                     }}/>
            </div>
          ))}
          <button type="button" onClick={addReq} className="underline">+ Add item</button>
        </div>

        <input type="number" min={1} className="border p-2 rounded"
               placeholder="Capacity" value={form.capacity}
               onChange={e=>setF("capacity", Number(e.target.value||1))} required/>


          <div>
    <label className="text-sm font-medium text-gray-600">Registration Fee (Rs.)</label>
    <input type="number" min={0} className="border p-2 rounded w-full mt-1"
           placeholder="Registration Fee" value={form.registrationFee}
           onChange={e=>setF("registrationFee", Number(e.target.value < 0 ? 0 : e.target.value))} required/>
</div>





        <input type="date" className="border p-2 rounded" value={form.date} onChange={e=>setF("date",e.target.value)} required/>
        <div className="flex gap-2">
          <input type="time" className="border p-2 rounded" value={form.startTime} onChange={e=>setF("startTime",e.target.value)} required/>
          <input type="time" className="border p-2 rounded" value={form.endTime} onChange={e=>setF("endTime",e.target.value)} required/>
        </div>

        <div className="flex gap-2">
          <button className="bg-black text-white px-4 py-2 rounded">Save</button>
        </div>
      </form>
    </div>
  );
}
