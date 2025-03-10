"use client"
import * as React from "react";
import {AuthResponse, SignInPage} from "@toolpad/core";
import {AuthProvider} from "@toolpad/core/SignInPage/SignInPage";
import {loginPost} from "@/api/login";
import {useRouter} from "next/navigation";

type a = {provider: AuthProvider, formData?: any, callbackUrl?: string}
export default function HomePage() {
    const router = useRouter()
    const signIn: (provider: AuthProvider, formData: FormData) => void = async (
        provider,
        formData,
    ) => {
        return new Promise<AuthResponse>(async (resolve) => {
            const email: string = formData.get('email') as string
            const password: string = formData.get('password') as string
            await loginPost(email, password)
                .then((response) => {
                    console.log('response', response)
                    if (response.status === 401) {
                        resolve({type: 'CredentialsSignin', error: 'Invalid credentials'})
                    }
                    resolve()
                    router.push('/')
                })
                .catch((error) => {
                    console.log(error)
                    resolve({type: 'CredentialsSignin', error: "An error occurred"})
                    return error;
                });
        })
    };
    const providers = [{ id: 'credentials', name: 'Email and Password' }];

    return (
        <SignInPage
            signIn={signIn}
            providers={providers}
            slots ={{
                rememberMe: null
            }}
            slotProps={{ emailField: { autoFocus: false }, form: { noValidate: true }, rememberMe: { sx: { display: 'none' } } }}
        />
    );
}
