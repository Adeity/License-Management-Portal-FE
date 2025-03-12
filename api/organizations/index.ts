import {API_ROOT_URL} from "@/utils/constants";
import {LocalStorage} from '@/utils/localStorage'

export const getOrganizationByReseller = async (pageNumber: number = 1, pageSize: number = 10) => {
    return await fetch(API_ROOT_URL + `/api/organizations/3?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        })
}

export const getAllOrganizations = async (pageNumber: number = 1, pageSize: number = 10) => {
    return await fetch(API_ROOT_URL + `/api/organizations?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    })
}

export const getOrganizationsMock = (a, b): Promise<any> => {
    return new Promise ((resolve) => {
            const mockData = `[
            {
            "OrganizationId": 212,
            "Name": "Yi Shen",
            "Role": "Other",
            "OrganizationAccountId": null,
            "Organization": "China Regionall",
            "PhoneNumber": "86-13861768520",
            "Email": "yishen@eaton.com",
            "Status": "Active"
            },
            {
            "OrganizationId": 227,
            "Name": "FN China 1 LN China1",
            "Role": "Manager",
            "OrganizationAccountId": null,
            "Organization": "Test Chinese Organization 1",
            "PhoneNumber": "86-123456789",
            "Email": "china1@gmail.com",
            "Status": "Active"
            },
            {
            "OrganizationId": 228,
            "Name": "FN China 2 LN China 2",
            "Role": "Manager",
            "OrganizationAccountId": null,
            "Organization": "Test Chinese Organization 2",
            "PhoneNumber": "86-123456789",
            "Email": "china2@gmail.com",
            "Status": "Active"
            },
            {
            "OrganizationId": 224,
            "Name": "First Name Test 1 Last Name Test 1",
            "Role": "Other",
            "OrganizationAccountId": "null",
            "Organization": "Test Organization 1 Diego China Reseller Change 1",
            "PhoneNumber": "1-345333444",
            "Email": "test1@gmail.com",
            "Status": "Active"
            },
            {
            "OrganizationId": 213,
            "Name": "Without AccountID",
            "Role": "Fleet manager",
            "OrganizationAccountId": null,
            "Organization": "Test_Organization_Without_AccountID",
            "PhoneNumber": "1-123456789",
            "Email": "without_account@gmail.com",
            "Status": "Active"
            },
            {
            "OrganizationId": 214,
            "Name": "With Organization ID",
            "Role": "Manager",
            "OrganizationAccountId": "WITH-ID",
            "Organization": "With Organization ID",
            "PhoneNumber": "1-123456789",
            "Email": "with_organizationID@gmail.com",
            "Status": "Active"
            }
        ]`
        resolve(mockData)
    })
}