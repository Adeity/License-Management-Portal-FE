"use client"
import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import {useEffect} from "react";
import {checkUserInfo} from "@/api/login";
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import {useCustomSession} from "@/context/SessionContext";
import {useRouter} from "next/navigation";

export default function Layout(props: { children: React.ReactNode }) {
const { setCustomSession } = useCustomSession();
const router = useRouter();
useEffect(() => {
    checkUserInfo().then(async (response) => {
        console.log('response', response)
        if (response.status === 401) {
            localStorage.setItem('user', '');
            router.push('/login')
        }
        else if (response.status === 200) {
            const json = await response.json()
            const userData = {user: json}
            setCustomSession(userData)
            localStorage.setItem('user', JSON.stringify(userData));
        }
    })
}, []);
  return (
      <DashboardLayout>
      <PageContainer>{props.children}</PageContainer>
    </DashboardLayout>
  )
}
