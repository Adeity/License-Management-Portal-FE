import {API_ROOT_URL} from "@/utils/constants";


export const generateLicensePost = async (payload) => {
    return await fetch(API_ROOT_URL + `/api/license-actions/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: "include"
    })
}

export const moveLicensePost = async (payload) => {
    return await fetch(API_ROOT_URL + `/api/license-actions/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: "include"
    })
}
