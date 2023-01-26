import {useHomeContext} from "../contexts/homeContext";
import {Button, Checkbox, FormLabel, Slider, Stack} from '@mui/material';
import Grid from "@mui/material/Unstable_Grid2";
import {ChildCareTwoTone, DragHandleTwoTone, FormatAlignJustifyTwoTone, SchoolTwoTone,} from "@mui/icons-material";
import axios from "axios";
import {useAuth} from "../contexts/authContext";
import {useState} from "react";
import Box from "@mui/material/Box";

export const NewSummaryForm = () => {
    const {activeBook} = useHomeContext();
    const {sessionInfo} = useAuth();
    const [testData, setTestData] = useState();

    const testBookMetadata = () => {

        const fetchData = async () => {
            try {
                if (!sessionInfo || !sessionInfo.accessToken) return;
                // Create the headers object with the cognito token
                const headers = {
                    'Authorization': `Bearer ${sessionInfo.idToken}`
                };

                const {data} = await axios.post(
                    'https://0ik4og60f4.execute-api.us-east-1.amazonaws.com/dev/book/metadata',
                    {bookUrl:"public/a-modern-utopia.epub"},
                    {headers}
                );
                console.log("fetchData()", data);
                setTestData(data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }
    return (
        <Grid container my={5}>
            <Grid xs={3}>
                <Box>bobobobobobobobo{JSON.stringify(testData)}</Box>
            </Grid>

            <Grid xs={3}>
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
                <Checkbox/><FormLabel>Character Glossary</FormLabel>
            </Grid>
            <Grid xs={12}>
                <Button variant="contained" color='primary' onClick={testBookMetadata}>Generate summary [TEST]</Button>
            </Grid>

        </Grid>
    );
}
