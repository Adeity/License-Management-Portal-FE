"use client"

import useOrganizationById from "@/hooks/useOrganizationById";
import { useRouter, useParams } from "next/navigation";
import {
    Typography,
    Button,
    TextField,
    Box,
    Stack,
    Skeleton,
    Grid,
    Tabs,
    Tab,
} from "@mui/material";
import * as React from "react";
import { deleteOrganization, restoreOrganization } from "@/api/organizations";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useActivePage } from "@toolpad/core";
import PaginatedTable from "@/components/PaginatedTable";
import {HeadCell} from "@/types/HeadCell"; // Adjust path if needed

// Define head cells for package details table
const packageDetailsHeadCells: readonly HeadCell[] = [
    {
        id: 'packageDetailId',
        numeric: false,
        disablePadding: false,
        label: 'ID',
    },
    {
        id: 'packageDetailTitle',
        numeric: false,
        disablePadding: false,
        label: 'Package',
    },
    {
        id: 'serialNumbersCount',
        numeric: true,
        disablePadding: false,
        label: 'License Count',
    },
];


export default function HomePage() {
    const params = useParams();
    const router = useRouter();
    const activePage = useActivePage();
    const { data, error, loading, refetch } = useOrganizationById(params.id);
    const [tab, setTab] = React.useState(0);

    const handleDeleteClick = async () => {
        const res = await deleteOrganization(params.id);
        if (res.ok) refetch();
    };

    const handleRestoreClick = async () => {
        const res = await restoreOrganization(params.id);
        if (res.ok) refetch();
    };

    const breadcrumbs = [
        ...activePage.breadcrumbs,
        { title: `${params.id}`, path: `${activePage.path}/${params.id}` },
    ];

    const renderField = (label: string, value?: string | number | null) => (
        <TextField
            fullWidth
            label={label}
            variant="outlined"
            defaultValue={value ?? ""}
            InputProps={{ readOnly: true }}
        />
    );

    const renderGeneralInfo = () => (
        <>
            {data.isDeleted && (
                <Typography variant="h5" color="error">
                    This organization has been deleted
                </Typography>
            )}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    {renderField("Id", data.id)}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Name", data.name)}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Type", data.organizationType)}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Parent Organization", data.parentOrganization || "Null")}
                </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={2}>
                <Button
                    variant="contained"
                    onClick={() => router.push(`/organizations/${params.id}/edit`)}
                >
                    Edit
                </Button>
                {data.isDeleted ? (
                    <Button variant="contained" color="success" onClick={handleRestoreClick}>
                        Restore
                    </Button>
                ) : (
                    <Button variant="contained" color="error" onClick={handleDeleteClick}>
                        Delete
                    </Button>
                )}
            </Box>
        </>
    );

    const renderPackageDetails = () => {
        const paginatedPackageData = {
            items: data.organizationPackageDetails ?? [],
            totalCount: data.organizationPackageDetails?.length ?? 0,
        };

        return (
            <Box mt={2}>
                <PaginatedTable
                    title="Package Details"
                    paginatedData={paginatedPackageData}
                    headCells={packageDetailsHeadCells}
                    clickable={false}
                    loading={false}
                    rowsPerPage={5}
                    setPageNumber={() => {}}
                    setRowsPerPage={() => {}}
                    rowClickable={false}
                    disablePagination={true}
                />
            </Box>
        );
    };



    return (
        <PageContainer breadcrumbs={breadcrumbs} title={data?.name ?? "Organization details"}>
            <Stack spacing={3}>
                {loading ? (
                    <>
                        <Skeleton variant="text" width="60%" height={50} />
                        <Grid container spacing={2}>
                            {[...Array(4)].map((_, i) => (
                                <Grid item xs={12} md={6} key={i}>
                                    <Skeleton variant="rectangular" height={70} />
                                </Grid>
                            ))}
                        </Grid>
                        <Box display="flex" gap={2}>
                            <Skeleton variant="rectangular" width={100} height={36} />
                            <Skeleton variant="rectangular" width={100} height={36} />
                        </Box>
                    </>
                ) : error ? (
                    <Typography color="error">Error: {error}</Typography>
                ) : (
                    <>
                        {data.organizationTypeId === 1 ? (
                            <>
                                <Tabs value={tab} onChange={(_, val) => setTab(val)}>
                                    <Tab label="General" />
                                    <Tab label="Package Details" />
                                </Tabs>
                                <Box pt={2}>
                                    {tab === 0 && renderGeneralInfo()}
                                    {tab === 1 && renderPackageDetails()}
                                </Box>
                            </>
                        ) : (
                            renderGeneralInfo()
                        )}
                    </>
                )}
            </Stack>
        </PageContainer>
    );
}
