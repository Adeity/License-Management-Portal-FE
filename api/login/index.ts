import {API_ROOT_URL} from "@/utils/constants";

export const loginPost = async (email: string, password: string) => {
    return await fetch(API_ROOT_URL + `/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
        credentials: "include"
    })
}

export const checkUserInfo = async () => {
    return await fetch(API_ROOT_URL + `/api/auth/user-info`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}

export const logout = async () => {
    return await fetch(API_ROOT_URL + `/api/auth/logout`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}
