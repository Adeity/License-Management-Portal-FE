import * as React from 'react';
import { PageContainer } from '@toolpad/core/PageContainer';
import {DashboardLayout} from "@toolpad/core/DashboardLayout";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <DashboardLayout >
      <PageContainer>{props.children}</PageContainer>
    </DashboardLayout>
  )
}
