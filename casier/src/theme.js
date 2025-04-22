import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Bleu doux
    },
    secondary: {
      main: '#f50057', // Rose léger
    },
    background: {
      default: '#f5f5f5', // Fond général clair
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Garde la casse normale
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Cartes arrondies
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
