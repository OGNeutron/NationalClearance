import * as React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from '../modules/Home/container/Home'

const Router: React.FunctionComponent = (): JSX.Element => (
    <Switch>
        <Route path="/">
            <Home />
        </Route>
    </Switch>
)

export default Router
