import { Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'

interface MetadataEntryProps {
  k: string
  v: any
}

export const MetadataEntry = (props: MetadataEntryProps) => {
  return (
    <>
      <Grid xs={4}>
        <Typography variant={'body2'} color={'GrayText'}>
          {props.k}
        </Typography>
      </Grid>
      <Grid xs={8}>{typeof props.v === 'string' ? <Typography variant={'body2'}>{props.v}</Typography> : props.v}</Grid>
    </>
  )
}
