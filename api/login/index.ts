import {API_ROOT_URL} from "@/utils/constants";

export const loginPost = async (email: string, password: string) => {
    return await fetch(API_ROOT_URL + `/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
        credentials: "include"
    })
}