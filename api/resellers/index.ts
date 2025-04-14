import {API_ROOT_URL} from "@/utils/constants";

export const getResellers = async () => {
    return await fetch(API_ROOT_URL + `/api/resellers`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        })
}

