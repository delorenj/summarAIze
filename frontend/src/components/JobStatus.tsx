import {Chip} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface JobStatusProps {
    ready?: any,
    pending?: any,
    complete?: any
}

export const JobStatus = (props: JobStatusProps) => {
    const {ready, pending, complete} = props;
    let content = <Chip label="None" size='small'/>
    if (pending) {
        content = <Chip icon={<AccessTimeIcon/>} color="warning" label="Pending" size='small'/>
    } else if (complete) {
        content = <Chip icon={<CheckCircleOutlineIcon/>} color="success" label="Complete" size='small'/>
    }

    return (
        content
    );
}
