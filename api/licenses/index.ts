import {API_ROOT_URL} from "@/utils/constants";

export const getLicensesByOrgId = async (id, pageIndex, pageSize) => {
    return await fetch(API_ROOT_URL + `/api/licenses/organizations/${id}?pageNumber=${pageIndex}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}
