"use client"
import {
    Button,
    Checkbox, CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider, FormControl, FormHelperText, InputLabel,
    Select,
    TextField
} from "@mui/material";
import {useState} from "react";
import Box from "@mui/material/Box";
import * as React from "react";
import {Stack} from "@mui/system";
import Typography from "@mui/material/Typography";

interface PackageDetails {
    serialNumbersCount: number;
    packageDetailsId: number;
    packageDetailTitle: string;
}

export interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
    organizationAccountName: string;
    onSubmit: (packageDetailsId: number, quantityOfLicenses: number) => void;
    generatingLicense: boolean;
    packageDetails: PackageDetails[];
    generatingResult: string;
    generatingError?: string | null;
}

export function GenerateLicenseModal(props: SimpleDialogProps) {
    const {onClose, open} = props;

    const noAvailablePackageDetails = props.packageDetails.length === 0;
    const [selectedPackageDetail, setSelectedPackageDetail] = useState<number>(-1);
    const [licenseTypeSelectError, setLicenseTypeSelectError] = useState<string | null>(null);
    const [tosChecked, setTosChecked] = useState<boolean>(false);

    const allPackaceDetailsDrained = !noAvailablePackageDetails && props.packageDetails.every((packageDetail) => packageDetail.serialNumbersCount < 1);

    const selectedPackageDetailProp = props.packageDetails.find(e => {
        return e.packageDetailsId === Number(selectedPackageDetail)
    })

    const handleSubmit = () => {
        if (selectedPackageDetail === null || selectedPackageDetail === undefined) {
            setLicenseTypeSelectError("Please select a license type");
            return;
        }
        props.onSubmit(selectedPackageDetail, 1);
        setTosChecked(false)
    }

    const handleClose = () => {
        setTosChecked(false)
        onClose();
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Create License</DialogTitle>
            <Divider/>
            <DialogContent>
                {
                    allPackaceDetailsDrained ?
                    (
                        <Stack alignItems="center" spacing={2}>
                            <Typography variant="h5" color="error">All license packages have been fully used up</Typography>
                            <Typography>Contact your administrator to receive a new license package.</Typography>
                            <Button onClick={onClose} variant="outlined">Close</Button>
                        </Stack>
                    ): noAvailablePackageDetails ?
                    (
                        <Stack alignItems="center" spacing={2}>
                            <Typography variant="h5" color="error">You have not been assigned any licenses package</Typography>
                            <Typography>Contact your administrator to receive a license package.</Typography>
                            <Button onClick={onClose} variant="outlined">Close</Button>
                        </Stack>
                    ) : props.generatingLicense ? (
                    <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography variant="h6">Generating license...</Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth="300px">
                            Please wait while we contact the license server and complete the activation process.
                        </Typography>
                    </Stack>
                ) : props.generatingError ? (
                    <Stack alignItems="center" spacing={2}>
                        <Typography variant="h5" color="error">❌ Failed to create license</Typography>
                        <Typography>{props.generatingError}</Typography>
                        <Button onClick={onClose} variant="outlined">Close</Button>
                    </Stack>
                ) : props.generatingResult !== "" ? (
                    <Stack alignItems="center" spacing={2}>
                        <Typography variant="h5" color="success.main">✅ License created successfully</Typography>
                        <Typography><b>Organization:</b> {props.organizationAccountName}</Typography>
                        <Typography><b>License type:</b> {selectedPackageDetailProp?.packageDetailTitle}</Typography>
                        <Typography><b>License number:</b> {props.generatingResult}</Typography>
                        <Button onClick={onClose} variant="outlined">Continue</Button>
                    </Stack>
                ) : (
                    <Stack>
                        <TextField helperText=""
                                   id="outlined-basic"
                                   label="Organization"
                                   variant="outlined"
                                   disabled
                                   defaultValue={props.organizationAccountName}
                        />
                        <FormControl error={!!licenseTypeSelectError} sx={{ width: "100%", marginTop: 2 }}>
                            <InputLabel id={"license-type-select-label"} htmlFor={"license-type-select"}>License Type</InputLabel>
                            <Select
                                id="license-type-select"
                                native={true}
                                label="License Type"
                                variant="outlined"
                                value={selectedPackageDetail}
                                onChange={(e) => setSelectedPackageDetail(e.target.value)}
                                data-cy-test={"license-type-select"}
                            >

                                <option value={-1} disabled></option>
                                {props.packageDetails ?
                                    props.packageDetails?.map((option) => {
                                        const isDisabled = option.serialNumbersCount < 1;
                                       return (
                                        <option key={option.packageDetailsId} value={option.packageDetailsId} disabled={isDisabled}>
                                            {isDisabled&&"(0 remaining)"}{option.packageDetailTitle} (remaining {option.serialNumbersCount})
                                        </option>
                                       )}
                                    ) :
                                    <option key={1} value={1}>1</option>
                                }
                            </Select>
                            {licenseTypeSelectError &&
                                <FormHelperText>{licenseTypeSelectError}</FormHelperText>
                            }
                        </FormControl>
                        {selectedPackageDetail != null && selectedPackageDetail !== -1 && (
                            <p>Remaining licenses: {selectedPackageDetailProp?.serialNumbersCount}</p>
                        )
                        }

                        <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: 2}}>
                            <Checkbox id={"tos-checkbox"} checked={tosChecked} onChange={() => setTosChecked(!tosChecked)}/> I have read,
                            understood and agree to the <a href={""} onClick={(e) => e.preventDefault()}> Terms and
                            Conditions</a>
                        </Box>
                        <Box sx={{justifyContent: 'space-between', display: 'flex', marginTop: 2}}>
                            <Button onClick={handleClose} variant="outlined">Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" disabled={!tosChecked || selectedPackageDetail === -1}>Confirm</Button>
                        </Box>
                    </Stack>
                )
                }
            </DialogContent>
        </Dialog>
    );
}