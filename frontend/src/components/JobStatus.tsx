import {Chip} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {ISummaryJobStatus} from "../../../types/summaraizeTypes";
import {useMyData} from "../hooks/useMyData";

interface JobStatusProps {
    ready?: any,
    pending?: any,
    complete?: any
}

export const JobStatus = () => {
    const {myJobs} = useMyData({skipCache: true});

    const numPending = myJobs.filter((job) => job.status === 'PENDING').length;
    const numComplete = myJobs.filter((job) => job.status === 'COMPLETED').length;

    if (numPending === 0 && numComplete === 0) {
        return <Chip label="None" size='small'/>
    }
    if (numPending > 0) {
        return <Chip icon={<AccessTimeIcon/>} color="warning" label={`${numPending} Pending`} size='small'/>
    }
    else {
        return <Chip icon={<CheckCircleOutlineIcon/>} color="success" label={`${numComplete} Complete`} size='small'/>
    }
}
