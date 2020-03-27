import * as React from 'react'
import { Switch, Route } from 'react-router-dom'

import Home from '../modules/Home/container/Home'
import Settings from '../modules/Settings/container/Settings'
import About from '../modules/About/container/About'
import Bookings from '../modules/Bookings/container/Bookings'

const Router: React.FunctionComponent = (): JSX.Element => (
    <Switch>
        <Route exact path="/settings">
            <Settings />
        </Route>

        <Route exact path="/bookings">
            <Bookings />
        </Route>

        <Route exact path="/about">
            <About />
        </Route>

        <Route exact path="/">
            <Home />
        </Route>
    </Switch>
)

export default Router
