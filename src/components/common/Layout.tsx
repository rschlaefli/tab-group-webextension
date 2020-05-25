import React from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'

interface IProps {
  children: React.ReactChildren | React.ReactChild
}

function Layout({ children }: IProps): React.ReactElement {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  )

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default Layout
