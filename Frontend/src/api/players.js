// File: frontend/src/api/players.js (CORRECT AND SAFE VERSION)

// ★★★ 1. ඔබගේ මධ්‍යගත 'api.js' ගොනුව import කිරීම ★★★
// (මෙහි ඇති Interceptor එක මගින් token එක ස්වයංක්‍රීයව එකතු කරයි)
import api from './api';

/**
 * Coaches/Admins සඳහා dropdown menus වලට අවශ්‍ය ක්‍රීඩකයින්ගේ සරල list එකක් ගෙන එයි.
 * මෙය GET /api/players/simple යන backend endpoint එකට කතා කරයි.
 */
export const getSimplePlayerListForCoach = async () => {
  try {
    // ★★★ 2. මධ්‍යගත 'api' instance එක භාවිතා කිරීම ★★★
    // (Token එක manually එකතු කිරීමට අවශ්‍ය නැත, Interceptor එක එය බලාගනී)
    const { data } = await api.get('/players/simple');
    return data; // Backend එකෙන් එවන player array එක කෙලින්ම return කරයි

  } catch (error) {
    // ★★★ 3. දෝෂයක් ඇති වුවහොත්, එය console එකේ පෙන්වා, component එකට දැනුම් දීම ★★★
    console.error("API Error - getSimplePlayerListForCoach:", error);
    // දෝෂය නැවත යැවීම මගින්, FeedbacksPage component එකට "Failed to load players" වැනි පණිවිඩයක් පෙන්විය හැක.
    throw error; 
  }
};