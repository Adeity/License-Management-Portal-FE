"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import {getAllOrganizationsPaginated} from "@/api/organizations";
import PaginatedTable from "@/components/PaginatedTable";
import {PaginatedResponse} from "@/types/PaginatedResponse";
import {HeadCell} from "@/types/HeadCell";
import {useEffect, useState} from "react";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";
import ReplayIcon from '@mui/icons-material/Replay';
import {PageContainer} from "@toolpad/core/PageContainer";
import {getResellersOrganizationsPaginated} from "@/api/reseller";

const tableHeadCells: readonly HeadCell[] = [
    {
        id: 'id',
        numeric: true,
        disablePadding: false,
        label: 'Id',
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
    },
    {
        id: 'organizationType',
        numeric: false,
        disablePadding: false,
        label: 'Type',
    },
    {
        id: 'parentOrganization',
        numeric: false,
        disablePadding: false,
        label: 'Parent Organization',
    },
];

const getParentOrganization = (i) => {
    return i.parentOrganization ? i.parentOrganization.name : ''
}

export default function OrganizationList() {
    const router = useRouter();
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [data, setData] = useState<PaginatedResponse<Organization> | null>(null)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    const [refetch, setRefetch] = useState(false)
    useEffect(() => {
        setLoading(true)
        setError(null)
        getResellersOrganizationsPaginated(pageNumber, rowsPerPage).then((res) => {
            return res.json()
        })
            .then((data) => {
                setData(data);
                setLoading(false)
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false)
            })
    }, [pageNumber, rowsPerPage, refetch]);

    const handleGoToCreateClick = () => {
        router.push('/reseller/organizations/create')
    }

    return (
        <PageContainer >
            {error && <Typography>Error: {error}</Typography>}
            {!error && data &&
                <div>
                    <Button variant="contained" onClick={handleGoToCreateClick}>CREATE ORGANIZATION</Button>

                        <PaginatedTable paginatedData={data}
                                        headCells={tableHeadCells}
                                        title={"Organizations"}
                                        orgRedirectPath={"/reseller/organizations"}
                                        rowsPerPage={rowsPerPage}
                                        loading={loading}
                                        setPageNumber={setPageNumber}
                                        setRowsPerPage={setRowsPerPage}
                        />
                </div>
            }
        </PageContainer>
    );
}
