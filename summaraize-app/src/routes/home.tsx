import React, {useContext} from 'react'
import {useNavigate} from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2'
import {AuthContext} from '../contexts/authContext'
import ResponsiveAppBar from "../components/AppBar";
import Container from "@mui/material/Container";
import StickyFooter from "../components/StickyFooter";
import {useMyData} from "../hooks/useMyData";
import {BookCard} from "../components/BookCard";

export const Home = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const {myBooks} = useMyData();

    function signOutClicked() {
        auth.signOut()
        navigate('/')
    }

    function changePasswordClicked() {
        navigate('changepassword')
    }

    return (
        <>
            <ResponsiveAppBar/>
            <main>
                <Container sx={{py: 8}} maxWidth="md">
                    <Grid container spacing={4}>
                        {myBooks.map((book) => (
                            <Grid key={book.key} xs={12} sm={6} md={4}>
                                <BookCard book={book}/>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </main>
            <StickyFooter/>
        </>)
        ;
}
