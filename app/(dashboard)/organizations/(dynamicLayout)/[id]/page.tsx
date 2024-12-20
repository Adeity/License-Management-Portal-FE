"use client"
import React from 'react';
import Typography from "@mui/material/Typography";
import {useActivePage} from "@toolpad/core";
import {useParams} from "next/navigation";
import {PageContainer} from "@toolpad/core/PageContainer";
import RootLayout from "@/app/layout";
import DynamicIdLayout from "@/components/DynamicIdLayout";

const OrganizationPage = () => {
    const params = useParams<{id: string}>();
    const activePage = useActivePage()

    const title = `Organization ${params.id}`;
    const path = `/${activePage?.path}/${params.id}`;
    const breadcrumbs = [...activePage.breadcrumbs, { title:params.id, path:"bla" }];

    return (
        <div>ahoooj</div>
    );
};

OrganizationPage.getLayout = function getLayout(page: any) {
    return (
        <RootLayout>
            <DynamicIdLayout>
                {page}
            </DynamicIdLayout>
        </RootLayout>
    )
}

export default OrganizationPage;