import {useHomeContext} from "../contexts/homeContext";
import {List, ListItem, ListItemButton} from "@mui/material";

export const SummaryList = () => {
    const {activeBook} = useHomeContext();

    return (
      <List>
          <ListItemButton>Summary 1</ListItemButton>
          <ListItemButton>Summary 2</ListItemButton>
          <ListItemButton>Summary 3</ListItemButton>
      </List>
    );
}
