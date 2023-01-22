import {Button, Card, CardActions, CardContent, CardMedia, CssBaseline, Skeleton, Typography} from "@mui/material";
import {IBook} from "../hooks/useMyData";
import {useState} from "react";

import {SummaraizeDrawer} from "./SummaraizeDrawer";
import {useHomeContext} from "../contexts/homeContext";

interface BookCardPropsType {
    book: IBook
}

export const BookCard = (props: BookCardPropsType) => {
    const {book} = props;
    const {summaraizeDrawerOpen, setSummaraizeDrawerOpen} = useHomeContext();

    return (
        <>
            <Card sx={{
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
                    <Button size="small" onClick={() => setSummaraizeDrawerOpen(!summaraizeDrawerOpen)}>Summary</Button>
                </CardActions>
                <SummaraizeDrawer  />
            </Card>
        </>
    )
}
