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

export const getResellersOrganizations = async (pageNumber: number = 1, pageSize: number = 10) => {
    return await fetch(API_ROOT_URL + `/api/resellers/organizations?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}
