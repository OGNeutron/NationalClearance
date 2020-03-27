import * as React from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import {
    TableContainer,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
} from '@material-ui/core'
import Moment from 'react-moment'
import moment from 'moment'

const checkDate = (date: number, bool: boolean) => {
    if (bool) {
        if (moment().isoWeekday() > date) {
            return moment()
                .subtract(moment().isoWeekday() - date, 'days')
                .format('LL')

            //     (
            //     <Moment
            //         format="LL"
            //         subtract={{ days: moment().isoWeekday() - date }}
            //     ></Moment>,
            // )
        } else {
            return moment()
                .add(date - moment().isoWeekday(), 'days')
                .format('LL')
        }
    }

    if (moment().isoWeekday() > date) {
        return (
            <Moment
                format="LL"
                subtract={{ days: moment().isoWeekday() - date }}
            ></Moment>
        )
    } else {
        return (
            <Moment
                format="LL"
                add={{ days: date - moment().isoWeekday() }}
            ></Moment>
        )
    }
}

const FETCH_WEEKS = gql`
    query FetchWeek($date: String!) {
        fetchWeek(date: $date) {
            id
            days {
                monday {
                    eighttoten
                    tentotwelve
                    twelvetotwo
                    twotofour
                    fourtosix
                }
                tuesday {
                    eighttoten
                    tentotwelve
                    twelvetotwo
                    twotofour
                    fourtosix
                }
                wednesday {
                    eighttoten
                    tentotwelve
                    twelvetotwo
                    twotofour
                    fourtosix
                }
                thursday {
                    eighttoten
                    tentotwelve
                    twelvetotwo
                    twotofour
                    fourtosix
                }
                friday {
                    eighttoten
                    tentotwelve
                    twelvetotwo
                    twotofour
                    fourtosix
                }
            }
        }
    }
`

const openOrBooked = (array: any[], index: number) => {
    return array[index] ? (
        <TableCell>Booked</TableCell>
    ) : (
        <TableCell>Open</TableCell>
    )
}

const Bookings: React.FC = (): JSX.Element => {
    const { loading, data } = useQuery(FETCH_WEEKS, {
        variables: {
            date: 'March 23, 2020',
        },
    })

    console.log(data)

    if (loading) {
        return <div>Loading</div>
    } else {
        const monday = Object.values(data.fetchWeek.days.monday)
        const tuesday = Object.values(data.fetchWeek.days.tuesday)
        const wednesday = Object.values(data.fetchWeek.days.wednesday)
        const thursday = Object.values(data.fetchWeek.days.thursday)
        const friday = Object.values(data.fetchWeek.days.friday)

        console.log(friday)

        return (
            <div>
                <h2>Bookings</h2>
                <br />
                <h4>Available times</h4>

                <TableContainer>
                    <Table aria-label="schedule table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <h3>Times/Dates</h3>
                                </TableCell>
                                <TableCell>
                                    {checkDate(1, false)}
                                    <h3>Monday</h3>
                                </TableCell>
                                <TableCell>
                                    {checkDate(2, false)}
                                    <h3>Tuesday</h3>
                                </TableCell>
                                <TableCell>
                                    {checkDate(3, false)}
                                    <h3>Wednesday</h3>
                                </TableCell>
                                <TableCell>
                                    {checkDate(4, false)}
                                    <h3>Thursday</h3>
                                </TableCell>
                                <TableCell>
                                    {checkDate(5, false)}
                                    <h3>Friday</h3>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>8 - 10</TableCell>
                                {openOrBooked(monday, 0)}
                                {openOrBooked(tuesday, 0)}
                                {openOrBooked(wednesday, 0)}
                                {openOrBooked(thursday, 0)}
                                {openOrBooked(friday, 0)}
                            </TableRow>
                            <TableRow>
                                <TableCell>10 - 12</TableCell>
                                {openOrBooked(monday, 1)}
                                {openOrBooked(tuesday, 1)}
                                {openOrBooked(wednesday, 1)}
                                {openOrBooked(thursday, 1)}
                                {openOrBooked(friday, 1)}
                            </TableRow>
                            <TableRow>
                                <TableCell>12 - 14</TableCell>
                                {openOrBooked(monday, 2)}
                                {openOrBooked(tuesday, 2)}
                                {openOrBooked(wednesday, 2)}
                                {openOrBooked(thursday, 2)}
                                {openOrBooked(friday, 2)}
                            </TableRow>
                            <TableRow>
                                <TableCell>14 - 16</TableCell>
                                {openOrBooked(monday, 3)}
                                {openOrBooked(tuesday, 3)}
                                {openOrBooked(wednesday, 3)}
                                {openOrBooked(thursday, 3)}
                                {openOrBooked(friday, 3)}
                            </TableRow>
                            <TableRow>
                                <TableCell>16 - 18</TableCell>
                                {openOrBooked(monday, 4)}
                                {openOrBooked(tuesday, 4)}
                                {openOrBooked(wednesday, 4)}
                                {openOrBooked(thursday, 4)}
                                {openOrBooked(friday, 4)}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }
}

export default Bookings
