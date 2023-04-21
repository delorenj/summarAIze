import React from "react";
import { useDocViewContext } from "../contexts/docViewContext";
import { ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";

export interface ActionRowProps {
  image: string;
  name: string;
  title: string;
  children?: string; // Allow the use of a child string element
}

export const ActionRow: React.FC<ActionRowProps> = (props) => {
  const { image, name, title, children } = props; // Destructure the props
  const { bookDetails } = useDocViewContext();

  return (
    <ListItem sx={{marginY: '8px', borderColor: 'antiquewhite', borderStyle: 'solid', borderWidth: '2px', borderRadius: '4px', backgroundColor: 'cornsilk', width: 'fit-content'}}>
      {/*<ListItemAvatar>*/}
      {/*  <Avatar src={image} alt={name} sx={{width: '30px', height: '30px'}}/> /!* Use the 'image' and 'name' props *!/*/}
      {/*</ListItemAvatar>*/}
      <ListItemText
        primary={title}
        secondary={children}// Use the 'name' prop as the primary text
      />
    </ListItem>
  );
};
