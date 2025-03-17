"use client"
import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import type {Navigation} from '@toolpad/core/AppProvider';
import {Authentication, NavigationItem} from "@toolpad/core";
import {logout} from "@/api/login";
import {SessionProvider, useCustomSession} from "@/context/SessionContext";
import {useRouter} from "next/navigation";
import {PageContainer} from "@toolpad/core/PageContainer";
import { Crud, DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import {DashboardLayout} from "@toolpad/core/DashboardLayout";
import {Organization, organizationsDataSource} from "@/datasource/organizations/organizations";

// New attribute to add
interface ExtendedAttribute {
  roles?: string[];
}
// Extended NavigationItem type
type ExtendedNavigationItem = NavigationItem & ExtendedAttribute;

// Redefine Navigation to use ExtendedNavigationItem
type ExtendedNavigation = ExtendedNavigationItem[];

interface RoleNavigation extends Navigation {
    roles?: string[];
}

const NAVIGATION: ExtendedNavigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardIcon />,
    roles: ['Admin']
  },
  {
    segment: 'organizations',
    title: 'Organizations',
    pattern: 'organizations/:id*',
    icon: <DashboardIcon />,
    roles: ['Admin']
  },
  {
    segment: 'reseller',
    title: 'My Organizations',
    kind: undefined,
    icon: <BusinessIcon />,
    roles: ['Reseller']
  },
  // {
  //   segment: 'organizations',
  //   title: 'Organizations',
  //   icon: <DashboardIcon />,
  //   pattern: 'organizations{/:organizationId}*',
  //   roles: ['Admin', 'Reseller', 'Customer']
  // },
  // {
  //   segment: 'customerOrganizations',
  //   title: 'Customer Organizations',
  //   icon: <ShoppingCartIcon />,
  //   roles: ['Admin', 'Reseller']
  // },
  // {
  //   segment: 'organizations',
  //   pattern: 'organizations{/:id}*',
  //   title: 'Organizations',
  //   icon: <BusinessIcon />,
  //   roles: ['Admin']
  // },
  // {
  //   segment: 'customer',
  //   pattern: 'customer{/:id}*',
  //   title: 'Customer',
  //   icon: <BusinessIcon />,
  //   roles: ['Admin', 'Reseller', 'Customer']
  // },
];

const BRANDING = {
  title: 'License Management Portal',
  logo: <span className={'hide-icon'}></span>,
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>
        
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <SessionProvider>
              <MyAppProvider>
                {props.children}
              </MyAppProvider>
            </SessionProvider>
          </AppRouterCacheProvider>
        
      </body>
    </html>
  );
}

export function MyAppProvider (props: { children: React.ReactNode }) {
  const { customSession, setCustomSession } = useCustomSession();
  const router = useRouter()
  const authentication: Authentication = {
    signIn: () => {
    },
    signOut: async () => {
      await logout()
      localStorage.removeItem('user')
      setCustomSession(null);
      router.push('/login')
    },
  }

  const NAVIGATION_BASED_ON_USER_ROLE = NAVIGATION.filter((item) => {
    if (item.roles && customSession?.user?.role) {
      return item.roles.includes(customSession?.user?.role as string)
    }
    return false;
  })

  return (
      <AppProvider
          navigation={NAVIGATION_BASED_ON_USER_ROLE}
          branding={BRANDING}
          authentication={authentication}
          session={customSession}
      >
            {props.children}
      </AppProvider>
      )
}

