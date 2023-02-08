import {useHomeContext} from "../contexts/homeContext";
import {List, ListItem, ListItemButton} from "@mui/material";

export const SummaryList = () => {
    const {activeBook} = useHomeContext();

    return (
      <List>
          {!activeBook?.summaries && <ListItem>No summaries yet</ListItem>}
          {activeBook?.summaries?.map((summary) => (
              <ListItemButton key={summary.id}>{summary.title}</ListItemButton>
            ))}
      </List>
    );
}
