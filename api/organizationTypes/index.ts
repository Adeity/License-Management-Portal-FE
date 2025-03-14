import {API_ROOT_URL} from "@/utils/constants";

export const getAvailableOrganizationTypes = async () => {
    return await fetch(API_ROOT_URL + `/api/organizations/types`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}