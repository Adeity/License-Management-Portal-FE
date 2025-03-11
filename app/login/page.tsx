"use client"
import * as React from "react";
import { AuthResponse, SignInPage} from "@toolpad/core";
import {AuthProvider} from "@toolpad/core/SignInPage/SignInPage";
import {loginPost} from "@/api/login";
import {useRouter} from "next/navigation";
import {useCustomSession} from "@/context/SessionContext";

export default function HomePage() {
    const router = useRouter()
    const { setCustomSession } = useCustomSession();
    const providers = [{ id: 'credentials', name: 'Email and Password' }];
    const signIn: (provider: AuthProvider, formData: FormData) => void = async (
        provider,
        formData,
    ) => {
        return new Promise<AuthResponse>(async (resolve) => {
            const email: string = formData.get('email') as string
            const password: string = formData.get('password') as string
            await loginPost(email, password)
                .then(async (response) => {
                    if (response.status === 401) {
                        resolve({type: 'CredentialsSignin', error: 'Invalid credentials'})
                    }
                    if (response.status === 200) {
                        const json = await response.json();
                        const userData = {user: json}
                        localStorage.setItem('user', JSON.stringify(userData));
                        setCustomSession(userData)
                        resolve()
                        router.push('/')
                    }
                })
                .catch((error) => {
                    resolve({type: 'CredentialsSignin', error: "An error occurred"})
                    return error;
                });
        })
    };
    return (
        <>
            <SignInPage
                signIn={signIn}
                providers={providers}
                slots ={{
                    rememberMe: null,
                }}
                slotProps={{ emailField: { autoFocus: false }, form: { noValidate: true }, rememberMe: { sx: { display: 'none' } } }}
            />
        </>
    );
}
