import * as React from 'react'
import { CssBaseline, MuiThemeProvider } from '@material-ui/core'
import { darkTheme, lightTheme, GlobalStyle } from '../styles'

interface ContextProps {
    darkMode: boolean
    setDarkMode(darkMode: boolean): void
}

interface Props {
    children?: React.ReactNode
}

const Context = React.createContext<ContextProps>({
    darkMode: false,
    setDarkMode: () => {},
})

function useLocalStorage(key = 'darkMode', intialValue = false) {
    const [storedValue, setStoredValue] = React.useState(() => {
        try {
            const item = window.localStorage.getItem(key)

            return item ? JSON.parse(item) : intialValue
        } catch (error) {
            console.log(error)
            return intialValue
        }
    })

    // const useSetValue = React.useCallback(
    //     value => {
    const setValue = (value: any) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value

            setStoredValue(valueToStore)

            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.log(error)
        }
    }

    //     [storedValue],
    // )

    return [storedValue, setValue]
}

const Provider: React.FC<Props> = ({ children }) => {
    const [darkMode, setDarkMode] = useLocalStorage('darkMode', false)
    return (
        <Context.Provider
            value={{
                darkMode,
                setDarkMode,
            }}
        >
            {children}
        </Context.Provider>
    )
}

export const useStore = () => React.useContext(Context)

export function withProvider(Component: any) {
    return function WrapperComponent(props: any) {
        return (
            <Provider>
                <Component {...props} />
            </Provider>
        )
    }
}

export const useApp = () => {
    const { darkMode, setDarkMode } = useStore()
    return {
        darkMode,
        setDarkMode,
    }
}

export function withThemeProvider(Component: any) {
    const WrapperComponent = ({ props }: any) => {
        const { darkMode } = useApp()
        console.log('WITHTHEME', darkMode)
        // const theme =
        // console.log('THEME', theme)
        return (
            <MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
                <GlobalStyle />
                <CssBaseline />
                <Component {...props} />
            </MuiThemeProvider>
        )
    }
    return withProvider(WrapperComponent)
}

export { Context, Provider }
