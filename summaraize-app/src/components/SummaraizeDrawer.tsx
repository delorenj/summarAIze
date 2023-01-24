import {Box, Divider, Drawer, Typography} from "@mui/material";
import {useHomeContext} from "../contexts/homeContext";
import {grey} from "@mui/material/colors";
import {styled} from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import {MetadataEntry} from "./MetadataEntry";
import {JobStatus} from "./JobStatus";
import {SummaryList} from "./SummaryList";
import {NewSummaryForm} from "./NewSummaryForm";


const StyledBox = styled(Box)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

export const SummaraizeDrawer = () => {
    const {summaraizeDrawerOpen, setActiveBook, activeBook} = useHomeContext();

    return (
        <Drawer
            open={summaraizeDrawerOpen}
            onClose={() => (setActiveBook(undefined))}
        >
            <StyledBox
                sx={{
                    px: 5,
                    py: 10,
                    height: '100%',
                    overflow: 'auto',
                }}
            >
                <Typography variant={"h6"}>Summarize</Typography>
                <Divider textAlign='left'>Media</Divider>
                <Typography variant={"subtitle2"} mt={5}>{activeBook?.title}</Typography>
                <Grid container spacing={1} mb={5}>
                    <MetadataEntry k="Chapters" v={43}></MetadataEntry>
                    <MetadataEntry k="Size" v={activeBook?.sizeInMB + "MB"}></MetadataEntry>
                    <MetadataEntry k="Summaries" v={0}></MetadataEntry>
                    <MetadataEntry k="Active Jobs" v={<JobStatus />}></MetadataEntry>
                </Grid>
                <Divider textAlign='left'>Create a new summary</Divider>
                <NewSummaryForm />
                <Divider textAlign='left'>Summaries</Divider>
                <SummaryList/>
            </StyledBox>
        </Drawer>

    )
}
