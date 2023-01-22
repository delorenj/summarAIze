import {Box, Divider, Drawer, Skeleton, Typography} from "@mui/material";
import {IBook} from "../hooks/useMyData";
import {useHomeContext} from "../contexts/homeContext";
import {grey} from "@mui/material/colors";
import {styled} from "@mui/material/styles";


const StyledBox = styled(Box)(({ theme }) => ({
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
                <Typography variant={"h6"}>{activeBook?.title}</Typography>
                <Divider></Divider>
            </StyledBox>
        </Drawer>

    )
}
