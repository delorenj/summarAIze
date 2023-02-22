import { useDocViewContext } from '../contexts/docViewContext'
import {Typography} from "@mui/material";


export const DocNavigator = () => {
  const { bookDetails } = useDocViewContext()

  return bookDetails ? (
    <>
      <Typography variant="h1">This Book is Boh</Typography>
    </>
  ) : null
}
