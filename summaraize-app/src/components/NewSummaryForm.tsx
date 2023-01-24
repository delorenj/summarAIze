import {useHomeContext} from "../contexts/homeContext";
import {Button, Checkbox, FormLabel, Slider, Stack} from '@mui/material';
import Grid from "@mui/material/Unstable_Grid2";
import {ChildCareTwoTone, DragHandleTwoTone, FormatAlignJustifyTwoTone, SchoolTwoTone,} from "@mui/icons-material";

export const NewSummaryForm = () => {
    const {activeBook} = useHomeContext();

    return (
        <Grid container my={5}>
            <Grid xs={6}>
                <FormLabel>Complexity</FormLabel>
            </Grid>
            <Grid xs={6}>
                <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                    <ChildCareTwoTone/>
                    <Slider/>
                    <SchoolTwoTone/>
                </Stack>
            </Grid>
            <Grid xs={6}>
                <FormLabel>Depth</FormLabel>
            </Grid>
            <Grid xs={6}>
                <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                    <DragHandleTwoTone/>
                    <Slider/>
                    <FormatAlignJustifyTwoTone/>
                </Stack>
            </Grid>
            <Grid xs={12}>
                <Checkbox /><FormLabel>Character Glossary</FormLabel>
            </Grid>
            <Grid xs={12}>
                <Button variant="contained" color='primary'>Generate summary</Button>
            </Grid>

        </Grid>
    );
}
