import {useEffect, useState} from "react";
import {getAvailableOrganizationTypes} from "@/api/organizationTypes";

const useAvailableOrganizationTypes = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getAvailableOrganizationTypes();
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
    }, []);

    return { data, error, loading };
};

export default useAvailableOrganizationTypes;