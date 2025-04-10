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
import {PageContainer} from "@toolpad/core/PageContainer";

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

export default function OrganizationList() {
    // return (null)
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [data, setData] = useState<PaginatedResponse<Organization> | null>(null)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    const router = useRouter();
    useEffect(() => {
        setLoading(true)
        setError(null)
        getAllOrganizationsPaginated(pageNumber, rowsPerPage).then((res) => {
            return res.json()
        })
            .then((data) => {
                const modifiedDataItems = []
                setData(data);
                setLoading(false)
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false)
            })
    }, [pageNumber, rowsPerPage]);

    return (
            <PageContainer >
                {error && <Typography>Error: {error}</Typography>}
                    <div>
                        <Button variant="contained" onClick={() => router.push("/organizations/create")} sx={{marginBottom: 2}}>Create</Button>
                            <PaginatedTable paginatedData={data}
                                            headCells={tableHeadCells}
                                            title={"Organizations"}
                                            rowsPerPage={rowsPerPage}
                                            loading={loading}
                                            orgRedirectPath={"/organizations"}
                                            setPageNumber={setPageNumber}
                                            setRowsPerPage={setRowsPerPage}
                            />
                    </div>
            </PageContainer>
    );
}
