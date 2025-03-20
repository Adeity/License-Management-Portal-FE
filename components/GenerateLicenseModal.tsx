import {
    Backdrop,
    Button,
    Checkbox, CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    TextField
} from "@mui/material";
import {useState} from "react";
import Box from "@mui/material/Box";
import * as React from "react";
import {padding, Stack} from "@mui/system";
import Typography from "@mui/material/Typography";

interface PackageDetails {
    serialNumbersCount: number;
    packageDetailsId: number;
    packageDetailTitle: string;
}
export interface SimpleDialogProps {
    open: boolean;
    // selectedValue: string;
    onClose: () => void;
    organizationAccountName: string;
    onSubmit: (packageDetailsId: number, quantityOfLicenses: number) => void;
    generatingLicense: boolean;
    packageDetails: PackageDetails[];
    generatingResult: string;
}

export function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, open } = props;

    const [selectedPackageDetail, setSelectedPackageDetail] = useState<number>(props.packageDetails[0].packageDetailsId);
    const [tosChecked, setTosChecked] = useState<boolean>(false);

    const selectedPackageDetailProp = props.packageDetails.find(e => {
        return e.packageDetailsId === selectedPackageDetail
    })
    const packdetailsRender = (
        <p>
        <b>Selected:</b> {selectedPackageDetailProp?.packageDetailTitle}
        </p>
    )

    const handleSubmit = () => {
        props.onSubmit(selectedPackageDetail, 1);
    }

    const handleClose = () => {
        onClose();
    };

    const handleListItemClick = (value: string) => {
        onClose();
    };

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Create License</DialogTitle>
            <Divider/>
            <DialogContent >
                <Backdrop open={props.generatingLicense} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                {props.generatingResult !== "" ?
                   (
                       <Stack>
                           <Typography variant="h5" component="div" color={"green"}>Successfuly created
                               license</Typography>
                           <div><b>Organization:</b> {props.organizationAccountName}</div>
                           <div><b>License type:</b> {selectedPackageDetailProp?.packageDetailTitle}</div>
                           <div><b>License number:</b> {props.generatingResult}</div>
                           <Button onClick={handleClose} variant="outlined" sx={{marginTop: 3}}>Continue</Button>
                       </Stack>
                   )
                    :
                    (

                        <Stack>
                        <TextField helperText=""
                                       id="outlined-basic"
                               label="Organization"
                               variant="outlined"
                               disabled
                               defaultValue={props.organizationAccountName}
                               slotProps={{input: {readOnly: true}}}
                    />
                    <TextField select
                               sx={{marginTop: 2}}
                               id="outlined-basic"
                               label="License Type"
                               variant="outlined"
                               // error={orgTypeValidationError !== ''}
                               // helperText={orgTypeValidationError}
                               value={selectedPackageDetail}
                               // onChange={onChangeType}
                    >
                        {props.packageDetails ?
                            props.packageDetails?.map((option) => (
                                <MenuItem key={option.packageDetailsId} value={option.packageDetailsId}>
                                    {option.packageDetailTitle} (remaining {option.serialNumbersCount})
                                </MenuItem>
                            )) :
                            <MenuItem key={1} value={1}>1</MenuItem>
                        }
                    </TextField>
                    <p>Remaining licenses: {selectedPackageDetailProp?.serialNumbersCount}</p>

                    <Box sx={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: 2}}>
                        <Checkbox checked={tosChecked} onChange={() => setTosChecked(!tosChecked)}/> I have read, understood and agree to the <a href={""} onClick={(e) => e.preventDefault()}> Terms and Conditions</a>
                    </Box>
                    <Box sx={{justifyContent: 'space-between', display: 'flex', marginTop: 2}} >
                        <Button onClick={handleClose} variant="outlined" >Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={!tosChecked}>Confirm</Button>
                    </Box>
                </Stack>
                    )
                }
            </DialogContent>
        </Dialog>
    );
}