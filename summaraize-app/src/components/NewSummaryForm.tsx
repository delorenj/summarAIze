import Grid from "@mui/material/Unstable_Grid2";
import {ChapterSelect} from "./ChapterSelect";
import SummaryFormContextProvider, {useSummaryFormContext} from "../contexts/SummaryFormContext";
import {SummaryFormSliderSection} from "./SummaryFormSliderSection";
import {GenerateSummaryButton} from "./GenerateSummaryButton";

export const NewSummaryForm = () => {
    return (
        <SummaryFormContextProvider>
            <Grid container my={5}>
                <SummaryFormSliderSection />
                <ChapterSelect />
                <GenerateSummaryButton />
            </Grid>
        </SummaryFormContextProvider>
    );
}
