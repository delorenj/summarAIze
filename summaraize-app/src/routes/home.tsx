import React, {useContext} from 'react'

import {useNavigate} from 'react-router-dom'

import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'

import {AuthContext} from '../contexts/authContext'
import ResponsiveAppBar from "../components/AppBar";
import {Card, CardActions, CardContent, CardMedia} from "@mui/material";
import Container from "@mui/material/Container";
import StickyFooter from "../components/StickyFooter";

export const Home = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    function signOutClicked() {
        auth.signOut()
        navigate('/')
    }

    function changePasswordClicked() {
        navigate('changepassword')
    }

    const cards = [
        1, 2, 3, 4, 5, 6, 7
    ];

    return (
        <>
            <ResponsiveAppBar/>
            <main>
                <Container sx={{py: 8}} maxWidth="md">
                    <Grid container spacing={4}>
                        {cards.map((card) => (
                            <Grid key={card} xs={12} sm={6} md={4}>
                                <Card
                                    sx={{height: '100%', display: 'flex', flexDirection: 'column'}}
                                >
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            // 16:9
                                            pt: '10.25%',
                                        }}
                                        image="https://source.unsplash.com/random"
                                        alt="random"
                                    />
                                    <CardContent sx={{flexGrow: 1}}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            Heading
                                        </Typography>
                                        <Typography>
                                            This is a media card. You can use this section to describe the
                                            content.
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small">Original</Button>
                                        <Button size="small">Summary</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </main>
            <StickyFooter/>
        </>)
        ;
}
