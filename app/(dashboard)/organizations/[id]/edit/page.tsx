"use client"

import {
    Typography,
    Button,
    MenuItem,
    TextField,
    Skeleton,
    Box,
    Stack,
    Grid,
} from "@mui/material";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import useOrganizationById from "@/hooks/useOrganizationById";
import useAvailableOrganizationTypes from "@/hooks/availableOrganizationTypesHook";
import getResellersHook from "@/hooks/getResellersHook";
import { useState, useEffect } from "react";
import { createOrganization, updateOrganization } from "@/api/organizations";
import { useActivePage } from "@toolpad/core";
import { PageContainer } from "@toolpad/core/PageContainer";

export default function HomePage() {
    const params = useParams();
    const router = useRouter();
    const activePage = useActivePage();

    const { data, error, loading } = useOrganizationById(params.id);
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

    const creatingOrganizationTypeOrganization = orgType === "Organization";

    useEffect(() => {
        if (data) {
            setName(data.name);
            setParentOrganization(data.parentOrganization || "");
            setOrgType(data.organizationType);
        }
    }, [data]);

    const onChangeName = (e) => setName(e.target.value);
    const onChangeType = (e) => {
        setOrgType(e.target.value);
        if (e.target.value === "Reseller") setParentOrganization("");
    };
    const onChangeParentOrganization = (e) => setParentOrganization(e.target.value);

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

        const orgInput = {
            id: params.id,
            name,
            organizationTypeId: orgTypeId,
            parentOrganizationId: parentOrganization || null,
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
    const path = `${activePage.path}/${params.id}`;
    const editPath = `${path}/edit`;
    const breadcrumbs = [
        ...activePage.breadcrumbs,
        { title: breadcrumbTitle, path },
        { title: "Edit", path: editPath },
    ];

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
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Organization Type"
                            variant="outlined"
                            error={!!orgTypeValidationError}
                            helperText={orgTypeValidationError}
                            value={orgType}
                            onChange={onChangeType}
                        >
                            {availableOrganizationTypes.map((option) => (
                                <MenuItem key={option.id} value={option.name}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    {creatingOrganizationTypeOrganization && (
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Parent Organization"
                                variant="outlined"
                                error={!!parentOrganizationValidationError}
                                helperText={parentOrganizationValidationError}
                                value={parentOrganization}
                                onChange={onChangeParentOrganization}
                            >
                                {resellersThatAreNotSelf.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    )}
                </Grid>
                <Box>
                    <Button variant="contained" onClick={onSubmit}>
                        Submit Changes
                    </Button>
                </Box>
            </Stack>
        </PageContainer>
    );
}
