

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import DataTable from '../components/admin/DataTable';
import { FaArrowLeft } from 'react-icons/fa';

const DetailsListPage = () => {
    // URL . /users/plan/Student%20Membership -> type='users', filter='plan', value='Student%20Membership'
    const { type, filter, value } = useParams();

    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');

    const columns = useMemo(() => {
        // 'users' see the table columns for users
        if (type === 'users') {
            return [
                { header: 'Full Name', accessor: 'fullName' },
                { header: 'Email', accessor: 'email' },
                { header: 'Contact', accessor: 'contactNumber' },
                { header: 'Plan', accessor: 'membershipPlan' },
                { header: 'Status', accessor: 'membershipStatus' },
            ];
        }
        if (type === 'players') {
            return [
                { header: 'Full Name', accessor: 'fullName' },
                { header: 'Email', accessor: 'memberId.email' }, // populate 
                { header: 'Sport', accessor: 'sportName' },
                { header: 'Skill Level', accessor: 'skillLevel' },
            ];
        }
        return [];
    }, [type]);
    
    useEffect(() => {
        // URL ,create API endpoint based on type, filter, and value
        let endpoint = '';
        if(type && filter && value){
             // Plan and Sport සඳහා 
            endpoint = `/api/admin/${type}/${filter}/${value}`;
        } else if (type && filter) {
             // Status and  All 
             endpoint = `/api/admin/${type}/${filter}`;
        }
       
        if (!endpoint) {
          setError("Invalid page request.");
          setLoading(false);
          return;
        }

        const decodedValue = value ? decodeURIComponent(value) : filter.toUpperCase();
        setTitle(`${type.toUpperCase()}: ${decodedValue}`);

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(endpoint);
                const formattedData = data.map(item => ({
                  ...item,
                  fullName: item.firstName ? `${item.firstName} ${item.lastName}` : (item.memberId ? `${item.memberId.firstName} ${item.memberId.lastName}` : 'N/A'),
                }));
                setDataList(formattedData);
            } catch (err) {
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, filter, value]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link to="/admin-dashboard/user-management" className="inline-flex items-center mb-6 text-sm font-semibold text-gray-600 hover:text-gray-800">
                <FaArrowLeft className="mr-2" /> Back to Management
            </Link>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{title}</h1>
            {loading ? <p>Loading data...</p> : 
             error ? <p className="text-red-500">{error}</p> :
             dataList.length > 0 ? <DataTable columns={columns} data={dataList} /> : 
             <p>No records found for this category.</p>}
        </div>
    );
};
export default DetailsListPage;