"use client"

import {Button, Input, MenuItem, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import useAvailableOrganizationTypes from "@/hooks/availableOrganizationTypesHook";
import {useState} from "react";
import getResellersHook from "@/hooks/getResellersHook";
import {createOrganization} from "@/api/organizations";
import {useRouter} from "next/navigation";

export default function CreatOrganizationPage() {
    const router = useRouter();
    const {data: availableOrganizationTypes} = useAvailableOrganizationTypes()
    const {data: resellers} = getResellersHook()
    const [orgType, setOrgType] = useState("Organization")
    const [orgTypeValidationError, setOrgTypeValidationError] = useState('')

    const [name, setName] = useState("")
    const [nameValidationError, setNameValidationError] = useState('')

    const [parentOrganization, setParentOrganization] = useState('')
    const [parentOrganizationValidationError, setParentOrganizationValidationError] = useState('')

    const creatingOrganizationTypeOrganization = orgType === "Organization"

    const onChangeName = (e) => {
        setName(e.target.value)
    }
    const onChangeType = (e) => {
        setOrgType(e.target.value)
    }
    const onChangeReseller = (e) => {
        setParentOrganization(e.target.value)
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

    const clearValidations = () => {
        setNameValidationError('')
        setOrgTypeValidationError('')
        setParentOrganizationValidationError('')
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
                name: name,
                organizationTypeId: orgTypeId,
                parentOrganizationId: parentOrganization
            }
        }
        const res = await createOrganization(buildOrgInputdata())
        if (res.ok) {
            router.push(`/organizations`)
            console.log('Organization created')
        } else {
            console.error('Organization creation failed')
        }
    }

    return (
        <div>
            <Box
                component={"form"}
                >
                <TextField id="outlined-basic"
                           label="Name"
                           variant="outlined"
                           error={nameValidationError !== ''}
                           helperText={nameValidationError}
                           value={name}
                           onChange={onChangeName}/>
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
                               onChange={onChangeReseller}
                    >
                        {resellers ?
                            resellers?.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            )) :
                            <MenuItem key={1} value={1}>1</MenuItem>
                        }
                    </TextField>
                }
            </Box>
            <Box>
                <Button onClick={onSubmit}>Create org</Button>
            </Box>
        </div>
    )
}
