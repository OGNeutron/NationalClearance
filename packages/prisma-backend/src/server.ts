import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { createContext } from './context'

new ApolloServer({
    schema,
    context: createContext(),
    playground: true,
}).listen({ port: 4000 }, () =>
    console.log('🚀 Server ready at: http://localhost:4000\n⭐️'),
)
