import { nexusPrismaPlugin } from 'nexus-prisma'
import { makeSchema, objectType, stringArg } from 'nexus'
import { Context } from './context'

const Bookings = objectType({
    name: 'Bookings',
    definition(t) {
        t.model.id()
        t.model.weeks()
        t.model.createdAt()
        t.model.updatedAt()
    },
})

const Week = objectType({
    name: 'Week',
    definition(t) {
        t.model.id()
        t.model.days()
        t.model.anchor()
        t.model.createdAt()
        t.model.updatedAt()
    },
})

const Days = objectType({
    name: 'Days',
    definition(t) {
        t.model.id()
        t.model.monday()
        t.model.tuesday()
        t.model.wednesday()
        t.model.thursday()
        t.model.friday()
        t.model.createdAt()
        t.model.updatedAt()
    },
})

const dayfields = (t: any) => {
    t.model.id()
    t.model.eighttoten()
    t.model.tentotwelve()
    t.model.twelvetotwo()
    t.model.twotofour()
    t.model.fourtosix()
    t.model.createdAt()
    t.model.updatedAt()

    return t
}

const Monday = objectType({
    name: 'Monday',
    definition(t) {
        dayfields(t)
    },
})

const Tuesday = objectType({
    name: 'Tuesday',
    definition(t) {
        dayfields(t)
    },
})

const Wednesday = objectType({
    name: 'Wednesday',
    definition(t) {
        dayfields(t)
    },
})

const Thursday = objectType({
    name: 'Thursday',
    definition(t) {
        dayfields(t)
    },
})

const Friday = objectType({
    name: 'Friday',
    definition(t) {
        dayfields(t)
    },
})

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.crud.bookings()

        t.field('fetchWeek', {
            type: 'Week',
            args: {
                date: stringArg({ nullable: false }),
            },
            // @ts-ignore
            async resolve(_, { date }, ctx: Context) {
                const response = await ctx.prisma.week.findMany({
                    where: {
                        anchor: date,
                    },
                })

                if (response.length === 0) {
                    const week = await ctx.prisma.week.create({
                        data: {
                            days: {
                                create: {
                                    monday: {
                                        create: {},
                                    },
                                    tuesday: {
                                        create: {},
                                    },
                                    wednesday: {
                                        create: {},
                                    },
                                    thursday: {
                                        create: {},
                                    },
                                    friday: {
                                        create: {},
                                    },
                                },
                            },
                            anchor: date,
                        },
                    })

                    console.log('WEEK', week)

                    return week
                }

                console.log('RESPONSE', response)

                return response
            },
        })
    },
})

export const schema = makeSchema({
    types: [
        Query,
        Bookings,
        Week,
        Days,
        Monday,
        Tuesday,
        Wednesday,
        Thursday,
        Friday,
    ],
    plugins: [nexusPrismaPlugin()],
    outputs: {
        schema: __dirname + '/schema.graphql',
        typegen: __dirname + '/generated/nexus.ts',
    },
    typegenAutoConfig: {
        contextType: 'Context.Context',
        sources: [
            {
                source: '@prisma/client',
                alias: 'prisma',
            },
            {
                source: require.resolve('./context'),
                alias: 'Context',
            },
        ],
    },
})
