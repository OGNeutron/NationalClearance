import * as React from 'react'

import { FormControlLabel, Switch } from '@material-ui/core'

import { useStore } from '../../../Contexts'

const Settings: React.FC = (): JSX.Element => {
    const { darkMode, setDarkMode } = useStore()

    // console.log('SETTINGS', darkMode, setDarkMode)

    return (
        <div>
            <h4>Settings</h4>
            <FormControlLabel
                control={
                    <Switch
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                }
                label="Dark Mode"
            />
        </div>
    )
}

export default Settings
