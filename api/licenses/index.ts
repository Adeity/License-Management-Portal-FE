import {API_ROOT_URL} from "@/utils/constants";

export const getLicensesByOrgId = async (id, pageIndex, pageSize) => {
    return await fetch(API_ROOT_URL + `/api/organizations/${id}/licenses?pageNumber=${pageIndex}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}

export const generateLicensePost = async (payload) => {
    return await fetch(API_ROOT_URL + `/api/licenses/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: "include"
    })
}

export const moveLicensePost = async (payload) => {
    return await fetch(API_ROOT_URL + `/api/licenses/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: "include"
    })
}
