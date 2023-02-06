import {useHomeContext} from "../contexts/homeContext";
import {Button, Checkbox, FormLabel, Slider, Stack} from '@mui/material';
import Grid from "@mui/material/Unstable_Grid2";
import {ChildCareTwoTone, DragHandleTwoTone, FormatAlignJustifyTwoTone, SchoolTwoTone,} from "@mui/icons-material";
import {useAuth} from "../contexts/authContext";
import {ChapterSelect} from "./ChapterSelect";
import SummaryFormContextProvider, {useSummaryFormContext} from "../contexts/SummaryFormContext";
import {SummaryFormSliderSection} from "./SummaryFormSliderSection";

export const NewSummaryForm = () => {
    const {activeBook} = useHomeContext();
    const {sessionInfo} = useAuth();

    return (
        <SummaryFormContextProvider>
            <Grid container my={5}>
                <SummaryFormSliderSection />
                <Grid xs={12}>
                    <ChapterSelect/>
                </Grid>
                <Grid xs={12}>
                    <Checkbox/><FormLabel>Include character glossary</FormLabel>
                </Grid>
                <Grid xs={12} pt={3}>
                    <Button variant="contained" color='primary'>Generate summary</Button>
                </Grid>

            </Grid>
        </SummaryFormContextProvider>
    );
}
