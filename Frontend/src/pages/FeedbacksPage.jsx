// File: frontend/src/pages/FeedbacksPage.jsx
// Description: This component provides a full CRUD interface for coaches to manage player feedback.

// --- 1. Core Imports ---
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/MemberAuthContext";

// --- 2. API Function Imports ---
import { getSimplePlayerListForCoach } from "@/api/players";
import { createCoachFeedback, listCoachFeedbacks, updateFeedback, deleteFeedback } from "@/api/feedbacks";

// --- 3. UI Component Imports from Shadcn/ui ---
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// --- 4. Icon Imports from react-icons ---
import { IoMdRefresh } from "react-icons/io";
import { FaStar, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { MdErrorOutline, MdInfoOutline } from "react-icons/md";

/**
 * Reusable Star Rating Component
 * Allows users to select a rating from 1 to 5 with a hover effect.
 */
function Stars({ value, onChange, size = "text-2xl" }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className={`flex gap-1 ${size} text-gray-300`}>
      {[1, 2, 3, 4, 5].map(n => (
        <button type="button" key={n} className="select-none transition-transform hover:scale-125" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange?.(n)} aria-label={`${n} star`}>
          {active >= n ? <FaStar className="text-yellow-400" /> : <FaStar />}
        </button>
      ))}
    </div>
  );
}

/**
 * Main component for the Feedback Management page.
 */
export default function FeedbacksPage() {
  // --- 5. State Management ---
  const { user } = useContext(AuthContext); // Get user data from authentication context
  const token = user?.token || user?.userInfo?.token;
  const role = (user?.role || user?.userInfo?.role || '').toLowerCase();
  
  // State for data lists
  const [players, setPlayers] = useState([]);
  const [items, setItems] = useState([]); // This holds the feedback history list

  // State for UI control
  const [loadingList, setLoadingList] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: 'info' }); // For displaying status messages
  const [busy, setBusy] = useState(false); // For disabling buttons during API calls
  
  // State for the main form (for both creating and editing)
  const [playerId, setPlayerId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(null); // Stores the feedback object being edited

  // Derived state to check user permissions
  const canManage = role === "coach" || role === "admin";
  
  // --- 6. Data Fetching Functions ---

  // Fetches just the list of players for the dropdown
  const fetchPlayers = async () => {
    setMsg({ text: "Refreshing player list...", type: 'info' });
    try {
      const list = await getSimplePlayerListForCoach(token);
      setPlayers(list.data || list);
      setMsg({text: '', type: 'info'});
    } catch (e) {
      setMsg({ text: "Could not refresh players list.", type: 'error'});
    }
  };

  // Fetches just the feedback history list
  const fetchFeedbackList = async () => {
    try {
      const list = await listCoachFeedbacks(token);
      setItems(list.data || list);
    } catch (e) {
      setMsg({text: "Could not refresh feedback history.", type: 'error'});
    }
  };
  
  // Main effect hook to load all necessary data when the component first renders
  useEffect(() => {
    if (!canManage) { 
      setLoadingList(false); 
      return; 
    }
    const loadData = async () => {
      setLoadingList(true);
      try {
        const [playerList, feedbackList] = await Promise.all([getSimplePlayerListForCoach(token), listCoachFeedbacks(token)]);
        setPlayers(playerList.data || playerList);
        setItems(feedbackList.data || feedbackList);
      } catch (e) {
        setMsg({text: "Failed to load initial page data.", type: 'error'});
      } finally {
        setLoadingList(false);
      }
    };
    loadData();
  }, [token, canManage]); // Re-run if the token or user permission changes
  
  // --- 7. CRUD (Create, Read, Update, Delete) Handlers ---
  
  // Resets the form fields to their default state
  const resetForm = () => {
    setPlayerId("");
    setRating(0);
    setComment("");
    setEditing(null);
  };

  // CREATE: Handles submission of a new feedback
  const submit = async (e) => {
    e.preventDefault();
    if (!playerId || !rating) { setMsg({ text: "Player and rating are required.", type: 'error' }); return; }
    try {
      setBusy(true);
      await createCoachFeedback({ playerId, rating, comment }, token);
      await fetchFeedbackList(); // Re-fetch list to show the new item
      resetForm();
      setMsg({ text: "Feedback sent successfully!", type: 'success' });
    } catch (e) {
      setMsg({ text: e?.response?.data?.message || "Submit failed.", type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  // Prepares the form for editing an existing feedback
  const startEdit = (feedback) => {
    setEditing(feedback);
    setPlayerId(feedback.player?._id || '');
    setRating(feedback.rating);
    setComment(feedback.comment || "");
    const playerName = feedback.player?.member ? `${feedback.player.member.firstName} ${feedback.player.member.lastName}`.trim() : 'Player';
    setMsg({ text: `Editing feedback for: ${playerName}`, type: 'info' });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top to see the form
  };
  
  // Cancels the editing mode and resets the form
  const cancelEdit = () => {
    resetForm();
    setMsg({text: '', type: ''});
  };

  // UPDATE: Saves the changes for the feedback being edited
  const saveEdit = async () => {
    if (!rating) { setMsg({ text: "Rating cannot be empty.", type: 'error' }); return; }
    try {
      setBusy(true);
      await updateFeedback(editing._id, { rating, comment }, token);
      await fetchFeedbackList(); // Re-fetch list to show updated data
      cancelEdit(); // This will also reset the form
      setMsg({ text: "Feedback updated successfully!", type: 'success' });
    } catch (e) {
      setMsg({ text: e?.response?.data?.message || "Update failed.", type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  // DELETE: Removes a feedback from the database
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this feedback?")) return;
    try {
      await deleteFeedback(id, token);
      await fetchFeedbackList(); // Re-fetch list to show the item is gone
      setMsg({ text: 'Feedback deleted.', type: 'success' });
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  // --- 8. Render Logic ---
  
  // Show an unauthorized message if the user does not have permission
  if (!canManage) {
    return (
      <div className="p-8 container mx-auto">
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="mt-2 text-gray-600">You must be a coach or an administrator to view this page.</p>
      </div>
    );
  }

  // Main render of the page's UI
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 tracking-tight">Feedback & Review Management</h1>
        
        {/* The main form for submitting or editing feedback */}
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-t-4 border-t-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-700">
              {editing ? `Update Feedback for ${editing.player?.member?.firstName || ''} ${editing.player?.member?.lastName || ''}` : "Submit New Feedback"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editing ? (e)=>{e.preventDefault(); saveEdit();} : submit} className="space-y-5">
              
              {/* Player Selection Dropdown with Refresh Button */}
              <div> 
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="player-select" className="font-semibold text-gray-600">Select Player</Label>
                  {!editing && (
                    <Button type="button" variant="ghost" size="sm" onClick={fetchPlayers}>
                      <IoMdRefresh className="mr-2 h-4 w-4" />
                      Refresh List
                    </Button>
                  )}
                </div>
                <select 
                  id="player-select" 
                  className="border rounded-md h-10 px-3 w-full bg-gray-50 disabled:bg-gray-200"
                  value={playerId} 
                  onChange={(e) => setPlayerId(e.target.value)} 
                  disabled={loadingList || busy || !!editing} // Disabled while loading or if in editing mode
                > 
                  <option value="" disabled> {loadingList ? "Loading players..." : "Select a player..."} </option> 
                  {players.map(p => (<option key={p._id} value={p._id}> {p.displayName}{p.clubId ? ` (${p.clubId})` : ""} </option> ))} 
                </select>
              </div>
              
              {/* Star Rating and Comment sections */}
              <div> <Label className="font-semibold text-gray-600">Performance Rating</Label> <Stars value={rating} onChange={setRating} /> </div>
              <div> <Label htmlFor="comment-box" className="font-semibold text-gray-600">Coach Comments</Label> <Textarea id="comment-box" rows={5} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter specific feedback, observations..."/> </div>
              
              {/* Status Message Display */}
              {msg.text && (
                <div className={`flex items-center gap-3 p-3 rounded-md text-sm ${
                  msg.type === 'success' ? 'bg-green-100 text-green-800' :
                  msg.type === 'info' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {msg.type === 'success' ? <FaCheckCircle/> : msg.type === 'info' ? <MdInfoOutline/> : <MdErrorOutline/>}
                  <span>{msg.text}</span>
                </div>
              )}
              
              {/* Dynamic Submit/Update/Cancel Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-6">
                {editing ? (
                  <>
                    <Button type="submit" disabled={busy} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-transform hover:scale-105">
                      {busy ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1 transition-transform hover:scale-105">
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <Button type="submit" disabled={busy} className="w-full bg-green-800 text-white hover:bg-green-900 py-3 text-lg font-semibold transition-transform hover:scale-105 transform-gpu">
                    {busy ? "Sending..." : "Send Feedback & Notify Player"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Feedback History Display Card */}
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader><CardTitle className="text-2xl font-semibold text-gray-700">Player Feedback History</CardTitle></CardHeader>
          <CardContent>
            {loadingList ? (<p className="text-center text-gray-500 py-8">Loading feedback history…</p>
            ) : items.length === 0 ? (<p className="text-center text-gray-500 py-8">No feedback has been submitted yet.</p>
            ) : ( 
              <div className="space-y-2">{items.map(fb => {
                  const name = fb.player?.member ? `${fb.player.member.firstName} ${fb.player.member.lastName}`.trim() : "Unknown Player";
                  const date = new Date(fb.createdAt).toLocaleDateString();
                  return (
                    <div key={fb._id} className="border rounded-lg p-4 flex justify-between items-start gap-4 bg-white transition-all duration-300 ease-in-out hover:shadow-md hover:border-slate-400 hover:scale-[1.02] transform-gpu">
                      <div className="flex-1 space-y-1">
                        <p><b>Player:</b> {name}</p>
                        <p className="text-sm text-gray-500"><b>Date:</b> {date}</p>
                        <p className="text-sm text-gray-500"><b>Coach:</b> {fb.coach ? `${fb.coach.firstName} ${fb.coach.lastName}` : "N/A"}</p>
                        <div className="flex items-center gap-2 mt-2"><b>Rating:</b><span className="text-yellow-400 flex">{"★".repeat(fb.rating)}<span className="text-gray-300">{"☆".repeat(5-fb.rating)}</span></span></div>
                        {fb.comment && <p className="mt-2 text-gray-600 italic">"{fb.comment}"</p>}
                      </div>
                      <div className="flex flex-col gap-2">
    {/* Update Button එකට කොළ පාට එකතු කිරීම */}
    <Button 
        size="sm" 
        onClick={() => startEdit(fb)}
        className="bg-blue-600 text-white hover:bg-blue-700"
    >
        <FaEdit className="mr-2 h-3.5 w-3.5"/>
        Update
    </Button>

    {/* Delete Button එක shadcn/ui හි 'destructive' variant එක නිසා දැනටමත් රතු පාටයි */}
    <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => remove(fb._id)}
        className="bg-red-600 text-white hover:bg-red-700"
    >
        <FaTrash className="mr-2 h-3.5 w-3.5"/>
        Delete
    </Button>
</div>
                    </div>);
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}