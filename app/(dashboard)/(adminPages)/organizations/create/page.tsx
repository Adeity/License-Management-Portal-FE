"use client"

import {
    Button,
    TextField,
    Box,
    Stack,
    Grid,
    Skeleton, Select, FormHelperText, FormControl, InputLabel,
} from "@mui/material";
import {useState} from "react";
import {useAvailableOrganizationTypes} from "@/hooks/availableOrganizationTypesHook";
import {getResellersHook} from "@/hooks/getResellersHook";
import { createOrganization } from "@/api/organizations";
import { useRouter } from "next/navigation";
import {Breadcrumb, PageContainer} from "@toolpad/core/PageContainer";
import { useActivePage } from "@toolpad/core";

export default function CreateOrganizationPage() {
    const router = useRouter();
    const activePage = useActivePage();

    const { data: availableOrganizationTypes, loading: loadingTypes } = useAvailableOrganizationTypes();
    const { data: resellers, loading: loadingResellers } = getResellersHook();

    const [orgType, setOrgType] = useState("Organization");
    const [orgTypeValidationError, setOrgTypeValidationError] = useState("");

    const [name, setName] = useState("");
    const [nameValidationError, setNameValidationError] = useState("");

    const [parentOrganization, setParentOrganization] = useState("");
    const [parentOrganizationValidationError, setParentOrganizationValidationError] = useState("");

    const creatingOrganizationTypeOrganization = orgType === "Organization";

    const onChangeName = (e) => setName(e.target.value);
    const onChangeType = (e) => setOrgType(e.target.value);
    const onChangeReseller = (e) => setParentOrganization(e.target.value);

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

        const orgTypeId = availableOrganizationTypes.find((e) => e.name === orgType)?.id;
        const orgId = resellers.find((e) => e.name === parentOrganization)?.id;
        const orgInput = {
            name,
            organizationTypeId: orgTypeId,
            parentOrganizationId: orgId || null,
        };


        const res = await createOrganization(orgInput);

        if (res.ok) {
            router.push(`/organizations`);
        } else {
            console.error("Organization creation failed");
        }
    };

    const breadcrumbTitle = `Create`;
    let breadcrumbs: Breadcrumb[] = [{title: "loading...", path: "/"}];
    if (activePage) {
        const path = `${activePage.path}/create`;
        breadcrumbs = [...activePage.breadcrumbs, { title: breadcrumbTitle, path }];
    }

    return (
        <PageContainer title="Create New Organization" breadcrumbs={breadcrumbs}>

            {loadingTypes || loadingResellers ? (
                <Stack spacing={3}>
                    <Skeleton variant="text" width="40%" height={40} />
                    <Grid container spacing={2}>
                        {[...Array(3)].map((_, i) => (
                            <Grid item xs={12} md={6} key={i}>
                                <Skeleton variant="rectangular" height={70} />
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            ) : (
                <Stack spacing={4}>
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
                                    id={"organization-type-select"}
                                    native={true}
                                    label="Organization Type"
                                    variant="outlined"
                                    value={orgType}
                                    onChange={onChangeType}
                                >
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
                                    <InputLabel id={"organization-type-select"} htmlFor={"parent-org-select"}>Parent Organization</InputLabel>
                                    <Select
                                        id="parent-org-select"
                                        native={true}
                                        label="Parent Organization"
                                        variant="outlined"
                                        value={parentOrganization}
                                        onChange={onChangeReseller}
                                    >

                                        <option value="" disabled></option>
                                        {resellers.map((option) => (
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
                        <Button variant="contained" onClick={onSubmit}>
                            Create Organization
                        </Button>
                    </Box>
                </Stack>
            )}
        </PageContainer>
    );
}

