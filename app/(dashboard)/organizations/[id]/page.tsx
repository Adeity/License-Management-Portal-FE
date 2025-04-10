"use client"

import useOrganizationById from "@/hooks/useOrganizationById";
import { useRouter, useParams } from "next/navigation";
import {
    Typography,
    Button,
    TextField,
    Box,
    Stack,
    Skeleton,
    Grid,
    Tabs,
    Tab,
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import * as React from "react";
import {
    createOrganizationPackageDetails,
    deleteOrganization,
    deleteOrganizationPackageDetails,
    restoreOrganization
} from "@/api/organizations";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useActivePage } from "@toolpad/core";
import PaginatedTable from "@/components/PaginatedTable";
import {HeadCell} from "@/types/HeadCell";
import useFetchApi from "@/hooks/useFetchApi";
import {getAllPackageDetails} from "@/api/packageDetails";
import AssignPackageDetailModal from "@/components/AssignPackageDetailModal";
import {useState} from "react"; // Adjust path if needed

// Define head cells for package details table
const packageDetailsHeadCells: readonly HeadCell[] = [
    {
        id: 'packageDetailId',
        numeric: false,
        disablePadding: false,
        label: 'ID',
    },
    {
        id: 'packageDetailTitle',
        numeric: false,
        disablePadding: false,
        label: 'Package',
    },
    {
        id: 'serialNumbersCount',
        numeric: true,
        disablePadding: false,
        label: 'License Count',
    },
];


export default function HomePage() {
    const params = useParams();
    const router = useRouter();
    const activePage = useActivePage();
    const { data, error, loading, refetch } = useOrganizationById(params.id);
    const [tab, setTab] = React.useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPackageDetailId, setSelectedPackageDetailId] = useState<number | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeletingPackage] = useState(false);
    const [deleteSuccess, setDeletePackageSuccess] = useState(false);
    const [deleteError, setDeletePackageError] = useState<string | null>(null);


    const {data: dataPackageDetails, error: errorPackageDetails, loading: loadingPackageDetails} = useFetchApi(() => getAllPackageDetails())

    const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);

    const handleAssignDialogClose = () => {
        setAssignDialogOpen(false)
        refetch()
    }

    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, packageDetailId: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedPackageDetailId(packageDetailId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDeletePackageDetails = () => {
        setConfirmDeleteOpen(true);
        handleMenuClose();
    };

    const handleConfirmDelete = async () => {
        if (!selectedPackageDetailId || !data?.id) return;
        setDeletingPackage(true);
        setDeletePackageError(null);
        setDeletePackageSuccess(false);
        try {
            await deleteOrganizationPackageDetails(data.id, selectedPackageDetailId);
            setDeletePackageSuccess(true);
            setSelectedPackageDetailId(null);
        } catch (e: any) {
            console.error("Failed to delete package detail", e);
            setDeletePackageError(e.message || "Unexpected error");
        } finally {
            setDeletingPackage(false);
        }
    };



    const handleAssignPackage = async (packageDetailsId: number, quantityOfLicenses: number) => {
        const payload = {
            PackageDetailsId: packageDetailsId,
            OrganizationAccountId: data.id, // assuming `data` is org
            QuantityOfLicenses: quantityOfLicenses
        };

        const res = await createOrganizationPackageDetails(payload.OrganizationAccountId, payload);

        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.message || "Failed to assign package");
        }
    };


    const handleDeleteOrganizationClick = async () => {
        const res = await deleteOrganization(params.id);
        if (res.ok) refetch();
    };

    const handleRestoreClick = async () => {
        const res = await restoreOrganization(params.id);
        if (res.ok) refetch();
    };

    const breadcrumbs = [
        ...activePage.breadcrumbs,
        { title: `${params.id}`, path: `${activePage.path}/${params.id}` },
    ];

    const renderField = (label: string, value?: string | number | null) => (
        <TextField
            fullWidth
            label={label}
            variant="outlined"
            defaultValue={value ?? ""}
            InputProps={{ readOnly: true }}
        />
    );

    const renderGeneralInfo = () => (
        <>
            {data.isDeleted && (
                <Typography variant="h5" color="error">
                    This organization has been deleted
                </Typography>
            )}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    {renderField("Id", data.id)}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Name", data.name)}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Type", data.organizationType)}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Parent Organization", data.parentOrganization || "Null")}
                </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={2}>
                <Button
                    variant="contained"
                    onClick={() => router.push(`/organizations/${params.id}/edit`)}
                >
                    Edit
                </Button>
                {data.isDeleted ? (
                    <Button variant="contained" color="success" onClick={handleRestoreClick}>
                        Restore
                    </Button>
                ) : (
                    <Button variant="contained" color="error" onClick={handleDeleteOrganizationClick}>
                        Delete
                    </Button>
                )}
            </Box>
        </>
    );

    const renderPackageDetails = () => {
        const paginatedPackageData = {
            items: data.organizationPackageDetails ?? [],
            totalCount: data.organizationPackageDetails?.length ?? 0,
        };
        const renderRowActions = (row: any) => (
            <IconButton onClick={(e) => handleMenuClick(e, row.id)}>
                <MoreVertIcon />
            </IconButton>
        );

        const packageDataIds = paginatedPackageData.items.map((p) => {
            return p.packageDetailsId
        })

        const filteredPackageDetails = dataPackageDetails.filter((p) => {
            return !packageDataIds.includes(p.id)
        });

        return (
            <Box mt={0}>
                <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDeletePackageDetails}>Delete</MenuItem>
                </Menu>

                <Dialog open={confirmDeleteOpen} onClose={() => {
                    if (!deleting && !deleteSuccess) setConfirmDeleteOpen(false);
                }}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        {deleting ? (
                            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                                <Typography>Deleting package detail...</Typography>
                            </Stack>
                        ) : deleteSuccess ? (
                            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                                <Typography variant="h6" color="success.main">✅ Package detail deleted successfully</Typography>
                            </Stack>
                        ) : deleteError ? (
                            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
                                <Typography variant="h6" color="error">❌ Failed to delete package detail</Typography>
                                <Typography variant="body2" color="text.secondary">{deleteError}</Typography>
                            </Stack>
                        ) : (
                            <Typography>
                                Are you sure you want to remove this package detail from the organization?
                            </Typography>
                        )}
                    </DialogContent>
                    {!deleting && !deleteSuccess && !deleteError && (
                        <DialogActions>
                            <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleConfirmDelete}
                                variant="contained"
                                color="error"
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    )}
                    {(deleteSuccess || deleteError) && (
                        <DialogActions>
                            <Button onClick={() => {
                                setConfirmDeleteOpen(false);
                                setDeletePackageError(null);
                                setDeletePackageSuccess(false);
                                refetch();
                            }}>Close</Button>
                        </DialogActions>
                    )}
                </Dialog>


                <Button
                    variant="contained"
                    onClick={() => setAssignDialogOpen(true)}
                    sx={{ mb: 2 }}
                >
                    Assign New Package
                </Button>
                <AssignPackageDetailModal
                    open={assignDialogOpen}
                    onClose={() => handleAssignDialogClose()}
                    onAssign={handleAssignPackage}
                    organizationName={data.name}
                    packageDetails={dataPackageDetails ? filteredPackageDetails.map(p => {
                        return {
                            id: p.id,
                            productNumber: p.productNumber,
                            productName: p.productName,
                            title: p.title
                        }
                    }) : null}
                    loading={loadingPackageDetails}
                />
                <PaginatedTable
                    title="Package Details"
                    paginatedData={paginatedPackageData}
                    headCells={packageDetailsHeadCells}
                    clickable={false}
                    loading={false}
                    rowsPerPage={5}
                    setPageNumber={() => {}}
                    setRowsPerPage={() => {}}
                    rowClickable={false}
                    disablePagination={true}
                    renderRowActions={renderRowActions}
                />

            </Box>
        );
    };



    return (
        <PageContainer breadcrumbs={breadcrumbs} title={data?.name ?? "Organization details"}>
            <Stack spacing={3}>
                {loading ? (
                    <>
                        <Skeleton variant="text" width="60%" height={50} />
                        <Grid container spacing={2}>
                            {[...Array(4)].map((_, i) => (
                                <Grid item xs={12} md={6} key={i}>
                                    <Skeleton variant="rectangular" height={70} />
                                </Grid>
                            ))}
                        </Grid>
                        <Box display="flex" gap={2}>
                            <Skeleton variant="rectangular" width={100} height={36} />
                            <Skeleton variant="rectangular" width={100} height={36} />
                        </Box>
                    </>
                ) : error ? (
                    <Typography color="error">Error: {error}</Typography>
                ) : (
                    <>
                        {data.organizationTypeId === 1 ? (
                            <>
                                <Tabs value={tab} onChange={(_, val) => setTab(val)}>
                                    <Tab label="General" />
                                    <Tab label="Package Details" />
                                </Tabs>
                                <Box pt={2}>
                                    {tab === 0 && renderGeneralInfo()}
                                    {tab === 1 && renderPackageDetails()}
                                </Box>
                            </>
                        ) : (
                            renderGeneralInfo()
                        )}
                    </>
                )}
            </Stack>
        </PageContainer>
    );
}
