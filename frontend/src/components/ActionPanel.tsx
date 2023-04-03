import React, { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { ISummaryJobStatus } from "../types/summaraizeTypes";
import { useDocViewContext } from "../contexts/docViewContext";
import PreviewIcon from "@mui/icons-material/Preview";
import { SummaryView } from "./SummaryView";
import { List, ListItemButton } from "@mui/material";
import { ActionRow } from "./ActionRow";

export const ActionPanel: React.FC = () => {
  const { bookDetails } = useDocViewContext()

  return (
    <List>
      <ActionRow image='/action01.png' name='chapterSummary' title='Chapter Summary'>Get a full summary of a one or more chapters</ActionRow>
      <ActionRow image='/action02.png' name='recap' title='Spoiler-free Recap'>Get a full, spoiler-free recap up to any chapter</ActionRow>
      <ActionRow image='/action03.png' name='characterGlossary' title='Character Glossary'>Get a full character glossary of all major characters in the document</ActionRow>

    </List>
  )
}
