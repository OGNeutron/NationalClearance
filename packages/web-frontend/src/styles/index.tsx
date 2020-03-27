import styled, { createGlobalStyle } from 'styled-components'
import { createMuiTheme } from '@material-ui/core'

export const GlobalStyle = createGlobalStyle`
        /* body: {
            background: "#e2dcdc"
        } */
        body, html {
            height: 100vh;
            font-family: 'Fira Sans', sans-serif;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        a {
            text-decoration: none
        }
    `

export const MainLayoutStyle = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    @media (max-width: 750px) {
        margin: 0;
        grid-template-columns: 0.3fr auto;
        transition: all 0.3s ease-in-out;
    }

    @media (min-width: 1024px) {
        grid-template-areas:
            'nav'
            'main';

        transition: all 0.3s ease-in-out;
    }
`

export const lightTheme = createMuiTheme({})

export const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
})
