import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2'
import { AuthContext } from '../contexts/authContext'
import ResponsiveAppBar from '../components/AppBar'
import Container from '@mui/material/Container'
import StickyFooter from '../components/StickyFooter'
import { useMyData } from '../hooks/useMyData'
import { BookCard } from '../components/BookCard'
import HomeContextProvider from '../contexts/homeContext'
import { Button, Stack } from '@mui/material'
import { Add } from '@mui/icons-material'
import { IBook } from "../types/summaraizeTypes";

export const Home = () => {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const { myBooks } = useMyData({ skipCache: true })

  function signOutClicked() {
    auth.signOut()
    navigate('/')
  }

  function changePasswordClicked() {
    navigate('changepassword')
  }

  const addBookClicked = () => {
    navigate('upload')
  }

  const onBookClicked = (book: IBook) => {
    console.log(book)
    navigate(`doc/${book.bookId}`.replace(/"/g, ''))
  }
  return (
    <HomeContextProvider>
      <ResponsiveAppBar />
      <main>
        <Container sx={{ py: 3 }}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Stack direction={'row'}>
                <Button
                  variant="contained"
                  color={'secondary'}
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={addBookClicked}>
                  <Add />
                  Add Book
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Grid container spacing={4}>
            {myBooks.map((book) => (
              <Grid key={book.bookId} xs={12} sm={6} md={4} onClick={() => onBookClicked(book)}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      <StickyFooter />
    </HomeContextProvider>
  )
}
