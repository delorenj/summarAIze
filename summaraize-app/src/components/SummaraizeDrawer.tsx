import {Box, Drawer, Skeleton} from "@mui/material";
import {IBook} from "../hooks/useMyData";
import {useHomeContext} from "../contexts/homeContext";
import {grey} from "@mui/material/colors";
import {styled} from "@mui/material/styles";


const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

export const SummaraizeDrawer = () => {
    const {summaraizeDrawerOpen, setSummaraizeDrawerOpen} = useHomeContext();

    return (
        <Drawer
            open={summaraizeDrawerOpen}
            onClose={() => (setSummaraizeDrawerOpen(false))}
        >
            <StyledBox
                sx={{
                    px: 2,
                    pb: 2,
                    height: '100%',
                    overflow: 'auto',
                }}
            >
                <Skeleton variant="rectangular" width="100px" height="100%"/>
            </StyledBox>
        </Drawer>

    )
}
