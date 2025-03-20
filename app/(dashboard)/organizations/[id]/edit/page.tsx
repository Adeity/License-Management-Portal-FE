"use client"
import Typography from "@mui/material/Typography";
import * as React from "react";
import {Button, MenuItem, TextField} from "@mui/material";
import {useParams, useRouter} from "next/navigation";
import useOrganizationById from "@/hooks/useOrganizationById";
import useAvailableOrganizationTypes from "@/hooks/availableOrganizationTypesHook";
import getResellersHook from "@/hooks/getResellersHook";
import {useState} from "react";
import Box from "@mui/material/Box";
import {createOrganization, updateOrganization} from "@/api/organizations";
import {useActivePage} from "@toolpad/core";
import {PageContainer} from "@toolpad/core/PageContainer";

export default function HomePage() {
    const params = useParams()
    const router = useRouter();
    const activePage = useActivePage();
    
    const {data, error, loading} = useOrganizationById(params.id)
    const {data: availableOrganizationTypes, loading: availableOrgTypesloading} = useAvailableOrganizationTypes()
    const {data: resellers, loading: resellersLoading} = getResellersHook()
    
    const [orgType, setOrgType] = useState(data ? data.organizationType : '')
    const [orgTypeValidationError, setOrgTypeValidationError] = useState('')

    const [name, setName] = useState("")
    const [nameValidationError, setNameValidationError] = useState('')

    const [parentOrganization, setParentOrganization] = useState('')
    const [parentOrganizationValidationError, setParentOrganizationValidationError] = useState('')

    const creatingOrganizationTypeOrganization = orgType === "Organization"
    
    React.useEffect(() => {
        if (data) {
            setName(data.name)
            setParentOrganization(data.parentOrganization || '')
            setOrgType(data.organizationType)
        }
        
    }, [data])

    const onChangeName = (e) => {
        setName(e.target.value)
    }
    const onChangeType = (e) => {
        setOrgType(e.target.value)
        if (orgType === "Reseller") {
            setParentOrganization('')
        }
    }
    const onChangeParentOrganization = (e) => {
        setParentOrganization(e.target.value)
    }
    
    if (loading || resellersLoading || availableOrgTypesloading) return (<div>Loading...</div>)
    if (error) return (<div>Error: {error}</div>)
    
    const resellersThatAreNotSelf = resellers.filter(e => {
        return e.id !== data.id
    })

    const clearValidations = () => {
        setNameValidationError('')
        setOrgTypeValidationError('')
        setParentOrganizationValidationError('')
    }
    const findValidationErrors = () => {
        clearValidations()
        let foundError = false;
        if (orgType === "Organization"){
            if (parentOrganization === "") {
                setParentOrganizationValidationError("Parent organization is required")
                foundError = true;
            }
        }
        if (name.length < 3) {
            setNameValidationError("Name must be at least 3 characters long")
            foundError = true;
        }
        if (name === "") {
            setNameValidationError("Name is required")
            foundError = true;
        }
        return foundError
    }
    
    const onSubmit = async () => {
        if (findValidationErrors()) {
            return;
        }

        const orgTypeId = availableOrganizationTypes.find(e => {
            return e.name === orgType
        }).id
        const buildOrgInputdata = () => {
            return {
                id: params.id,
                name: name,
                organizationTypeId: orgTypeId,
                parentOrganizationId: parentOrganization !== "" ? parentOrganization : null
            }
        }
        const res = await updateOrganization(buildOrgInputdata())
        if (res.ok) {
            router.push(`/organizations/${params.id}`)
        } else {
            console.error('Organization creation failed')
        }
    }

    const pageTitle = `Edit: ${data.name}`
    const breadcrumbTitle = `${params.id}`;
    const path = `${activePage.path}/${params.id}`;
    const editPath = `${activePage.path}/${params.id}/edit`;
    const breadcrumbs = [...activePage.breadcrumbs,
        {title: breadcrumbTitle, path},
        {title: 'Edit', path: editPath}];
    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>
            <TextField helperText =""
                       id="outlined-basic"
                       label="Id"
                       variant="outlined"
                       defaultValue={data.id}
                       slotProps={{input: {readOnly: true}}}
            />
            <TextField 
                       id="outlined-basic"
                       label="Name"
                       variant="outlined"
                       error={nameValidationError !== ''}
                       helperText={nameValidationError}
                       value={name}
                       onChange={onChangeName}
            />
            <TextField select
                       id="outlined-basic"
                       label="Organization Type"
                       variant="outlined"
                       error={orgTypeValidationError !== ''}
                       helperText={orgTypeValidationError}
                       value={orgType}
                       onChange={onChangeType}
            >
                {availableOrganizationTypes ?
                    availableOrganizationTypes?.map((option) => (
                        <MenuItem key={option.id} value={option.name}>
                            {option.name}
                        </MenuItem>
                    )) :
                    <MenuItem key={1} value={1}>1</MenuItem>
                }
            </TextField>
            {creatingOrganizationTypeOrganization &&
                    <TextField select
                               id="outlined-basic"
                               label="Parent organization"
                               variant="outlined"
                               error={parentOrganizationValidationError !== ''}
                               helperText={parentOrganizationValidationError}
                               value={parentOrganization}
                               onChange={onChangeParentOrganization}
                    >
                        {resellersThatAreNotSelf ?
                            resellersThatAreNotSelf?.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            )) :
                            <MenuItem key={1} value={1}>1</MenuItem>
                        }
                    </TextField>
                }
            <Box>
                <Button onClick={onSubmit}>Submit Changes</Button>
            </Box>
        </PageContainer>
    )
}
