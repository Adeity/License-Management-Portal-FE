import React from 'react';
import {useParams} from "next/navigation";
import {useActivePage} from "@toolpad/core";
import {PageContainer} from "@toolpad/core/PageContainer";

export default function DynamicIdLayout(props: { children: React.ReactNode }) {
    const params = useParams<{id: string}>();
    const activePage = useActivePage()

    const title = `Organization ${params.id}`;
    const path = `/${activePage?.path}/${params.id}`;
    const breadcrumbs = [...activePage.breadcrumbs, { title:params.id, path:"bla" }];

    return (
        <PageContainer title = {title} breadcrumbs={breadcrumbs}>
            dukaz ze to je dynamicidlayout
            {props.children}
        </PageContainer>
    );
};
