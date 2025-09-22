import { Link } from 'react-router-dom';

{/* ...menu items... */}
<li>
  <Link to="/preorders" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded text-white">
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span>Pre-orders</span>
  </Link>
</li>
{/* ...existing code... */}