"use client"

import { Button, Skeleton, TextField } from "@mui/material";
import Alert from '@mui/material/Alert';
import Box from "@mui/material/Box";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@toolpad/core/PageContainer";
import useFetchApi from "@/hooks/useFetchApi";
import { createOrganization } from "@/api/organizations";
import { getLoggedResellerInfo } from "@/api/reseller";
import {OrganizationTypeNumeric} from "@/enums/OrganizationTypeNumeric";

export default function CreateOrganizationPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [nameValidationError, setNameValidationError] = useState("");
    const [creating, setCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        data: dataLoggedReseller,
        loading: loadingLoggedReseller,
    } = useFetchApi(() => getLoggedResellerInfo());

    const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const validate = () => {
        setNameValidationError("");
        if (name.trim() === "") {
            setNameValidationError("Name is required");
            return false;
        }
        if (name.length < 3) {
            setNameValidationError("Name must be at least 3 characters long");
            return false;
        }
        return true;
    };

    const onSubmit = async () => {
        if (!validate()) return;

        setCreating(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const payload = {
            name: name,
            organizationTypeId: OrganizationTypeNumeric.Organization, // assuming "Organization" has ID = 2
            parentOrganizationId: dataLoggedReseller?.id,
        };

        try {
            const res = await createOrganization(payload);
            const result = await res.json();
            if (res.ok) {
                setSuccessMessage("Organization created successfully.");
                router.push('/reseller')
            } else {
                throw new Error(result?.message || "Failed to create organization.");
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setCreating(false);
        }
    };

    const breadcrumbs = [
        { title: "My Organizations", path: "/reseller" },
        { title: "Create", path: "/reseller/organizations/create" },
    ];

    return (
        <PageContainer title="Create New Organization" breadcrumbs={breadcrumbs}>
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <TextField
                    label="Name"
                    variant="outlined"
                    error={nameValidationError !== ""}
                    helperText={nameValidationError}
                    value={name}
                    onChange={onChangeName}
                    disabled={creating}
                    data-cy-test={"name-input"}
                />
                <TextField
                    label="Organization Type"
                    variant="outlined"
                    value="Organization"
                    disabled
                />
                {loadingLoggedReseller ? (
                    <Skeleton variant="rectangular" height={56} />
                ) : (
                    <TextField
                        label="Parent Organization"
                        variant="outlined"
                        value={dataLoggedReseller?.name || ""}
                        disabled
                    />
                )}
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loadingLoggedReseller || creating}
                >
                    {creating ? "Creating..." : "Create Organization"}
                </Button>
            </Box>
        </PageContainer>
    );
}