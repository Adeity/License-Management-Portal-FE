"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import {PageContainer} from "@toolpad/core/PageContainer";
import {useActivePage} from "@toolpad/core";
import {useParams} from "next/navigation";
import Box from "@mui/material/Box";
import {Tab, Tabs, TextField} from "@mui/material";
import useOrganizationById from "@/hooks/useOrganizationById";
import {Stack} from "@mui/system";

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

    const [value, setValue] = React.useState(0);
    const {data: dataOrgDetail, error: errorOrgDetail, loading: loadingOrgDetail, refetch} = useOrganizationById(params.id)

    if (loadingOrgDetail) return (<div>Loading...</div>)
    if (errorOrgDetail) return (<div>Error: {errorOrgDetail}</div>)
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const pageTitle = `Detail org`
    const breadcrumbTitle = `${params.id}`;
    // const path = `${activePage.path}/${params.id}`;
    const path = `/reseller/organizations/${params.id}`
    const breadcrumbs = [
        {title: "My Organizations", path: "/reseller"},
        {title: breadcrumbTitle, path}
    ];

    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Detail" {...a11yProps(0)} />
                    <Tab label="Licenses" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
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
            <CustomTabPanel value={value} index={1}>
                Licenses
            </CustomTabPanel>
        </PageContainer>
    );
}
