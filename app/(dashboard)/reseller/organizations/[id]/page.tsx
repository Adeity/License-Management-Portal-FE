"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import {PageContainer} from "@toolpad/core/PageContainer";
import {useActivePage} from "@toolpad/core";
import {useParams} from "next/navigation";
import Box from "@mui/material/Box";
import {Button, Tab, Tabs, TextField} from "@mui/material";
import useOrganizationById from "@/hooks/useOrganizationById";
import {Stack} from "@mui/system";
import {useEffect, useState} from "react";
import EnhancedTable from "@/components/PaginatedTable";
import {HeadCell} from "@/types/HeadCell";
import {getLicensesByOrgId} from "@/api/licenses";
import {SimpleDialog} from "@/components/GenerateLicenseModal";
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
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


export default function HomePage() {
    const activePage = useActivePage();
    const params = useParams()

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const [openedTabValue, setOpenedTabValue] = React.useState(0);
    const {data: dataOrgDetail, error: errorOrgDetail, loading: loadingOrgDetail, refetch: refetchOrgDetail} = useFetchApi(() => getOrganizationById(params.id))
    const {data: dataLicenses, error: errorLicenses, loading: loadingLicense, refetch: refetchLicenses} = useFetchApi(() => getLicensesByOrgId(params.id, pageNumber, rowsPerPage))
    const {data: dataOrgPackageDetails, error: errorOrgPackageDetails, loading: loadingOrgPackageDetails, refetch: refetchOrgPackageDetails} = useFetchApi(getPackageDetails())

    useEffect(() => {
        refetchLicenses()
    },[pageNumber, rowsPerPage])

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        // setSelectedValue(value);
    };

    if (loadingOrgDetail) return (<div>Loading...</div>)
    if (errorOrgDetail) return (<div>Error: {errorOrgDetail}</div>)
    if (errorLicenses) return (<div>Error: {errorLicenses}</div>)
    const handleTabValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setOpenedTabValue(newValue);
    };

    const pageTitle = `Detail org`
    const breadcrumbTitle = `${params.id}`;
    const path = `/reseller/organizations/${params.id}`
    const breadcrumbs = [
        {title: "My Organizations", path: "/reseller"},
        {title: breadcrumbTitle, path}
    ];

    console.log('data licenses:', dataLicenses)
    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>

            <SimpleDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
            ></SimpleDialog>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={openedTabValue} onChange={handleTabValueChange} aria-label="basic tabs example">
                    <Tab label="Detail" {...a11yProps(0)} />
                    <Tab label="Licenses" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={openedTabValue} index={0}>
                <Stack>
                    <TextField helperText=""
                               id="outlined-basic"
                               label="Id"
                               variant="outlined"
                               defaultValue={dataOrgDetail.id}
                               sx={{paddingTop: '1rem', paddingBottom: '1rem'}}
                               slotProps={{input: {readOnly: true}}}
                    />
                    <TextField helperText=""
                               id="outlined-basic"
                               label="Name"
                               variant="outlined"
                               defaultValue={dataOrgDetail.name}
                               sx={{paddingTop: '1rem', paddingBottom: '1rem'}}
                               slotProps={{input: {readOnly: true}}}
                    />

                    <TextField helperText=""
                               id="outlined-basic"
                               label="Type"
                               variant="outlined"
                               defaultValue={dataOrgDetail.organizationType}
                               sx={{paddingTop: '1rem', paddingBottom: '1rem'}}
                               slotProps={{input: {readOnly: true}}}
                    />
                    <TextField helperText=""
                               id="outlined-basic"
                               label="Parent Organization"
                               variant="outlined"
                               sx={{paddingTop: '1rem', paddingBottom: '1rem'}}
                               defaultValue={dataOrgDetail.parentOrganization ? dataOrgDetail.parentOrganization : "Null"}
                               slotProps={{input: {readOnly: true}}}
                    />
                </Stack>
            </CustomTabPanel>
            <CustomTabPanel value={openedTabValue} index={1}>
                <Button onClick={() => setDialogOpen(true)} sx={{marginBottom: 1}}>Create new license</Button>
                <EnhancedTable paginatedData={dataLicenses}
                               headCells={tableHeadCells}
                               title={"Licenses"}
                               rowsPerPage={rowsPerPage}
                               orgRedirectPath={"/licenses"}
                               setPageNumber={setPageNumber}
                               setRowsPerPage={setRowsPerPage}
                               />
            </CustomTabPanel>
        </PageContainer>
    );
}
