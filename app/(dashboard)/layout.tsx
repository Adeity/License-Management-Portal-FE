"use client"
import * as React from 'react';
import {useEffect} from "react";
import {checkUserInfo} from "@/api/login";
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import {useCustomSession} from "@/context/SessionContext";
import {usePathname, useRouter} from "next/navigation";
import {CircularProgress} from "@mui/material";

export default function Layout(props: { children: React.ReactNode }) {
    const { setCustomSession } = useCustomSession();
    const [loading, setLoading] = React.useState(true);
    const pathname = usePathname();
    const router = useRouter()
    useEffect(() => {
        checkUserInfo().then(async (response) => {
            if (response.status === 401) {
                localStorage.setItem('user', '');
                setCustomSession(null)
                if (pathname !== '/login') {
                    router.push('/login')
                }
            }
            else if (response.status === 200) {
                const json = await response.json()
                const userData = {user: json}
                setCustomSession(userData)
                localStorage.setItem('user', JSON.stringify(userData));
            }
            setLoading(false)
        })
    }, []);

    return (
      <DashboardLayout>
              {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: '', height: '100vh' }}>
                      <CircularProgress  size={"5rem"}/>
                  </div>
              ) : (
                  props.children
              )}
    </DashboardLayout>
    )
}
