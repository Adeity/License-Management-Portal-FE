"use client"
import * as React from 'react';
import {useActivePage} from "@toolpad/core";
import {useParams} from "next/navigation";
import Box from "@mui/material/Box";
import {Button, Skeleton, Tab, Tabs, TextField} from "@mui/material";
import {Stack} from "@mui/system";
import {HeadCell} from "@/types/HeadCell";
import {PageContainer} from "@toolpad/core/PageContainer";

export default function HomePage() {
    const activePage = useActivePage();
    const params = useParams()


    // console.log('loadingOrgDetail', loadingOrgDetail, dataOrgDetail)
    const pageTitle = 'License detail';
    const breadcrumbTitle = `${params.licenseId}`;
    const path = `/reseller/organizations/${params.licenseId}`
    const breadcrumbs = [
        {title: "My Organizations", path: "/reseller"},
        {title: `${params.id}`, path: `/reseller/organizations/${params.id}`},
        {title: `License ${params.licenseId}`, path: `/reseller/organizations/${params.id}/licenses/${params.licenseId}`}
    ];

    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>
            <h2>not implemented license detail</h2>
        </PageContainer>
    );
}
