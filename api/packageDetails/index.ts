import {API_ROOT_URL} from "@/utils/constants";

export const getAllPackageDetails = async () => {
    return await fetch(API_ROOT_URL + `/api/package-details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}
