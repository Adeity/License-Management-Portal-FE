"use client"
import * as React from 'react';
import Typography from '@mui/material/Typography';
import {getAllOrganizations} from "@/api/organizations";
import EnhancedTable from "@/components/PaginatedTable";
import {PaginatedResponse} from "@/types/PaginatedResponse";
import {HeadCell} from "@/types/HeadCell";
import {useEffect, useState} from "react";
import {Button} from "@mui/material";
import {router} from "next/client";
import {useRouter} from "next/navigation";
import ReplayIcon from '@mui/icons-material/Replay';
import Box from "@mui/material/Box";
import {DataGrid} from "@mui/x-data-grid";

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
    // return (null)
    const [pageNumber, setPageNumber] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [data, setData] = useState<PaginatedResponse<Organization> | null>(null)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true)
    const [refetch, setRefetch] = useState(false)
    const router = useRouter();
    useEffect(() => {
        setLoading(true)
        setError(null)
        getAllOrganizations(pageNumber, rowsPerPage).then((res) => {
            return res.json()
        })
            .then((data) => {
                const modifiedDataItems = []
                // data.items.forEach(i => {
                //     modifiedDataItems.push(
                //         {
                //             ...i,
                //             parentOrganization: getParentOrganization(i)
                //         }
                //     )
                // })
                // data.items = modifiedDataItems;
                setData(data);
                setLoading(false)
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false)
            })
    }, [pageNumber, rowsPerPage, refetch]);
    
    const handleRefetch = () => {
        setRefetch(!refetch)
    }

    return (
        <>
            {error && <Typography>Error: {error}</Typography>}
            {!error && data &&
                <div>
                    <Button variant="text" onClick={handleRefetch}><ReplayIcon /></Button>
                    <Button variant="contained" onClick={() => router.push("/organizations/create")}>Create</Button>
                    {loading ? (<Typography>Loading...</Typography>) :
                        <EnhancedTable paginatedData={data}
                                       headCells={tableHeadCells}
                                       title={"Organizations"}
                                       rowsPerPage={rowsPerPage}
                                       setPageNumber={setPageNumber}
                                       setRowsPerPage={setRowsPerPage}
                        />
                    }
                </div>
            }
        </>
    );
}
