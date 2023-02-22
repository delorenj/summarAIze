import {useHomeContext} from "../contexts/homeContext";
import {List, ListItem, ListItemButton} from "@mui/material";
import { JobStatus } from "../types/summaraizeTypes";

export const SummaryList = () => {
    const {activeBook} = useHomeContext();

    return (
      <List>
          {!activeBook?.summaries && <ListItem>No summaries yet</ListItem>}
          {activeBook?.summaries?.filter(summary => summary.status === JobStatus.COMPLETED).map(summary => (
              <ListItemButton key={summary.jobId}>{summary.createdAt}</ListItemButton>
            ))}
      </List>
    );
}
