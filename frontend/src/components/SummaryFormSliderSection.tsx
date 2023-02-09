import {useSummaryFormContext} from "../contexts/SummaryFormContext";
import {ChildCareTwoTone, DragHandleTwoTone, FormatAlignJustifyTwoTone, SchoolTwoTone} from "@mui/icons-material";
import {FormLabel, Slider, Stack} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

export const SummaryFormSliderSection = () => {
    const complexityMarks = [
        {
            label: '5th Grader',
            value: 25,
        },
        {
            value: 50,
        },
        {
            label: 'Grad Student',
            value: 75,
        }
    ];

    const depthMarks = [
        {
            label: 'couple sentences',
            value: 25,
        },
        {
            value: 50
        },
        {
            label: 'paragraph',
            value: 75,
        }
    ];

    const {complexity, handleSetComplexity, depth, handleSetDepth} = useSummaryFormContext();
    return (
        <>
            <Grid xs={3} pb={5}>
                <FormLabel>Complexity</FormLabel>
            </Grid>
            <Grid xs={9} pb={5}>
                <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                    <ChildCareTwoTone/>
                    <Slider min={1} max={100} step={1}
                            aria-label="complexity slider"
                            onChange={handleSetComplexity}
                            marks={complexityMarks}
                            name={"complexity"}
                            value={complexity}
                            valueLabelDisplay={"auto"}/>
                    <SchoolTwoTone/>
                </Stack>
            </Grid>
            <Grid xs={3}>
                <FormLabel>Depth</FormLabel>
            </Grid>
            <Grid xs={9} pb={3}>
                <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                    <DragHandleTwoTone/>
                    <Slider min={1} max={100} step={1}
                            aria-label="depth slider"
                            onChange={handleSetDepth}
                            marks={depthMarks}
                            name={"depth"}
                            value={depth}
                            valueLabelDisplay={"auto"}/>
                    <FormatAlignJustifyTwoTone/>
                </Stack>
            </Grid>
        </>
    )
};
