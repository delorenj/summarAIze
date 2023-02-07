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

    return (
        <>
            <Grid xs={9}>
                <div>
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
                                <MenuItem key={chapter.id} value={chapter.id}>
                                    <Checkbox checked={selectedChapters.indexOf(chapter.id) > -1}/>
                                    <ListItemText primary={chapter.title || chapter.id}
                                                  secondary={chapter.firstFewWords.split(' ').slice(0, 8).join(' ')}/>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </Grid>
            <Grid xs={3} alignItems={"center"} direction={"column"} justifyContent={"center"}>
                <Typography variant='subtitle2'>Words: {numWordsSelected}</Typography>
            </Grid>
        </>


    )
        ;
}
