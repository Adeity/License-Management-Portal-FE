"use client"

import useOrganizationById from "@/hooks/useOrganizationById";
import {useRouter} from "next/navigation";
import {useParams} from "next/navigation";
import Typography from "@mui/material/Typography";
import {Button, TextField} from "@mui/material";
import * as React from "react";
import {deleteOrganization, restoreOrganization} from "@/api/organizations";
import {PageContainer} from "@toolpad/core/PageContainer";
import {useActivePage} from "@toolpad/core";

export default function HomePage() {
    const params = useParams()
    const router = useRouter();
    const activePage = useActivePage();
    
    const {data, error, loading, refetch} = useOrganizationById(params.id)

    if (loading) return (<div>Loading...</div>)
    if (error) return (<div>Error: {error}</div>)

    const handleDeleteClick = async () => {
        const res = await deleteOrganization(params.id)
        if (res.ok) {
            refetch()
        }
    }
    const handleRestoreClick = async () => {
        const res = await restoreOrganization(params.id)
        if (res.ok) {
            refetch()
        }
    }

    const isDeleted = data.isDeleted;
    const org: Organization = data

    const pageTitle = `${data.name}`
    const breadcrumbTitle = `${params.id}`;
    const path = `${activePage.path}/${params.id}`;
    const breadcrumbs = [...activePage.breadcrumbs, {title: breadcrumbTitle, path}];
    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>

            {isDeleted && <Typography variant="h4" color="error">This organization has been deleted</Typography>}
            <TextField helperText=""
                       id="outlined-basic"
                       label="Id"
                       variant="outlined"
                       defaultValue={data.id}
                       slotProps={{input: {readOnly: true}}}
            />
            <TextField helperText=""
                       id="outlined-basic"
                       label="Name"
                       variant="outlined"
                       defaultValue={data.name}
                       slotProps={{input: {readOnly: true}}}
            />

            <TextField helperText=""
                       id="outlined-basic"
                       label="Type"
                       variant="outlined"
                       defaultValue={data.organizationType}
                       slotProps={{input: {readOnly: true}}}
            />
            <TextField helperText=""
                       id="outlined-basic"
                       label="Parent Organization"
                       variant="outlined"
                       defaultValue={data.parentOrganization ? data.parentOrganization : "Null"}
                       slotProps={{input: {readOnly: true}}}
            />

            <Button variant="contained" onClick={() => router.push(`/organizations/${params.id}/edit`)}>Edit</Button>
            {
                isDeleted ? <Button variant="contained" color="success" onClick={handleRestoreClick}>Restore</Button>
                    :
                    <Button variant="contained" color="error" onClick={handleDeleteClick}>Delete</Button>
            }
        </PageContainer>
    )
}
