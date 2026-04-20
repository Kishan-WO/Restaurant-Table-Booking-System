import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0",
      light: "#1E88E5",
      dark: "#0D47A1",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0288D1",
      light: "#03A9F4",
      dark: "#01579B",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F0F4FF",
      paper: "#ffffff",
    },
    text: {
      primary: "#1A237E",
      secondary: "#546E7A",
    },
    success: {
      main: "#2E7D32",
    },
    warning: {
      main: "#E65100",
    },
    error: {
      main: "#C62828",
    },
    divider: "#BBDEFB",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F0F4FF",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#1565C0",
          boxShadow: "0 1px 0 0 #BBDEFB",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
          boxShadow: "0 2px 8px rgba(21,101,192,0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)",
            boxShadow: "0 4px 12px rgba(21,101,192,0.35)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(21,101,192,0.08)",
          border: "1px solid #BBDEFB",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        outlined: {
          border: "1px solid #BBDEFB",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1565C0",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#BBDEFB",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
