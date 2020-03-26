import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'

@Module({
    imports: [
        GraphQLModule.forRoot({
            playground: true,
            debug: true,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
