import {API_ROOT_URL} from "@/utils/constants";

export const getResellersOrganizationsPaginated = async (pageNumber: number = 1, pageSize: number = 10) => {
    return await fetch(API_ROOT_URL + `/api/reseller/organizations?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}

export const getResellersOrganizations = async () => {
    return await fetch(API_ROOT_URL + `/api/reseller/organizations/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}

export const getPackageDetails = async () => {
    return await fetch(API_ROOT_URL + `/api/reseller/package-details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}

export const getLoggedResellerInfo = async () => {
    return await fetch(API_ROOT_URL + `/api/reseller`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}
