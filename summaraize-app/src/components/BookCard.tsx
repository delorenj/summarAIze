import {Button, Card, CardActions, CardContent, CardMedia, Typography} from "@mui/material";
import {IBook} from "../hooks/useMyData";
import {blue} from "@mui/material/colors";

interface BookCardPropsType {
    book: IBook
}

export const BookCard = (props: BookCardPropsType) => {
    const {book} = props;

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <CardMedia
                component="img"
                image={book.cover}
                alt={book.title}
            />
            <CardContent sx={{
                flexGrow: 1
            }}>
                <Typography gutterBottom variant="h5" component="h2">
                    {book.title}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">Original</Button>
                <Button size="small">Summary</Button>
            </CardActions>
        </Card>
    )
}
