import {Dialog, DialogTitle, Divider} from "@mui/material";

export interface SimpleDialogProps {
    open: boolean;
    // selectedValue: string;
    onClose: () => void;
}

export function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, open } = props;

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
            <p>ahoj</p>
        </Dialog>
    );
}