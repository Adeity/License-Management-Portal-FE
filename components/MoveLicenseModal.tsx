import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Stack,
    CircularProgress
} from '@mui/material';

interface MoveLicenseModalProps {
    open: boolean;
    onClose: () => void;
    onMove: (targetOrgId: number) => Promise<void>;
    serialNumber: string;
    sourceOrganization: { name: string; id: number } | null;
    targetOrganizations: { name: string; id: number }[] | null;
}

export default function MoveLicenseModal({
                                             open,
                                             onClose,
                                             onMove,
                                             serialNumber,
                                             sourceOrganization,
                                             targetOrganizations
                                         }: MoveLicenseModalProps) {
    const [targetOrgId, setTargetOrgId] = useState<string>("");
    const [moving, setMoving] = useState(false);
    const [moveSuccess, setMoveSuccess] = useState(false);
    const [moveError, setMoveError] = useState<string | null>(null);

    const handleMove = async () => {
        setMoving(true);
        setMoveError(null);
        try {
            await onMove(Number(targetOrgId));
            setMoveSuccess(true);
        } catch (err: any) {
            console.error("Error moving license:", err);
            setMoveError(err.message || "An unexpected error occurred.");
        } finally {
            setMoving(false);
        }
    };

    // ✅ Only clears internal state and calls onClose when user clicks Close
    const handleClose = () => {
        setTargetOrgId("");
        setMoveError(null);
        setMoveSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Move License</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {moving ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography variant="h6">Moving license...</Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth="300px">
                            Please wait while we update the license ownership.
                        </Typography>
                    </Stack>
                ) : moveError ? (
                    <Stack alignItems="center" spacing={2}>
                        <Typography variant="h5" color="error">❌ Failed to move license</Typography>
                        <Typography>{moveError}</Typography>
                        <Button onClick={handleClose} variant="outlined">Close</Button>
                    </Stack>
                ) : moveSuccess ? (
                    <Stack alignItems="center" spacing={2}>
                        <Typography variant="h5" color="success.main">✅ License moved successfully</Typography>
                        <Typography><b>Serial number:</b> {serialNumber}</Typography>
                        <Typography><b>New Organization:</b> {
                            targetOrganizations?.find(o => o.id === Number(targetOrgId))?.name || 'Unknown'
                        }</Typography>
                        <Button onClick={handleClose} variant="outlined">Close</Button>
                    </Stack>
                ) : (
                    <>
                        <Typography variant="body2" color="textSecondary">
                            Serial Number: <strong>{serialNumber}</strong>
                        </Typography>

                        <TextField
                            label="Source Organization"
                            fullWidth
                            value={sourceOrganization?.name || ''}
                            disabled
                        />

                        <FormControl fullWidth>
                            <InputLabel id="target-org-select-label">Target Organization</InputLabel>
                            <Select
                                labelId="target-org-select-label"
                                value={targetOrgId}
                                label="Target Organization"
                                onChange={(e) => setTargetOrgId(e.target.value)}
                            >
                                {targetOrganizations?.map((org) => {
                                    if (org.id === sourceOrganization?.id) return null;
                                    return (
                                        <MenuItem key={org.id} value={org.id}>
                                            {org.name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </>
                )}
            </DialogContent>

            {/* ✅ Only show action buttons when not in loading/success/error states */}
            {!moving && !moveSuccess && !moveError && (
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleMove}
                        disabled={!targetOrgId}
                    >
                        Move
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
