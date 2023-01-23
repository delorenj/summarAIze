import {Chip} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface JobStatusProps {
    ready?: any,
    pending?: any,
    complete?: any
}

export const JobStatus = (props: JobStatusProps) => {
    return (
        <Chip icon={<CheckCircleOutlineIcon/>} label="Ready" size='small'/>
    );
}
