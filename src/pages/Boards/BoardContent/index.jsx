import Box from '@mui/material/Box'

function BoardContent() {
  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) =>
          `calc(100vh - ${theme.trello.appBarHeight} - ${theme.trello.boardBarHeight})`,
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? '#596275' : '#9c9fc9',
        display: 'flex',
        alignItems: 'center'
      }}
    ></Box>
  )
}

export default BoardContent
