"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import {PageContainer} from "@toolpad/core/PageContainer";
import {useActivePage} from "@toolpad/core";
import {useParams} from "next/navigation";
import Box from "@mui/material/Box";
import {Button, Skeleton, Tab, Tabs, TextField} from "@mui/material";
import useOrganizationById from "@/hooks/useOrganizationById";
import {Stack} from "@mui/system";
import {useEffect, useState} from "react";
import PaginatedTable from "@/components/PaginatedTable";
import {HeadCell} from "@/types/HeadCell";
import {generateLicensePost, getLicensesByOrgId} from "@/api/licenses";
import {GenerateLicenseModal} from "@/components/GenerateLicenseModal";
import useFetchApi from "@/hooks/useFetchApi";
import {getPackageDetails} from "@/api/resellers";
import {getOrganizationById} from "@/api/organizations";

const tableHeadCells: readonly HeadCell[] = [
    {
        id: 'id',
        numeric: true,
        disablePadding: false,
        label: 'Id',
    },
    {
        id: 'expires',
        numeric: false,
        disablePadding: false,
        label: 'Expires',
    },
    {
        id: 'organization',
        numeric: false,
        disablePadding: false,
        label: 'Organization',
    },
    {
        id: 'product_Number',
        numeric: false,
        disablePadding: false,
        label: 'Product Number',
    },
    {
        id: 'serial_Number',
        numeric: false,
        disablePadding: false,
        label: 'Serial Number',
    },
    {
        id: 'status',
        numeric: false,
        disablePadding: false,
        label: 'Status',
    },
];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    loading?: boolean;
    skeleton?: React.ReactNode;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, loading, skeleton, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            data-testid={`tab-panel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{loading ? skeleton : children}</Box>}
        </div>
    );
}

const SkeletonLicenseTab = () => (
    <Box>
        <Stack spacing={1}>
            {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} variant="rectangular" height={40} />
            ))}
        </Stack>
    </Box>
);

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const SkeletonForm = () => (
    <Stack>
        {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={56} sx={{ marginY: 2 }} />
        ))}
    </Stack>
);

export default function HomePage() {
    const activePage = useActivePage();
    const params = useParams()

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [generatingError, setGeneratingError] = useState<string | null>(null);

    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const [openedTabValue, setOpenedTabValue] = React.useState(0);

    // Generate License Dialog
    const [generatingLicense, setGeneratingLicense] = React.useState(false);
    const [generatingLicenseResultSuccess, setGeneratingLicenseResultSuccess] = React.useState(false);
    const [generatingResult, setGeneratingResult] = React.useState("");

    const {data: dataOrgDetail, error: errorOrgDetail, loading: loadingOrgDetail} = useFetchApi(() => getOrganizationById(params.id))
    const {
        data: dataLicenses,
        error: errorLicenses,
        loading: loadingLicense,
        refetch: refetchLicenses
    } = useFetchApi(() => getLicensesByOrgId(params.id, pageNumber, rowsPerPage), [pageNumber, rowsPerPage]);
    const {data: dataOrgPackageDetails, error: errorOrgPackageDetails, loading: loadingOrgPackageDetails} = useFetchApi(getPackageDetails)

    useEffect(() => {
        refetchLicenses()
    },[pageNumber, rowsPerPage])

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const generateLicense = async (packageDetailsId: number, quantityOfLicenses: number = 1) => {
        setGeneratingLicense(true);
        setGeneratingError(null);
        setGeneratingResult("");

        const payload = {
            OrganizationAccountId: params.id,
            PackageDetailsId: packageDetailsId,
            QuantityOfLicenses: quantityOfLicenses
        };

        try {
            const res = await generateLicensePost(payload);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to create license");
            }

            setGeneratingResult(result.serialNumber);
        } catch (err: any) {
            setGeneratingError(err.message || "Something went wrong");
        } finally {
            setGeneratingLicense(false);
        }
    };



    const handleCloseDialog = () => {
        setDialogOpen(false);
        if (generatingResult) {
            refetchLicenses(); // <- this will refresh the license table
        }
        setGeneratingResult("");
        setGeneratingError(null);
    };

    if (errorOrgDetail) return (<div>Error: {errorOrgDetail}</div>)
    if (errorLicenses) return (<div>Error: {errorLicenses}</div>)
    const handleTabValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setOpenedTabValue(newValue);
    };

    console.log('loadingOrgDetail', loadingOrgDetail, dataOrgDetail)
    const pageTitle = loadingOrgDetail ? "Loading..." : dataOrgDetail.name;
    const breadcrumbTitle = `${params.id}`;
    const path = `/reseller/organizations/${params.id}`
    const breadcrumbs = [
        {title: "My Organizations", path: "/reseller"},
        {title: breadcrumbTitle, path}
    ];

    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>
            {(dataOrgDetail && dataOrgPackageDetails) && (
                <GenerateLicenseModal
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    packageDetails={dataOrgPackageDetails}
                    organizationAccountName={dataOrgDetail.name}
                    onSubmit={generateLicense}
                    generatingLicense={generatingLicense}
                    generatingResult={generatingResult}
                    generatingError={generatingError}
                />

            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={openedTabValue} onChange={handleTabValueChange} aria-label="basic tabs example">
                    <Tab label="Detail" {...a11yProps(0)} />
                    <Tab label="Licenses" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel
                value={openedTabValue}
                index={0}
                loading={loadingOrgDetail || loadingOrgPackageDetails}
                skeleton={<SkeletonForm />}>
                {dataOrgDetail && (
                    <Stack>
                        <TextField
                            helperText=""
                            label="Id"
                            variant="outlined"
                            defaultValue={dataOrgDetail.id}
                            sx={{ paddingY: '1rem' }}
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            helperText=""
                            label="Name"
                            variant="outlined"
                            defaultValue={dataOrgDetail.name}
                            sx={{ paddingY: '1rem' }}
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            helperText=""
                            label="Type"
                            variant="outlined"
                            defaultValue={dataOrgDetail.organizationType}
                            sx={{ paddingY: '1rem' }}
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            helperText=""
                            label="Parent Organization"
                            variant="outlined"
                            defaultValue={dataOrgDetail.parentOrganization || 'Null'}
                            sx={{ paddingY: '1rem' }}
                            slotProps={{ input: { readOnly: true } }}
                        />
                    </Stack>
                )}
            </CustomTabPanel>

            <CustomTabPanel
                value={openedTabValue}
                index={1}
                loading={false}
                skeleton={<SkeletonLicenseTab />}>
                {loadingOrgDetail || loadingOrgPackageDetails ?
                    <Skeleton variant="rectangular" width={180} height={40} sx={{ mb: 2 }} />
                    : (
                    <Button
                        variant={'contained'}
                        onClick={() => setDialogOpen(true)}
                        sx={{ marginBottom: 1 }}>
                        Create new license
                    </Button>
                )}
                <PaginatedTable
                    paginatedData={dataLicenses}
                    loading={loadingLicense}
                    headCells={tableHeadCells}
                    title={'Licenses'}
                    rowsPerPage={rowsPerPage}
                    orgRedirectPath={`/reseller/organizations/${params.id}/licenses`}
                    setPageNumber={setPageNumber}
                    setRowsPerPage={setRowsPerPage}
                />
            </CustomTabPanel>

        </PageContainer>
    );
}
