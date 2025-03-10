"use client";

import React, { useState } from 'react';

export default function TestPage() {
    const [responseData, setResponseData] = useState('');
    const [error, setError] = useState('');

    const callEndpoint = async (endpoint) => {
        try {
            const response = await fetch(`http://localhost:5077/test/${endpoint}`, {
                method: 'GET',
                credentials: 'include' // Ensure cookies are included in the request
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.text();
            setResponseData(data);
            setError(''); // Clear any previous errors
        } catch (error) {
            setError(error.message);
            setResponseData(''); // Clear any previous data
        }
    };

    return (
        <div>
            <button onClick={() => callEndpoint('admin')}>Call Admin Endpoint</button>
            <button onClick={() => callEndpoint('reseller')}>Call Reseller Endpoint</button>
            <button onClick={() => callEndpoint('customer')}>Call Customer Endpoint</button>
            <div>
                {responseData && <p>Response: {responseData}</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            </div>
        </div>
    );
}