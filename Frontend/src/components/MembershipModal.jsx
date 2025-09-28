

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/MemberAuthContext'; 

const MembershipModal = ({ plan, onClose, onSubmit }) => {
    // get user from AuthContext
    const { user } = useContext(AuthContext); 
    
    // user object eke id, firstName, lastName athi baawa upkalpanaya kirima
    const [fullName, setFullName] = useState(`${user.firstName} ${user.lastName}` || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            userId: user.id, // Login userid
            userName: fullName,
            planName: plan.name,
            price: plan.price
        };
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">Confirm Your Membership</h2>
                <p className="mb-6">You are about to subscribe to the <strong className="text-blue-600">{plan.name}</strong>.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Club ID</label>
                        <input 
                            type="text" 
                            value={user.id || 'Not Logged In'}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                         <p className="text-2xl font-bold">{plan.price} <span className="text-lg font-normal">{plan.period}</span></p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">
                            Submit Now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MembershipModal;