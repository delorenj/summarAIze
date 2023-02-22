import {Card, CardActions, CardContent, CardMedia, Typography} from "@mui/material";

import {SummaraizeDrawer} from "./SummaraizeDrawer";
import {useHomeContext} from "../contexts/homeContext";
import SummarizeTwoToneIcon from '@mui/icons-material/SummarizeTwoTone';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeTwoToneIcon from '@mui/icons-material/RemoveRedEyeTwoTone';
import { IBook } from "../types/summaraizeTypes";
interface BookCardPropsType {
    book: IBook
}

export const BookCard = (props: BookCardPropsType) => {
    const {book} = props;
    const {setActiveBook} = useHomeContext();

    return (
        <>
            <Card
                raised
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1,
                }}>
                <CardMedia
                    component="img"
                    image={book.cover}
                    alt={book.title}
                    height={undefined}
                />
                <CardContent sx={{
                    flexGrow: 1
                }}>
                    <Typography gutterBottom variant="h5" component="h2">
                        {book.title}
                    </Typography>
                </CardContent>
                <CardActions>
                    <IconButton>
                        <RemoveRedEyeTwoToneIcon />
                    </IconButton>
                    <IconButton aria-label="add to favorites">
                        <CloudDownloadTwoToneIcon/>
                    </IconButton>
                    <IconButton size="small" onClick={() => setActiveBook(book)}>
                        <SummarizeTwoToneIcon/>
                    </IconButton>
                </CardActions>
                <SummaraizeDrawer/>
            </Card>
        </>
    )
}
