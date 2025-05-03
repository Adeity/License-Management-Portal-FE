"use client"

import {
    Typography,
    Button,
    TextField,
    Skeleton,
    Box,
    Stack,
    Grid, FormControl, InputLabel, Select, FormHelperText,
} from "@mui/material";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganizationByIdHook } from "@/hooks/useOrganizationById";
import {useAvailableOrganizationTypes} from "@/hooks/availableOrganizationTypesHook";
import {getResellersHook} from "@/hooks/getResellersHook";
import { useState, useEffect } from "react";
import { updateOrganization } from "@/api/organizations";
import { useActivePage } from "@toolpad/core";
import {Breadcrumb, PageContainer} from "@toolpad/core/PageContainer";

export default function HomePage() {
    const params = useParams();
    const router = useRouter();
    const activePage = useActivePage();

    const { data, error, loading } = useOrganizationByIdHook(params.id);
    const {
        data: availableOrganizationTypes,
        loading: availableOrgTypesloading,
    } = useAvailableOrganizationTypes();
    const { data: resellers, loading: resellersLoading } = getResellersHook();

    const [orgType, setOrgType] = useState("");
    const [orgTypeValidationError, setOrgTypeValidationError] = useState("");
    const [name, setName] = useState("");
    const [nameValidationError, setNameValidationError] = useState("");
    const [parentOrganization, setParentOrganization] = useState("");
    const [parentOrganizationValidationError, setParentOrganizationValidationError] = useState("");
    const [changesWereMade, setchangesWereMade] = useState(false);

    const creatingOrganizationTypeOrganization = orgType === "Organization";

    useEffect(() => {
        if (data) {
            setName(data.name);
            setParentOrganization(data.parentOrganization || "");
            setOrgType(data.organizationType);
        }
    }, [data]);

    const onChangeName = (e) => {
        setName(e.target.value);
        setchangesWereMade(true)
    }
    const onChangeType = (e) => {
        setOrgType(e.target.value);
        if (e.target.value === "Reseller") setParentOrganization("");
        setchangesWereMade(true)
    };
    const onChangeParentOrganization = (e) => {
        setParentOrganization(e.target.value);
        setchangesWereMade(true)
    }

    if (loading || resellersLoading || availableOrgTypesloading) {
        return (
            <PageContainer title="Edit Organization">
                <Stack spacing={3}>
                    <Skeleton variant="text" width="40%" height={40} />
                    <Grid container spacing={2}>
                        {[...Array(3)].map((_, i) => (
                            <Grid item xs={12} md={6} key={i}>
                                <Skeleton variant="rectangular" height={70} />
                            </Grid>
                        ))}
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={70} />
                        </Grid>
                    </Grid>
                    <Box>
                        <Skeleton variant="rectangular" width={150} height={36} />
                    </Box>
                </Stack>
            </PageContainer>
        );
    }

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }

    const resellersThatAreNotSelf = resellers.filter((e) => e.id !== data.id);

    const clearValidations = () => {
        setNameValidationError("");
        setOrgTypeValidationError("");
        setParentOrganizationValidationError("");
    };

    const findValidationErrors = () => {
        clearValidations();
        let foundError = false;

        if (orgType === "Organization" && parentOrganization === "") {
            setParentOrganizationValidationError("Parent organization is required");
            foundError = true;
        }

        if (name.trim().length < 3) {
            setNameValidationError("Name must be at least 3 characters long");
            foundError = true;
        }

        if (name.trim() === "") {
            setNameValidationError("Name is required");
            foundError = true;
        }

        return foundError;
    };

    const onSubmit = async () => {
        if (findValidationErrors()) return;

        const orgTypeId = availableOrganizationTypes.find((e) => e.name === orgType).id;
        const parentOrgId = resellers.find((e) => e.name === parentOrganization)?.id;

        const orgInput = {
            id: params.id,
            name,
            organizationTypeId: orgTypeId,
            parentOrganizationId: parentOrgId,
        };

        const res = await updateOrganization(orgInput);

        if (res.ok) {
            router.push(`/organizations/${params.id}`);
        } else {
            console.error("Organization update failed");
        }
    };

    const pageTitle = `Edit: ${data.name}`;
    const breadcrumbTitle = `${params.id}`;
    let breadcrumbs: Breadcrumb[] = [{title: "loading...", path: "/"}];
    if (activePage) {
        const path = `${activePage.path}/${params.id}`;
        const editPath = `${path}/edit`;
        breadcrumbs = [
            ...activePage.breadcrumbs,
            { title: breadcrumbTitle, path },
            { title: "Edit", path: editPath },
        ];
    }

    return (
        <PageContainer breadcrumbs={breadcrumbs} title={pageTitle}>
            <Stack spacing={3}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name"
                            variant="outlined"
                            error={!!nameValidationError}
                            helperText={nameValidationError}
                            value={name}
                            onChange={onChangeName}
                            data-cy-test="name-input"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl error={!!orgTypeValidationError} sx={{ width: "100%" }}>
                            <InputLabel id={"organization-type-select-label"} htmlFor={"organization-type-select"}>Organization Type</InputLabel>
                            <Select
                                id="organization-type-select"
                                native={true}
                                label="Organization Type"
                                variant="outlined"
                                value={orgType}
                                onChange={onChangeType}
                                data-cy-test={"organization-type-select"}
                            >

                                <option value="" disabled></option>
                                {availableOrganizationTypes.map((option) => (
                                    <option key={option.id} value={option.name}>
                                        {option.name}
                                    </option>
                                ))}
                            </Select>
                            {orgTypeValidationError &&
                                <FormHelperText>{orgTypeValidationError}</FormHelperText>
                            }
                        </FormControl>

                    </Grid>
                    {creatingOrganizationTypeOrganization && (
                        <Grid item xs={12} md={6}>
                            <FormControl error={!!parentOrganizationValidationError} sx={{ width: "100%" }}>
                                <InputLabel id={"parent-type-select-label"} htmlFor={"parent-org-select"}>Parent Organization</InputLabel>
                                <Select
                                    id="parent-org-select"
                                    native={true}
                                    label="Parent Organization"
                                    variant="outlined"
                                    value={parentOrganization}
                                    onChange={onChangeParentOrganization}
                                    data-cy-test="parent-organization-select"
                                >

                                    <option value="" disabled></option>
                                    {resellersThatAreNotSelf.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </Select>
                                {parentOrganizationValidationError &&
                                    <FormHelperText>{parentOrganizationValidationError}</FormHelperText>
                                }
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
                <Box>
                    <Button variant="contained" onClick={onSubmit} disabled={!changesWereMade}>
                        Submit Changes
                    </Button>
                </Box>
            </Stack>
        </PageContainer>
    );
}
