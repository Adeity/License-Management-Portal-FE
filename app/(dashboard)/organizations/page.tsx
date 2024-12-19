"use client"
import * as React from 'react';
import {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import {LocalStorage} from '@/utils/localStorage'
import {API_ROOT_URL} from "@/utils/constants";
import {getOrganizations, getOrganizationsMock} from '@/api/organizations';
import {PaginatedResponse} from "@/types/PaginatedResponse";


export default function Organization() {
    const [data, setData] = useState<PaginatedResponse<Organization> | null>(null)
    useEffect(() => {
        getOrganizations().then((res) => {
            return res.json()
        })
        .then((data) => {
            setData(data);
        })
    }, []);

    return (
        <>
          {data &&
            <div>
                {data.results.map((item, index) => {
                    return (
                        <div key={index}>
                            <Typography>name: {item.name}</Typography>
                            <Typography>role: {item.role}</Typography>
                            <Typography>organization: {item.organization}</Typography>
                            <Typography>phone number: {item.phoneNumber}</Typography>
                            <Typography>email: {item.email}</Typography>
                            <Typography>status: {item.status}</Typography>
                            <br/>
                        </div>
                    )
                })}
            </div>
          }
        </>
  );
}
