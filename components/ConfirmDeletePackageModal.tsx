'use client'

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack
} from '@mui/material';

interface ConfirmDeletePackageModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
}

export default function ConfirmDeletePackageModal({
                                                      open,
                                                      onClose,
                                                      onDelete
                                                  }: ConfirmDeletePackageModalProps) {
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        try {
            await onDelete();
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Unexpected error occurred.');
        } finally {
            setDeleting(false);
        }
    };

    const handleClose = () => {
        setDeleting(false);
        setSuccess(false);
        setError(null);
        onClose();
    };

    useEffect(() => {
        if (!open) {
            setDeleting(false);
            setSuccess(false);
            setError(null);
        }
    }, [open]);

    return (
        <Dialog open={open} onClose={() => !deleting && !success && onClose()}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                {deleting ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                        <Typography>Deleting package detail...</Typography>
                    </Stack>
                ) : success ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                        <Typography variant="h6" color="success.main">
                            ✅ Package detail deleted successfully
                        </Typography>
                    </Stack>
                ) : error ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                        <Typography variant="h6" color="error">
                            ❌ Failed to delete package detail
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{error}</Typography>
                    </Stack>
                ) : (
                    <Typography>
                        Are you sure you want to remove this package detail from the organization?
                    </Typography>
                )}
            </DialogContent>

            {!deleting && !success && !error && (
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            )}
            {(success || error) && (
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            )}
        </Dialog>
    );
}
