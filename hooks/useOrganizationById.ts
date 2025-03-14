import {useEffect, useState} from "react";
import {getOrganizationById} from "@/api/organizations";

const getResellersHook = (id) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refetchVar, setRefetchVar] = useState(true)
    
    const refetch = () => {
        setRefetchVar(!refetchVar)
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getOrganizationById(id);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refetchVar]);

    return { data, error, loading, refetch };
};

export default getResellersHook;
