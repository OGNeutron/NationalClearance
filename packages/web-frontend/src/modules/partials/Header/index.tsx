import * as React from 'react'
// import { MainHeader } from './components/HeaderStyle'
import { AppBar, Typography, Button, Toolbar } from '@material-ui/core'
import { Link } from 'react-router-dom'
// import IconButton from '@material-ui/core/IconButton'
// import MenuIcon from '@material-ui/icons/Menu'
import InfoIcon from '@material-ui/icons/Info'
import SettingsIcon from '@material-ui/icons/Settings'
import BookIcon from '@material-ui/icons/Book'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        color: 'white',
    },
    a: {
        color: 'white',
    },
}))

const Header: React.FunctionComponent = (): JSX.Element => {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        <Link to="/" style={{ color: 'white' }}>
                            National Clearance
                        </Link>
                    </Typography>

                    <Button component={Link} to="/bookings" color="inherit">
                        <BookIcon />
                    </Button>

                    <Button component={Link} to="/settings" color="inherit">
                        <SettingsIcon />
                    </Button>

                    <Button component={Link} to="/about" color="inherit">
                        <InfoIcon />
                    </Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Header
