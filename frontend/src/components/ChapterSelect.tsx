import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import {useHomeContext} from "../contexts/homeContext";
import {useSummaryFormContext} from "../contexts/SummaryFormContext";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import {Fade, Grow, Tooltip, tooltipClasses, TooltipProps} from "@mui/material";
import {styled} from "@mui/styles";
import {useMemo} from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const HtmlTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        border: '1px solid #dadde9',
    },
}));

export const ChapterSelect = () => {
    const {selectedChapters, setSelectedChapters, numWordsSelected} = useSummaryFormContext();
    const {activeBook} = useHomeContext();
    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: {value},
        } = event;
        setSelectedChapters(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const navigableChapters = useMemo(() => {
        return activeBook && activeBook.chapters.filter(chapter => chapter.id).length > 0;
    }, [activeBook]);

    return (
        <>
            <Grid xs={9}>
                <div>
                    <HtmlTooltip
                        disableHoverListener={navigableChapters}
                        arrow={true}
                        TransitionComponent={Grow}
                        TransitionProps={{ timeout: 600 }}                        placement="top"
                        title={
                            <>
                                <Typography color="inherit"><strong>No navigable chapters</strong></Typography>
                                {"This document has no navigable chapters. We attempted to find chapters by looking for headings and breaks, so results may vary. Each chapter is then marked by page number."}
                            </>
                        }
                    >
                        <FormControl sx={{m: 1, width: 300}}>
                            <InputLabel id="demo-multiple-checkbox-label">Include chapters</InputLabel>
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={selectedChapters}
                                onChange={handleChange}
                                input={<OutlinedInput label="Include chapters"/>}
                                renderValue={(selected) => selectedChapters.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {activeBook?.chapters?.map((chapter, index) => (
                                    <MenuItem key={chapter.id || `Page ${chapter.page}`}
                                              value={chapter.id || `Page ${chapter.page}`}>
                                        <Checkbox
                                            checked={selectedChapters.indexOf(chapter.id as unknown as string || `Page ${chapter.page}` as unknown as string) > -1}/>
                                        <ListItemText
                                            primary={chapter.title || `Chapter ${index + 1} (${chapter.page})`}
                                            secondary={chapter.firstFewWords.split(' ').slice(0, 8).join(' ')}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </HtmlTooltip>
                </div>
            </Grid>
            <Grid xs={3} margin={'auto'} alignItems={"center"} direction={"column"} justifyContent={"center"}>
                <Typography top={'50%'} textAlign={"center"} variant='subtitle2'>Words: {numWordsSelected}</Typography>
            </Grid>
        </>


    )
        ;
}
