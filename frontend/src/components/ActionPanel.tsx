import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  List,
  ListItemButton,
  Grid,
  Link,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/ChatTwoTone";
import ArticleIcon from "@mui/icons-material/Article";
import BlurLinearIcon from "@mui/icons-material/BlurLinear";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import { useDocViewContext } from "../contexts/docViewContext";
import { cyan, deepOrange, green, pink } from "@mui/material/colors";

export const ActionPanel: React.FC = () => {
  const { bookDetails } = useDocViewContext();

  const data = [
    {
      title: "Chapter Summary",
      url: "#",
      Icon: ArticleIcon,
      color: pink[500],
    },
    {
      title: "Spoiler Free Summary",
      url: "#",
      Icon: BlurLinearIcon,
      color: cyan[500],
    },
    {
      title: "Character Glossary",
      url: "#",
      Icon: CoPresentIcon,
      color: deepOrange[500],
    },
    {
      title: "Chapter Chat",
      url: "#",
      Icon: ChatIcon,
      color: green[500],
    },
  ];
  return (
    <Box sx={{ maxWidth: '80%', margin: 0 }}>
      <Grid container spacing={4}>
        {data.map((item, index) => (
          <Grid item key={index} xs={12} sm={6}>
            <Stack direction="row" >
              <item.Icon sx={{ color: item.color, marginRight: "10px" }} />
              <Link href={item.url} underline="none">
                {item.title}
              </Link>
            </Stack>
          {index < data.length - 1 && (
            <Divider orientation="horizontal" sx={{ my: 2 }} />
          )}          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
