import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { red, blue, green, purple } from '@mui/material/colors';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: blue[500],
        },
        secondary: {
          main: green[500],
        },
        gradient: {
          main: `linear-gradient(45deg, ${blue[500]} 30%, ${purple[500]} 90%)`,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: red[400],
        },
      },
    },
  },
});
export default theme;
