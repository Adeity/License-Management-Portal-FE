"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import {getAllOrganizations} from "@/api/organizations";
import EnhancedTable from "@/components/PaginatedTable";
import {PaginatedResponse} from "@/types/PaginatedResponse";
import {HeadCell} from "@/types/HeadCell";
import {useEffect, useState} from "react";


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
];

export default function OrganizationList() {
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [data, setData] = useState<PaginatedResponse<Organization> | null>(null)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        getAllOrganizations(pageNumber, rowsPerPage).then((res) => {
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
    }, [pageNumber, rowsPerPage]);

    console.log('pgae number:', pageNumber)
    console.log('rows per page:', rowsPerPage)
    return (
        <>
            {loading && <Typography>Loading...</Typography>}
            {error && <Typography>Error: {error}</Typography>}
            {!error && data &&
                <div>
                    <EnhancedTable paginatedData={data}
                                   headCells={tableHeadCells}
                                   title={"Organizations"}
                                   rowsPerPage={rowsPerPage}
                                   setPageNumber={setPageNumber}
                                   setRowsPerPage={setRowsPerPage}
                    />
                </div>
            }
        </>
    );
}
