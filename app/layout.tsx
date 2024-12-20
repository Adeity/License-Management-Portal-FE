import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import type { Navigation } from '@toolpad/core/AppProvider';

import theme from '../theme';
import {DashboardLayout} from "@toolpad/core/DashboardLayout";

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: '',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'organizations',
    pattern: 'organizations{/:id}*',
    title: 'Organizations',
    icon: <BusinessIcon />,
  },
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
            <AppProvider
              navigation={NAVIGATION}
              branding={BRANDING}
              theme={theme}
            >
              <DashboardLayout >

                {props.children}
              </DashboardLayout>
            </AppProvider>
          </AppRouterCacheProvider>
        
      </body>
    </html>
  );
}
