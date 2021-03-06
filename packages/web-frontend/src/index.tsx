import React from 'react'
import ReactDOM from 'react-dom'
import ApolloClient from 'apollo-boost'

import { ApolloProvider } from '@apollo/react-hooks'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'
import * as serviceWorker from './serviceWorker'

const apolloClient = new ApolloClient({
    uri: 'https://national-clearance.herokuapp.com/graphql',
})

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={apolloClient}>
            <Router>
                <App />
            </Router>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
