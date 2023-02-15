import {useEffect, useState} from "react";
import axios from "axios";
import {ISummaryJobStatus} from "../../../types/summaraizeTypes";
import {useAuth} from "../contexts/authContext";
import {useHomeContext} from "../contexts/homeContext";

export const usePollJobStatus = (active: boolean) => {
    const {myJobs, setMyJobs} = useHomeContext();
    const [polling, setPolling] = useState<boolean>(active);
    const statusEndpoint = 'https://4kx4cryfxd.execute-api.us-east-1.amazonaws.com/dev/user/jobs';
    const {sessionInfo} = useAuth();
    const startPolling = () => {
        setPolling(true);
    }

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        const headers = {
            'Authorization': `Bearer ${sessionInfo?.idToken}`
        };

        const poll = async () => {
            const {data} = await axios.get<ISummaryJobStatus[]>(
                statusEndpoint,
                {headers}
            );
            setMyJobs(data);

            if (data.filter(job => job.status === "PENDING").length === 0) {
                clearInterval(intervalId);
                setPolling(false);
            }
        };

        if (polling) {
            intervalId = setInterval(poll, 2000);
        }
        return () => clearInterval(intervalId);
    }, [polling]);

  return { myJobs, startPolling };
}
