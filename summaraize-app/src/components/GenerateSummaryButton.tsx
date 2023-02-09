import {Button} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {useSummaryFormContext} from "../contexts/SummaryFormContext";

export const GenerateSummaryButton = () => {
    const {onGenerateSummary} = useSummaryFormContext();

    return (
        <Grid xs={12} pt={3}>
            <Button variant="contained" color='primary' onClick={onGenerateSummary}>Generate summary</Button>
        </Grid>

    )
};
