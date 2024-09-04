import Box from '@mui/material/Box'
import Column from './Column/column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import AddBoxIcon from '@mui/icons-material/AddBox'

function ListColumns() {
  return (
    <Box
      sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hilden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}
    >
      <Column />
      <Column />
      {/* Box add new column CTA*/}
      <Box
        sx={{
          minWidth: '180px',
          maxWidth: '200px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#0000003d' : '##ffffff3d',
          mx: 2,
          borderRadius: '6px',
          height: 'fit-content'
        }}
      >
        <Button
          startIcon={<AddBoxIcon />}
          sx={{
            color: 'white',
            width: '100%',
            justifyContent: 'flex-start',
            pl: '2.5',
            py: '1'
          }}
        >
          Add new column
        </Button>
      </Box>
    </Box>
  )
}

export default ListColumns
