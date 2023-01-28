import Box from "@mui/material/Box";

export const DragDropBox = () => {
    return (
     <Box sx={{
         border: '3px dashed #FeFeFe',
         borderRadius: '.6rem',
         position: 'absolute',
         left: '50%',
         top: '50%',
         transform: 'translateX(-176px)',
         padding: '10px'
     }}>Drop docs here</Box>
    )
};
