"use client"
import * as React from 'react';
import {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import {LocalStorage} from '@/utils/localStorage'
import {API_ROOT_URL} from "@/utils/constants";
import {getOrganizations, getOrganizationsMock} from '@/api/organizations';
import {PaginatedResponse} from "@/types/PaginatedResponse";
import EnhancedTable from "@/components/MyAwesomeTable";
import {HeadCell} from "@/types/HeadCell";

const tableHeadCells: readonly HeadCell[] = [
    {
        id: 'email',
        numeric: false,
        disablePadding: false,
        label: 'Email',
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
    },
    {
        id: 'organization',
        numeric: false,
        disablePadding: false,
        label: 'Organization',
    },
    {
        id: 'id',
        numeric: true,
        disablePadding: false,
        label: 'Id',
    },
    {
        id: 'phoneNumber',
        numeric: false,
        disablePadding: false,
        label: 'Phone number',
    },
    {
        id: 'role',
        numeric: false,
        disablePadding: false,
        label: 'Role',
    },
    {
        id: 'status',
        numeric: false,
        disablePadding: false,
        label: 'Status',
    },
];

export default function Organization() {
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);
    const [data, setData] = useState<PaginatedResponse<Organization> | null>(null)
    useEffect(() => {
        getOrganizations(pageNumber, rowsPerPage).then((res) => {
            return res.json()
        })
        .then((data) => {
            setData(data);
        })
    }, [pageNumber, rowsPerPage]);

    return (
        <>
          {data &&
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
