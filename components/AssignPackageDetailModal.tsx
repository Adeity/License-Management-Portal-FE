import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    TextField,
    Skeleton
} from '@mui/material';

interface PackageDetailOption {
    id: number;
    productNumber: string;
    productName: string;
    title: string;
}

interface AssignPackageDetailModalProps {
    open: boolean;
    onClose: () => void;
    onAssign: (packageDetailsId: number, quantityOfLicenses: number) => Promise<void>;
    packageDetails: PackageDetailOption[] | null;
    organizationName: string;
    loading: boolean;
}

export default function AssignPackageDetailModal({
                                                     open,
                                                     onClose,
                                                     onAssign,
                                                     packageDetails,
                                                     organizationName,
                                                     loading
                                                 }: AssignPackageDetailModalProps) {
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [licenseCount, setLicenseCount] = useState<string>('500');
    const [assigning, setAssigning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const isEmpty = packageDetails && packageDetails.length === 0;
    console.log('package details:', packageDetails)

    const handleSubmit = async () => {
        console.log('handle submit called', licenseCount, selectedPackageId)
        const parsed = Number(licenseCount);
        if (!selectedPackageId || isNaN(parsed) || parsed < 1 || parsed > 2000) {
            setValidationError("Please enter a number between 1 and 2000");
            return;
        }

        setAssigning(true);
        setError(null);
        setValidationError(null);

        try {
            await onAssign(selectedPackageId, parsed);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to assign package.');
        } finally {
            setAssigning(false);
        }
    };

    const handleClose = () => {
        setSelectedPackageId(null);
        setLicenseCount('500');
        setAssigning(false);
        setSuccess(false);
        setError(null);
        setValidationError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" data-testid={"assign-package-modal"}>
            <DialogTitle>Assign Package</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {loading ? (
                    <Stack spacing={2}>
                        <Skeleton variant="text" height={40} />
                        <Skeleton variant="rounded" height={56} />
                        <Skeleton variant="rounded" height={56} />
                    </Stack>
                ) : assigning ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography>Assigning package detail...</Typography>
                    </Stack>
                ) : success ? (
                    <Stack alignItems="center" spacing={2}>
                        <Typography variant="h5" color="success.main">✅ Successfully assigned</Typography>
                        <Button variant="outlined" onClick={handleClose}>Close</Button>
                    </Stack>
                ) : error ? (
                    <Stack alignItems="center" spacing={2}>
                        <Typography variant="h5" color="error">❌ Failed to assign</Typography>
                        <Typography>{error}</Typography>
                        <Button variant="outlined" onClick={handleClose}>Close</Button>
                    </Stack>
                ) : isEmpty ? (
                    <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                        <Typography textAlign="center" color="text.secondary">
                            There are no packages left to assign to this organization.
                        </Typography>
                        <Button onClick={handleClose} variant="outlined">Close</Button>
                    </Stack>
                ) : (
                    <Stack spacing={2} sx={{ mt: 2 }}>

                        <FormControl fullWidth>
                            <InputLabel id="package-detail-select-label" htmlFor={"package-detail-select"}>Package</InputLabel>
                            <Select
                                id={"package-detail-select"}
                                native={true}
                                labelId="package-detail-select-label"
                                value={selectedPackageId || ""}
                                label="Package"
                                onChange={(e) => setSelectedPackageId(Number(e.target.value))}
                            >
                                <option  value=""></option>
                                {packageDetails?.map(detail => (
                                    <option key={detail.id} value={detail.id}>
                                        {detail.productNumber} – {detail.productName}: {detail.title}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Number of Licenses"
                            fullWidth
                            value={licenseCount}
                            type="text"
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setLicenseCount(value);
                                    setValidationError(null);
                                }
                            }}
                            error={!!validationError}
                            helperText={validationError || "Enter a number from 1 to 2000"}
                        />
                    </Stack>
                )}
            </DialogContent>

            {!assigning && !success && !error && !loading && !isEmpty && (
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!selectedPackageId || licenseCount === ""}
                    >
                        Assign
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
