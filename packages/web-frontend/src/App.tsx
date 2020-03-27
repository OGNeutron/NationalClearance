import React from 'react'

import { Container, makeStyles } from '@material-ui/core'
import { Helmet } from 'react-helmet'

import Router from './router'
import Header from './modules/partials/Header'

// import { MainLayoutStyle } from './styles'
import { withThemeProvider } from './Contexts'

const useStyles = makeStyles(theme => ({
    container: {
        marginTop: '2rem',
    },
}))

function App() {
    const classes = useStyles()

    // const { darkMode } = useStore()
    // const darkMode = React.useContext(Context)
    // console.log('DARK MODE', darkMode)

    // const theme = darkMode ? darkTheme : lightTheme

    // console.log(darkTheme)

    return (
        <>
            {/* <MainLayoutStyle className="App"> */}
            <Helmet>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
            </Helmet>
            <Header />
            <Container className={classes.container}>
                <Router />
            </Container>
            {/* </MainLayoutStyle> */}
        </>
    )
}

export default withThemeProvider(App)
