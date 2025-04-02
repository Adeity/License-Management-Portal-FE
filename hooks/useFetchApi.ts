// hooks/useFetchApi.ts

import { useEffect, useState } from "react";

const useFetchApi = (fetchFn: () => Promise<Response>, dependencies: any[] = []) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refetchToken, setRefetchToken] = useState(0); // force reload when manually refetching

    const refetch = () => {
        setRefetchToken(prev => prev + 1);
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchFn();
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (error: any) {
                setError(error.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [...dependencies, refetchToken]); // will refetch when deps or manual refetch changes

    return { data, error, loading, refetch };
};

export default useFetchApi;
