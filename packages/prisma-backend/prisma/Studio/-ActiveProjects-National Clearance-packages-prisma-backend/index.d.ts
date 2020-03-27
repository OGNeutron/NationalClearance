import {
  DMMF,
  DMMFClass,
  Engine,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from './runtime';

export { PrismaClientKnownRequestError }
export { PrismaClientUnknownRequestError }
export { PrismaClientRustPanicError }
export { PrismaClientInitializationError }
export { PrismaClientValidationError }

/**
 * Query Engine version: latest
 */

/**
 * Utility Types
 */

/**
 * Get the type of the value, that the Promise holds.
 */
export declare type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

/**
 * Get the return type of a function which returns a Promise.
 */
export declare type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>


export declare type Enumerable<T> = T | Array<T>;
export declare type MergeTruthyValues<R extends object, S extends object> = {
  [key in keyof S | keyof R]: key extends false ? never : key extends keyof S ? S[key] extends false ? never : S[key] : key extends keyof R ? R[key] : never;
};
export declare type CleanupNever<T> = {
  [key in keyof T]: T[key] extends never ? never : key;
}[keyof T];
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export declare type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never;
};
declare class PrismaClientFetcher {
  private readonly prisma;
  private readonly debug;
  private readonly hooks?;
  constructor(prisma: PrismaClient<any, any>, debug?: boolean, hooks?: Hooks | undefined);
  request<T>(document: any, dataPath?: string[], rootField?: string, typeName?: string, isList?: boolean, callsite?: string, collectTimestamps?: any): Promise<T>;
  sanitizeMessage(message: string): string;
  protected unpack(document: any, data: any, path: string[], rootField?: string, isList?: boolean): any;
}


/**
 * Client
**/


export type Datasources = {
  db?: string
}

export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

export interface PrismaClientOptions {
  datasources?: Datasources

  /**
   * @default "pretty"
   */
  errorFormat?: ErrorFormat

  log?: Array<LogLevel | LogDefinition>

  /**
   * You probably don't want to use this. `__internal` is used by internal tooling.
   */
  __internal?: {
    debug?: boolean
    hooks?: Hooks
    engine?: {
      cwd?: string
      binaryPath?: string
    }
    measurePerformance?: boolean
  }

  /**
   * Useful for pgbouncer
   */
  forceTransactions?: boolean
}

export type Hooks = {
  beforeRequest?: (options: {query: string, path: string[], rootField?: string, typeName?: string, document: any}) => any
}

/* Types for Logging */
export type LogLevel = 'info' | 'query' | 'warn'
export type LogDefinition = {
  level: LogLevel
  emit: 'stdout' | 'event'
}

export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
export type GetEvents<T extends Array<LogLevel | LogDefinition>> = GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]>

export type QueryEvent = {
  timestamp: Date
  query: string
  params: string
  duration: number
  target: string
}

export type LogEvent = {
  timestamp: Date
  message: string
  target: string
}
/* End Types for Logging */

// tested in getLogLevel.test.ts
export declare function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js (ORM replacement)
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Bookings
 * const bookings = await prisma.bookings.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md).
 */
export declare class PrismaClient<T extends PrismaClientOptions = {}, U = keyof T extends 'log' ? T['log'] extends Array<LogLevel | LogDefinition> ? GetEvents<T['log']> : never : never> {
  /**
   * @private
   */
  private fetcher;
  /**
   * @private
   */
  private readonly dmmf;
  /**
   * @private
   */
  private connectionPromise?;
  /**
   * @private
   */
  private disconnectionPromise?;
  /**
   * @private
   */
  private readonly engineConfig;
  /**
   * @private
   */
  private readonly measurePerformance;
  /**
   * @private
   */
  private engine: Engine;
  /**
   * @private
   */
  private errorFormat: ErrorFormat;

  /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js (ORM replacement)
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Bookings
   * const bookings = await prisma.bookings.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md).
   */
  constructor(optionsArg?: T);
  on<V extends U>(eventType: V, callback: V extends never ? never : (event: V extends 'query' ? QueryEvent : LogEvent) => void): void;
  /**
   * Connect with the database
   */
  connect(): Promise<void>;
  /**
   * @private
   */
  private runDisconnect;
  /**
   * Disconnect from the database
   */
  disconnect(): Promise<any>;
  /**
   * Makes a raw query
   * @example
   * ```
   * // Fetch all entries from the `User` table
   * const result = await prisma.raw`SELECT * FROM User;`
   * // Or
   * const result = await prisma.raw('SELECT * FROM User;')
   * 
   * // With parameters use prisma.raw``, values will be escaped automatically
   * const userId = '1'
   * const result = await prisma.raw`SELECT * FROM User WHERE id = ${userId};`
  * ```
  * 
  * Read more in our [docs](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#raw-database-access).
  */
  raw<T = any>(query: string | TemplateStringsArray, ...values: any[]): Promise<T>;

  /**
   * `prisma.bookings`: Exposes CRUD operations for the **Bookings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bookings
    * const bookings = await prisma.bookings.findMany()
    * ```
    */
  get bookings(): BookingsDelegate;

  /**
   * `prisma.week`: Exposes CRUD operations for the **Week** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Weeks
    * const weeks = await prisma.week.findMany()
    * ```
    */
  get week(): WeekDelegate;

  /**
   * `prisma.days`: Exposes CRUD operations for the **Days** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Days
    * const days = await prisma.days.findMany()
    * ```
    */
  get days(): DaysDelegate;

  /**
   * `prisma.monday`: Exposes CRUD operations for the **Monday** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Mondays
    * const mondays = await prisma.monday.findMany()
    * ```
    */
  get monday(): MondayDelegate;

  /**
   * `prisma.tuesday`: Exposes CRUD operations for the **Tuesday** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tuesdays
    * const tuesdays = await prisma.tuesday.findMany()
    * ```
    */
  get tuesday(): TuesdayDelegate;

  /**
   * `prisma.wednesday`: Exposes CRUD operations for the **Wednesday** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Wednesdays
    * const wednesdays = await prisma.wednesday.findMany()
    * ```
    */
  get wednesday(): WednesdayDelegate;

  /**
   * `prisma.thursday`: Exposes CRUD operations for the **Thursday** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Thursdays
    * const thursdays = await prisma.thursday.findMany()
    * ```
    */
  get thursday(): ThursdayDelegate;

  /**
   * `prisma.friday`: Exposes CRUD operations for the **Friday** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Fridays
    * const fridays = await prisma.friday.findMany()
    * ```
    */
  get friday(): FridayDelegate;
}



/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export declare const OrderByArg: {
  asc: 'asc',
  desc: 'desc'
};

export declare type OrderByArg = (typeof OrderByArg)[keyof typeof OrderByArg]



/**
 * Model Bookings
 */

export type Bookings = {
  id: number
  createdAt: Date
  updatedAt: Date
}

export type BookingsScalars = 'id' | 'createdAt' | 'updatedAt'
  

export type BookingsSelect = {
  id?: boolean
  weeks?: boolean | FindManyWeekSelectArgsOptional
  createdAt?: boolean
  updatedAt?: boolean
}

export type BookingsInclude = {
  weeks?: boolean | FindManyWeekIncludeArgsOptional
}

type BookingsDefault = {
  id: true
  createdAt: true
  updatedAt: true
}


export type BookingsGetSelectPayload<S extends boolean | BookingsSelect> = S extends true
  ? Bookings
  : S extends BookingsSelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends BookingsScalars
        ? Bookings[P]
        : P extends 'weeks'
        ? Array<WeekGetSelectPayload<ExtractFindManyWeekSelectArgs<S[P]>>>
        : never
    }
   : never

export type BookingsGetIncludePayload<S extends boolean | BookingsInclude> = S extends true
  ? Bookings
  : S extends BookingsInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<BookingsDefault, S>>]: P extends BookingsScalars
        ? Bookings[P]
        : P extends 'weeks'
        ? Array<WeekGetIncludePayload<ExtractFindManyWeekIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface BookingsDelegate {
  /**
   * Find zero or one Bookings.
   * @param {FindOneBookingsArgs} args - Arguments to find a Bookings
   * @example
   * // Get one Bookings
   * const bookings = await prisma.bookings.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneBookingsArgs>(
    args: Subset<T, FindOneBookingsArgs>
  ): T extends FindOneBookingsArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneBookingsSelectArgs ? Promise<BookingsGetSelectPayload<ExtractFindOneBookingsSelectArgs<T>> | null>
  : T extends FindOneBookingsIncludeArgs ? Promise<BookingsGetIncludePayload<ExtractFindOneBookingsIncludeArgs<T>> | null> : BookingsClient<Bookings | null>
  /**
   * Find zero or more Bookings.
   * @param {FindManyBookingsArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Bookings
   * const bookings = await prisma.bookings.findMany()
   * 
   * // Get first 10 Bookings
   * const bookings = await prisma.bookings.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const bookingsWithIdOnly = await prisma.bookings.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyBookingsArgs>(
    args?: Subset<T, FindManyBookingsArgs>
  ): T extends FindManyBookingsArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyBookingsSelectArgs
  ? Promise<Array<BookingsGetSelectPayload<ExtractFindManyBookingsSelectArgs<T>>>> : T extends FindManyBookingsIncludeArgs
  ? Promise<Array<BookingsGetIncludePayload<ExtractFindManyBookingsIncludeArgs<T>>>> : Promise<Array<Bookings>>
  /**
   * Create a Bookings.
   * @param {BookingsCreateArgs} args - Arguments to create a Bookings.
   * @example
   * // Create one Bookings
   * const user = await prisma.bookings.create({
   *   data: {
   *     // ... data to create a Bookings
   *   }
   * })
   * 
  **/
  create<T extends BookingsCreateArgs>(
    args: Subset<T, BookingsCreateArgs>
  ): T extends BookingsCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends BookingsSelectCreateArgs ? Promise<BookingsGetSelectPayload<ExtractBookingsSelectCreateArgs<T>>>
  : T extends BookingsIncludeCreateArgs ? Promise<BookingsGetIncludePayload<ExtractBookingsIncludeCreateArgs<T>>> : BookingsClient<Bookings>
  /**
   * Delete a Bookings.
   * @param {BookingsDeleteArgs} args - Arguments to delete one Bookings.
   * @example
   * // Delete one Bookings
   * const user = await prisma.bookings.delete({
   *   where: {
   *     // ... filter to delete one Bookings
   *   }
   * })
   * 
  **/
  delete<T extends BookingsDeleteArgs>(
    args: Subset<T, BookingsDeleteArgs>
  ): T extends BookingsDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends BookingsSelectDeleteArgs ? Promise<BookingsGetSelectPayload<ExtractBookingsSelectDeleteArgs<T>>>
  : T extends BookingsIncludeDeleteArgs ? Promise<BookingsGetIncludePayload<ExtractBookingsIncludeDeleteArgs<T>>> : BookingsClient<Bookings>
  /**
   * Update one Bookings.
   * @param {BookingsUpdateArgs} args - Arguments to update one Bookings.
   * @example
   * // Update one Bookings
   * const bookings = await prisma.bookings.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends BookingsUpdateArgs>(
    args: Subset<T, BookingsUpdateArgs>
  ): T extends BookingsUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends BookingsSelectUpdateArgs ? Promise<BookingsGetSelectPayload<ExtractBookingsSelectUpdateArgs<T>>>
  : T extends BookingsIncludeUpdateArgs ? Promise<BookingsGetIncludePayload<ExtractBookingsIncludeUpdateArgs<T>>> : BookingsClient<Bookings>
  /**
   * Delete zero or more Bookings.
   * @param {BookingsDeleteManyArgs} args - Arguments to filter Bookings to delete.
   * @example
   * // Delete a few Bookings
   * const { count } = await prisma.bookings.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends BookingsDeleteManyArgs>(
    args: Subset<T, BookingsDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Bookings.
   * @param {BookingsUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Bookings
   * const bookings = await prisma.bookings.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends BookingsUpdateManyArgs>(
    args: Subset<T, BookingsUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Bookings.
   * @param {BookingsUpsertArgs} args - Arguments to update or create a Bookings.
   * @example
   * // Update or create a Bookings
   * const bookings = await prisma.bookings.upsert({
   *   create: {
   *     // ... data to create a Bookings
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Bookings we want to update
   *   }
   * })
  **/
  upsert<T extends BookingsUpsertArgs>(
    args: Subset<T, BookingsUpsertArgs>
  ): T extends BookingsUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends BookingsSelectUpsertArgs ? Promise<BookingsGetSelectPayload<ExtractBookingsSelectUpsertArgs<T>>>
  : T extends BookingsIncludeUpsertArgs ? Promise<BookingsGetIncludePayload<ExtractBookingsIncludeUpsertArgs<T>>> : BookingsClient<Bookings>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class BookingsClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  weeks<T extends FindManyWeekArgs = {}>(args?: Subset<T, FindManyWeekArgs>): T extends FindManyWeekArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyWeekSelectArgs
  ? Promise<Array<WeekGetSelectPayload<ExtractFindManyWeekSelectArgs<T>>>> : T extends FindManyWeekIncludeArgs
  ? Promise<Array<WeekGetIncludePayload<ExtractFindManyWeekIncludeArgs<T>>>> : Promise<Array<Week>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Bookings findOne
 */
export type FindOneBookingsArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * Filter, which Bookings to fetch.
  **/
  where: BookingsWhereUniqueInput
}

export type FindOneBookingsArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * Filter, which Bookings to fetch.
  **/
  where: BookingsWhereUniqueInput
}

export type FindOneBookingsSelectArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Filter, which Bookings to fetch.
  **/
  where: BookingsWhereUniqueInput
}

export type FindOneBookingsSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Filter, which Bookings to fetch.
  **/
  where: BookingsWhereUniqueInput
}

export type FindOneBookingsIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * Filter, which Bookings to fetch.
  **/
  where: BookingsWhereUniqueInput
}

export type FindOneBookingsIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * Filter, which Bookings to fetch.
  **/
  where: BookingsWhereUniqueInput
}

export type ExtractFindOneBookingsSelectArgs<S extends undefined | boolean | FindOneBookingsSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneBookingsSelectArgs
  ? S['select']
  : true

export type ExtractFindOneBookingsIncludeArgs<S extends undefined | boolean | FindOneBookingsIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneBookingsIncludeArgs
  ? S['include']
  : true



/**
 * Bookings findMany
 */
export type FindManyBookingsArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * Filter, which Bookings to fetch.
  **/
  where?: BookingsWhereInput | null
  /**
   * Determine the order of the Bookings to fetch.
  **/
  orderBy?: BookingsOrderByInput | null
  /**
   * Skip the first `n` Bookings.
  **/
  skip?: number | null
  /**
   * Get all Bookings that come after the Bookings you provide with the current order.
  **/
  after?: BookingsWhereUniqueInput | null
  /**
   * Get all Bookings that come before the Bookings you provide with the current order.
  **/
  before?: BookingsWhereUniqueInput | null
  /**
   * Get the first `n` Bookings.
  **/
  first?: number | null
  /**
   * Get the last `n` Bookings.
  **/
  last?: number | null
}

export type FindManyBookingsArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * Filter, which Bookings to fetch.
  **/
  where?: BookingsWhereInput | null
  /**
   * Determine the order of the Bookings to fetch.
  **/
  orderBy?: BookingsOrderByInput | null
  /**
   * Skip the first `n` Bookings.
  **/
  skip?: number | null
  /**
   * Get all Bookings that come after the Bookings you provide with the current order.
  **/
  after?: BookingsWhereUniqueInput | null
  /**
   * Get all Bookings that come before the Bookings you provide with the current order.
  **/
  before?: BookingsWhereUniqueInput | null
  /**
   * Get the first `n` Bookings.
  **/
  first?: number | null
  /**
   * Get the last `n` Bookings.
  **/
  last?: number | null
}

export type FindManyBookingsSelectArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Filter, which Bookings to fetch.
  **/
  where?: BookingsWhereInput | null
  /**
   * Determine the order of the Bookings to fetch.
  **/
  orderBy?: BookingsOrderByInput | null
  /**
   * Skip the first `n` Bookings.
  **/
  skip?: number | null
  /**
   * Get all Bookings that come after the Bookings you provide with the current order.
  **/
  after?: BookingsWhereUniqueInput | null
  /**
   * Get all Bookings that come before the Bookings you provide with the current order.
  **/
  before?: BookingsWhereUniqueInput | null
  /**
   * Get the first `n` Bookings.
  **/
  first?: number | null
  /**
   * Get the last `n` Bookings.
  **/
  last?: number | null
}

export type FindManyBookingsSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Filter, which Bookings to fetch.
  **/
  where?: BookingsWhereInput | null
  /**
   * Determine the order of the Bookings to fetch.
  **/
  orderBy?: BookingsOrderByInput | null
  /**
   * Skip the first `n` Bookings.
  **/
  skip?: number | null
  /**
   * Get all Bookings that come after the Bookings you provide with the current order.
  **/
  after?: BookingsWhereUniqueInput | null
  /**
   * Get all Bookings that come before the Bookings you provide with the current order.
  **/
  before?: BookingsWhereUniqueInput | null
  /**
   * Get the first `n` Bookings.
  **/
  first?: number | null
  /**
   * Get the last `n` Bookings.
  **/
  last?: number | null
}

export type FindManyBookingsIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * Filter, which Bookings to fetch.
  **/
  where?: BookingsWhereInput | null
  /**
   * Determine the order of the Bookings to fetch.
  **/
  orderBy?: BookingsOrderByInput | null
  /**
   * Skip the first `n` Bookings.
  **/
  skip?: number | null
  /**
   * Get all Bookings that come after the Bookings you provide with the current order.
  **/
  after?: BookingsWhereUniqueInput | null
  /**
   * Get all Bookings that come before the Bookings you provide with the current order.
  **/
  before?: BookingsWhereUniqueInput | null
  /**
   * Get the first `n` Bookings.
  **/
  first?: number | null
  /**
   * Get the last `n` Bookings.
  **/
  last?: number | null
}

export type FindManyBookingsIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * Filter, which Bookings to fetch.
  **/
  where?: BookingsWhereInput | null
  /**
   * Determine the order of the Bookings to fetch.
  **/
  orderBy?: BookingsOrderByInput | null
  /**
   * Skip the first `n` Bookings.
  **/
  skip?: number | null
  /**
   * Get all Bookings that come after the Bookings you provide with the current order.
  **/
  after?: BookingsWhereUniqueInput | null
  /**
   * Get all Bookings that come before the Bookings you provide with the current order.
  **/
  before?: BookingsWhereUniqueInput | null
  /**
   * Get the first `n` Bookings.
  **/
  first?: number | null
  /**
   * Get the last `n` Bookings.
  **/
  last?: number | null
}

export type ExtractFindManyBookingsSelectArgs<S extends undefined | boolean | FindManyBookingsSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyBookingsSelectArgs
  ? S['select']
  : true

export type ExtractFindManyBookingsIncludeArgs<S extends undefined | boolean | FindManyBookingsIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyBookingsIncludeArgs
  ? S['include']
  : true



/**
 * Bookings create
 */
export type BookingsCreateArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * The data needed to create a Bookings.
  **/
  data: BookingsCreateInput
}

export type BookingsCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * The data needed to create a Bookings.
  **/
  data: BookingsCreateInput
}

export type BookingsSelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * The data needed to create a Bookings.
  **/
  data: BookingsCreateInput
}

export type BookingsSelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * The data needed to create a Bookings.
  **/
  data: BookingsCreateInput
}

export type BookingsIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * The data needed to create a Bookings.
  **/
  data: BookingsCreateInput
}

export type BookingsIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * The data needed to create a Bookings.
  **/
  data: BookingsCreateInput
}

export type ExtractBookingsSelectCreateArgs<S extends undefined | boolean | BookingsSelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsSelectCreateArgs
  ? S['select']
  : true

export type ExtractBookingsIncludeCreateArgs<S extends undefined | boolean | BookingsIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsIncludeCreateArgs
  ? S['include']
  : true



/**
 * Bookings update
 */
export type BookingsUpdateArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * The data needed to update a Bookings.
  **/
  data: BookingsUpdateInput
  /**
   * Choose, which Bookings to update.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * The data needed to update a Bookings.
  **/
  data: BookingsUpdateInput
  /**
   * Choose, which Bookings to update.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsSelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * The data needed to update a Bookings.
  **/
  data: BookingsUpdateInput
  /**
   * Choose, which Bookings to update.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsSelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * The data needed to update a Bookings.
  **/
  data: BookingsUpdateInput
  /**
   * Choose, which Bookings to update.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * The data needed to update a Bookings.
  **/
  data: BookingsUpdateInput
  /**
   * Choose, which Bookings to update.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * The data needed to update a Bookings.
  **/
  data: BookingsUpdateInput
  /**
   * Choose, which Bookings to update.
  **/
  where: BookingsWhereUniqueInput
}

export type ExtractBookingsSelectUpdateArgs<S extends undefined | boolean | BookingsSelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsSelectUpdateArgs
  ? S['select']
  : true

export type ExtractBookingsIncludeUpdateArgs<S extends undefined | boolean | BookingsIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Bookings updateMany
 */
export type BookingsUpdateManyArgs = {
  data: BookingsUpdateManyMutationInput
  where?: BookingsWhereInput | null
}


/**
 * Bookings upsert
 */
export type BookingsUpsertArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * The filter to search for the Bookings to update in case it exists.
  **/
  where: BookingsWhereUniqueInput
  /**
   * In case the Bookings found by the `where` argument doesn't exist, create a new Bookings with this data.
  **/
  create: BookingsCreateInput
  /**
   * In case the Bookings was found with the provided `where` argument, update it with this data.
  **/
  update: BookingsUpdateInput
}

export type BookingsUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * The filter to search for the Bookings to update in case it exists.
  **/
  where: BookingsWhereUniqueInput
  /**
   * In case the Bookings found by the `where` argument doesn't exist, create a new Bookings with this data.
  **/
  create: BookingsCreateInput
  /**
   * In case the Bookings was found with the provided `where` argument, update it with this data.
  **/
  update: BookingsUpdateInput
}

export type BookingsSelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * The filter to search for the Bookings to update in case it exists.
  **/
  where: BookingsWhereUniqueInput
  /**
   * In case the Bookings found by the `where` argument doesn't exist, create a new Bookings with this data.
  **/
  create: BookingsCreateInput
  /**
   * In case the Bookings was found with the provided `where` argument, update it with this data.
  **/
  update: BookingsUpdateInput
}

export type BookingsSelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * The filter to search for the Bookings to update in case it exists.
  **/
  where: BookingsWhereUniqueInput
  /**
   * In case the Bookings found by the `where` argument doesn't exist, create a new Bookings with this data.
  **/
  create: BookingsCreateInput
  /**
   * In case the Bookings was found with the provided `where` argument, update it with this data.
  **/
  update: BookingsUpdateInput
}

export type BookingsIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * The filter to search for the Bookings to update in case it exists.
  **/
  where: BookingsWhereUniqueInput
  /**
   * In case the Bookings found by the `where` argument doesn't exist, create a new Bookings with this data.
  **/
  create: BookingsCreateInput
  /**
   * In case the Bookings was found with the provided `where` argument, update it with this data.
  **/
  update: BookingsUpdateInput
}

export type BookingsIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * The filter to search for the Bookings to update in case it exists.
  **/
  where: BookingsWhereUniqueInput
  /**
   * In case the Bookings found by the `where` argument doesn't exist, create a new Bookings with this data.
  **/
  create: BookingsCreateInput
  /**
   * In case the Bookings was found with the provided `where` argument, update it with this data.
  **/
  update: BookingsUpdateInput
}

export type ExtractBookingsSelectUpsertArgs<S extends undefined | boolean | BookingsSelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsSelectUpsertArgs
  ? S['select']
  : true

export type ExtractBookingsIncludeUpsertArgs<S extends undefined | boolean | BookingsIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Bookings delete
 */
export type BookingsDeleteArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * Filter which Bookings to delete.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * Filter which Bookings to delete.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsSelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Filter which Bookings to delete.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsSelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Filter which Bookings to delete.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
  /**
   * Filter which Bookings to delete.
  **/
  where: BookingsWhereUniqueInput
}

export type BookingsIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
  /**
   * Filter which Bookings to delete.
  **/
  where: BookingsWhereUniqueInput
}

export type ExtractBookingsSelectDeleteArgs<S extends undefined | boolean | BookingsSelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsSelectDeleteArgs
  ? S['select']
  : true

export type ExtractBookingsIncludeDeleteArgs<S extends undefined | boolean | BookingsIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Bookings deleteMany
 */
export type BookingsDeleteManyArgs = {
  where?: BookingsWhereInput | null
}


/**
 * Bookings without action
 */
export type BookingsArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
}

export type BookingsArgsRequired = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
}

export type BookingsSelectArgs = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select: BookingsSelect
}

export type BookingsSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Bookings
  **/
  select?: BookingsSelect | null
}

export type BookingsIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: BookingsInclude
}

export type BookingsIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: BookingsInclude | null
}

export type ExtractBookingsSelectArgs<S extends undefined | boolean | BookingsSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsSelectArgs
  ? S['select']
  : true

export type ExtractBookingsIncludeArgs<S extends undefined | boolean | BookingsIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends BookingsIncludeArgs
  ? S['include']
  : true




/**
 * Model Week
 */

export type Week = {
  id: number
  anchor: string
  createdAt: Date
  updatedAt: Date
}

export type WeekScalars = 'id' | 'anchor' | 'createdAt' | 'updatedAt'
  

export type WeekSelect = {
  id?: boolean
  days?: boolean | DaysSelectArgsOptional
  anchor?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  bookings?: boolean | BookingsSelectArgsOptional
}

export type WeekInclude = {
  days?: boolean | DaysIncludeArgsOptional
  bookings?: boolean | BookingsIncludeArgsOptional
}

type WeekDefault = {
  id: true
  anchor: true
  createdAt: true
  updatedAt: true
}


export type WeekGetSelectPayload<S extends boolean | WeekSelect> = S extends true
  ? Week
  : S extends WeekSelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends WeekScalars
        ? Week[P]
        : P extends 'days'
        ? DaysGetSelectPayload<ExtractDaysSelectArgs<S[P]>>
        : P extends 'bookings'
        ? BookingsGetSelectPayload<ExtractBookingsSelectArgs<S[P]>> | null
        : never
    }
   : never

export type WeekGetIncludePayload<S extends boolean | WeekInclude> = S extends true
  ? Week
  : S extends WeekInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<WeekDefault, S>>]: P extends WeekScalars
        ? Week[P]
        : P extends 'days'
        ? DaysGetIncludePayload<ExtractDaysIncludeArgs<S[P]>>
        : P extends 'bookings'
        ? BookingsGetIncludePayload<ExtractBookingsIncludeArgs<S[P]>> | null
        : never
    }
   : never

export interface WeekDelegate {
  /**
   * Find zero or one Week.
   * @param {FindOneWeekArgs} args - Arguments to find a Week
   * @example
   * // Get one Week
   * const week = await prisma.week.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneWeekArgs>(
    args: Subset<T, FindOneWeekArgs>
  ): T extends FindOneWeekArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneWeekSelectArgs ? Promise<WeekGetSelectPayload<ExtractFindOneWeekSelectArgs<T>> | null>
  : T extends FindOneWeekIncludeArgs ? Promise<WeekGetIncludePayload<ExtractFindOneWeekIncludeArgs<T>> | null> : WeekClient<Week | null>
  /**
   * Find zero or more Weeks.
   * @param {FindManyWeekArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Weeks
   * const weeks = await prisma.week.findMany()
   * 
   * // Get first 10 Weeks
   * const weeks = await prisma.week.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const weekWithIdOnly = await prisma.week.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyWeekArgs>(
    args?: Subset<T, FindManyWeekArgs>
  ): T extends FindManyWeekArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyWeekSelectArgs
  ? Promise<Array<WeekGetSelectPayload<ExtractFindManyWeekSelectArgs<T>>>> : T extends FindManyWeekIncludeArgs
  ? Promise<Array<WeekGetIncludePayload<ExtractFindManyWeekIncludeArgs<T>>>> : Promise<Array<Week>>
  /**
   * Create a Week.
   * @param {WeekCreateArgs} args - Arguments to create a Week.
   * @example
   * // Create one Week
   * const user = await prisma.week.create({
   *   data: {
   *     // ... data to create a Week
   *   }
   * })
   * 
  **/
  create<T extends WeekCreateArgs>(
    args: Subset<T, WeekCreateArgs>
  ): T extends WeekCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends WeekSelectCreateArgs ? Promise<WeekGetSelectPayload<ExtractWeekSelectCreateArgs<T>>>
  : T extends WeekIncludeCreateArgs ? Promise<WeekGetIncludePayload<ExtractWeekIncludeCreateArgs<T>>> : WeekClient<Week>
  /**
   * Delete a Week.
   * @param {WeekDeleteArgs} args - Arguments to delete one Week.
   * @example
   * // Delete one Week
   * const user = await prisma.week.delete({
   *   where: {
   *     // ... filter to delete one Week
   *   }
   * })
   * 
  **/
  delete<T extends WeekDeleteArgs>(
    args: Subset<T, WeekDeleteArgs>
  ): T extends WeekDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends WeekSelectDeleteArgs ? Promise<WeekGetSelectPayload<ExtractWeekSelectDeleteArgs<T>>>
  : T extends WeekIncludeDeleteArgs ? Promise<WeekGetIncludePayload<ExtractWeekIncludeDeleteArgs<T>>> : WeekClient<Week>
  /**
   * Update one Week.
   * @param {WeekUpdateArgs} args - Arguments to update one Week.
   * @example
   * // Update one Week
   * const week = await prisma.week.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends WeekUpdateArgs>(
    args: Subset<T, WeekUpdateArgs>
  ): T extends WeekUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends WeekSelectUpdateArgs ? Promise<WeekGetSelectPayload<ExtractWeekSelectUpdateArgs<T>>>
  : T extends WeekIncludeUpdateArgs ? Promise<WeekGetIncludePayload<ExtractWeekIncludeUpdateArgs<T>>> : WeekClient<Week>
  /**
   * Delete zero or more Weeks.
   * @param {WeekDeleteManyArgs} args - Arguments to filter Weeks to delete.
   * @example
   * // Delete a few Weeks
   * const { count } = await prisma.week.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends WeekDeleteManyArgs>(
    args: Subset<T, WeekDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Weeks.
   * @param {WeekUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Weeks
   * const week = await prisma.week.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends WeekUpdateManyArgs>(
    args: Subset<T, WeekUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Week.
   * @param {WeekUpsertArgs} args - Arguments to update or create a Week.
   * @example
   * // Update or create a Week
   * const week = await prisma.week.upsert({
   *   create: {
   *     // ... data to create a Week
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Week we want to update
   *   }
   * })
  **/
  upsert<T extends WeekUpsertArgs>(
    args: Subset<T, WeekUpsertArgs>
  ): T extends WeekUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends WeekSelectUpsertArgs ? Promise<WeekGetSelectPayload<ExtractWeekSelectUpsertArgs<T>>>
  : T extends WeekIncludeUpsertArgs ? Promise<WeekGetIncludePayload<ExtractWeekIncludeUpsertArgs<T>>> : WeekClient<Week>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class WeekClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  days<T extends DaysArgs = {}>(args?: Subset<T, DaysArgs>): T extends FindOneDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends DaysSelectArgs ? Promise<DaysGetSelectPayload<ExtractDaysSelectArgs<T>> | null>
  : T extends DaysIncludeArgs ? Promise<DaysGetIncludePayload<ExtractDaysIncludeArgs<T>> | null> : DaysClient<Days | null>;

  bookings<T extends BookingsArgs = {}>(args?: Subset<T, BookingsArgs>): T extends FindOneBookingsArgsRequired ? 'Please either choose `select` or `include`' : T extends BookingsSelectArgs ? Promise<BookingsGetSelectPayload<ExtractBookingsSelectArgs<T>> | null>
  : T extends BookingsIncludeArgs ? Promise<BookingsGetIncludePayload<ExtractBookingsIncludeArgs<T>> | null> : BookingsClient<Bookings | null>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Week findOne
 */
export type FindOneWeekArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * Filter, which Week to fetch.
  **/
  where: WeekWhereUniqueInput
}

export type FindOneWeekArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * Filter, which Week to fetch.
  **/
  where: WeekWhereUniqueInput
}

export type FindOneWeekSelectArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Filter, which Week to fetch.
  **/
  where: WeekWhereUniqueInput
}

export type FindOneWeekSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Filter, which Week to fetch.
  **/
  where: WeekWhereUniqueInput
}

export type FindOneWeekIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * Filter, which Week to fetch.
  **/
  where: WeekWhereUniqueInput
}

export type FindOneWeekIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * Filter, which Week to fetch.
  **/
  where: WeekWhereUniqueInput
}

export type ExtractFindOneWeekSelectArgs<S extends undefined | boolean | FindOneWeekSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneWeekSelectArgs
  ? S['select']
  : true

export type ExtractFindOneWeekIncludeArgs<S extends undefined | boolean | FindOneWeekIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneWeekIncludeArgs
  ? S['include']
  : true



/**
 * Week findMany
 */
export type FindManyWeekArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * Filter, which Weeks to fetch.
  **/
  where?: WeekWhereInput | null
  /**
   * Determine the order of the Weeks to fetch.
  **/
  orderBy?: WeekOrderByInput | null
  /**
   * Skip the first `n` Weeks.
  **/
  skip?: number | null
  /**
   * Get all Weeks that come after the Week you provide with the current order.
  **/
  after?: WeekWhereUniqueInput | null
  /**
   * Get all Weeks that come before the Week you provide with the current order.
  **/
  before?: WeekWhereUniqueInput | null
  /**
   * Get the first `n` Weeks.
  **/
  first?: number | null
  /**
   * Get the last `n` Weeks.
  **/
  last?: number | null
}

export type FindManyWeekArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * Filter, which Weeks to fetch.
  **/
  where?: WeekWhereInput | null
  /**
   * Determine the order of the Weeks to fetch.
  **/
  orderBy?: WeekOrderByInput | null
  /**
   * Skip the first `n` Weeks.
  **/
  skip?: number | null
  /**
   * Get all Weeks that come after the Week you provide with the current order.
  **/
  after?: WeekWhereUniqueInput | null
  /**
   * Get all Weeks that come before the Week you provide with the current order.
  **/
  before?: WeekWhereUniqueInput | null
  /**
   * Get the first `n` Weeks.
  **/
  first?: number | null
  /**
   * Get the last `n` Weeks.
  **/
  last?: number | null
}

export type FindManyWeekSelectArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Filter, which Weeks to fetch.
  **/
  where?: WeekWhereInput | null
  /**
   * Determine the order of the Weeks to fetch.
  **/
  orderBy?: WeekOrderByInput | null
  /**
   * Skip the first `n` Weeks.
  **/
  skip?: number | null
  /**
   * Get all Weeks that come after the Week you provide with the current order.
  **/
  after?: WeekWhereUniqueInput | null
  /**
   * Get all Weeks that come before the Week you provide with the current order.
  **/
  before?: WeekWhereUniqueInput | null
  /**
   * Get the first `n` Weeks.
  **/
  first?: number | null
  /**
   * Get the last `n` Weeks.
  **/
  last?: number | null
}

export type FindManyWeekSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Filter, which Weeks to fetch.
  **/
  where?: WeekWhereInput | null
  /**
   * Determine the order of the Weeks to fetch.
  **/
  orderBy?: WeekOrderByInput | null
  /**
   * Skip the first `n` Weeks.
  **/
  skip?: number | null
  /**
   * Get all Weeks that come after the Week you provide with the current order.
  **/
  after?: WeekWhereUniqueInput | null
  /**
   * Get all Weeks that come before the Week you provide with the current order.
  **/
  before?: WeekWhereUniqueInput | null
  /**
   * Get the first `n` Weeks.
  **/
  first?: number | null
  /**
   * Get the last `n` Weeks.
  **/
  last?: number | null
}

export type FindManyWeekIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * Filter, which Weeks to fetch.
  **/
  where?: WeekWhereInput | null
  /**
   * Determine the order of the Weeks to fetch.
  **/
  orderBy?: WeekOrderByInput | null
  /**
   * Skip the first `n` Weeks.
  **/
  skip?: number | null
  /**
   * Get all Weeks that come after the Week you provide with the current order.
  **/
  after?: WeekWhereUniqueInput | null
  /**
   * Get all Weeks that come before the Week you provide with the current order.
  **/
  before?: WeekWhereUniqueInput | null
  /**
   * Get the first `n` Weeks.
  **/
  first?: number | null
  /**
   * Get the last `n` Weeks.
  **/
  last?: number | null
}

export type FindManyWeekIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * Filter, which Weeks to fetch.
  **/
  where?: WeekWhereInput | null
  /**
   * Determine the order of the Weeks to fetch.
  **/
  orderBy?: WeekOrderByInput | null
  /**
   * Skip the first `n` Weeks.
  **/
  skip?: number | null
  /**
   * Get all Weeks that come after the Week you provide with the current order.
  **/
  after?: WeekWhereUniqueInput | null
  /**
   * Get all Weeks that come before the Week you provide with the current order.
  **/
  before?: WeekWhereUniqueInput | null
  /**
   * Get the first `n` Weeks.
  **/
  first?: number | null
  /**
   * Get the last `n` Weeks.
  **/
  last?: number | null
}

export type ExtractFindManyWeekSelectArgs<S extends undefined | boolean | FindManyWeekSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyWeekSelectArgs
  ? S['select']
  : true

export type ExtractFindManyWeekIncludeArgs<S extends undefined | boolean | FindManyWeekIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyWeekIncludeArgs
  ? S['include']
  : true



/**
 * Week create
 */
export type WeekCreateArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * The data needed to create a Week.
  **/
  data: WeekCreateInput
}

export type WeekCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * The data needed to create a Week.
  **/
  data: WeekCreateInput
}

export type WeekSelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * The data needed to create a Week.
  **/
  data: WeekCreateInput
}

export type WeekSelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * The data needed to create a Week.
  **/
  data: WeekCreateInput
}

export type WeekIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * The data needed to create a Week.
  **/
  data: WeekCreateInput
}

export type WeekIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * The data needed to create a Week.
  **/
  data: WeekCreateInput
}

export type ExtractWeekSelectCreateArgs<S extends undefined | boolean | WeekSelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekSelectCreateArgs
  ? S['select']
  : true

export type ExtractWeekIncludeCreateArgs<S extends undefined | boolean | WeekIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekIncludeCreateArgs
  ? S['include']
  : true



/**
 * Week update
 */
export type WeekUpdateArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * The data needed to update a Week.
  **/
  data: WeekUpdateInput
  /**
   * Choose, which Week to update.
  **/
  where: WeekWhereUniqueInput
}

export type WeekUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * The data needed to update a Week.
  **/
  data: WeekUpdateInput
  /**
   * Choose, which Week to update.
  **/
  where: WeekWhereUniqueInput
}

export type WeekSelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * The data needed to update a Week.
  **/
  data: WeekUpdateInput
  /**
   * Choose, which Week to update.
  **/
  where: WeekWhereUniqueInput
}

export type WeekSelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * The data needed to update a Week.
  **/
  data: WeekUpdateInput
  /**
   * Choose, which Week to update.
  **/
  where: WeekWhereUniqueInput
}

export type WeekIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * The data needed to update a Week.
  **/
  data: WeekUpdateInput
  /**
   * Choose, which Week to update.
  **/
  where: WeekWhereUniqueInput
}

export type WeekIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * The data needed to update a Week.
  **/
  data: WeekUpdateInput
  /**
   * Choose, which Week to update.
  **/
  where: WeekWhereUniqueInput
}

export type ExtractWeekSelectUpdateArgs<S extends undefined | boolean | WeekSelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekSelectUpdateArgs
  ? S['select']
  : true

export type ExtractWeekIncludeUpdateArgs<S extends undefined | boolean | WeekIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Week updateMany
 */
export type WeekUpdateManyArgs = {
  data: WeekUpdateManyMutationInput
  where?: WeekWhereInput | null
}


/**
 * Week upsert
 */
export type WeekUpsertArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * The filter to search for the Week to update in case it exists.
  **/
  where: WeekWhereUniqueInput
  /**
   * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
  **/
  create: WeekCreateInput
  /**
   * In case the Week was found with the provided `where` argument, update it with this data.
  **/
  update: WeekUpdateInput
}

export type WeekUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * The filter to search for the Week to update in case it exists.
  **/
  where: WeekWhereUniqueInput
  /**
   * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
  **/
  create: WeekCreateInput
  /**
   * In case the Week was found with the provided `where` argument, update it with this data.
  **/
  update: WeekUpdateInput
}

export type WeekSelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * The filter to search for the Week to update in case it exists.
  **/
  where: WeekWhereUniqueInput
  /**
   * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
  **/
  create: WeekCreateInput
  /**
   * In case the Week was found with the provided `where` argument, update it with this data.
  **/
  update: WeekUpdateInput
}

export type WeekSelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * The filter to search for the Week to update in case it exists.
  **/
  where: WeekWhereUniqueInput
  /**
   * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
  **/
  create: WeekCreateInput
  /**
   * In case the Week was found with the provided `where` argument, update it with this data.
  **/
  update: WeekUpdateInput
}

export type WeekIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * The filter to search for the Week to update in case it exists.
  **/
  where: WeekWhereUniqueInput
  /**
   * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
  **/
  create: WeekCreateInput
  /**
   * In case the Week was found with the provided `where` argument, update it with this data.
  **/
  update: WeekUpdateInput
}

export type WeekIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * The filter to search for the Week to update in case it exists.
  **/
  where: WeekWhereUniqueInput
  /**
   * In case the Week found by the `where` argument doesn't exist, create a new Week with this data.
  **/
  create: WeekCreateInput
  /**
   * In case the Week was found with the provided `where` argument, update it with this data.
  **/
  update: WeekUpdateInput
}

export type ExtractWeekSelectUpsertArgs<S extends undefined | boolean | WeekSelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekSelectUpsertArgs
  ? S['select']
  : true

export type ExtractWeekIncludeUpsertArgs<S extends undefined | boolean | WeekIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Week delete
 */
export type WeekDeleteArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * Filter which Week to delete.
  **/
  where: WeekWhereUniqueInput
}

export type WeekDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * Filter which Week to delete.
  **/
  where: WeekWhereUniqueInput
}

export type WeekSelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Filter which Week to delete.
  **/
  where: WeekWhereUniqueInput
}

export type WeekSelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Filter which Week to delete.
  **/
  where: WeekWhereUniqueInput
}

export type WeekIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
  /**
   * Filter which Week to delete.
  **/
  where: WeekWhereUniqueInput
}

export type WeekIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
  /**
   * Filter which Week to delete.
  **/
  where: WeekWhereUniqueInput
}

export type ExtractWeekSelectDeleteArgs<S extends undefined | boolean | WeekSelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekSelectDeleteArgs
  ? S['select']
  : true

export type ExtractWeekIncludeDeleteArgs<S extends undefined | boolean | WeekIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Week deleteMany
 */
export type WeekDeleteManyArgs = {
  where?: WeekWhereInput | null
}


/**
 * Week without action
 */
export type WeekArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
}

export type WeekArgsRequired = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
}

export type WeekSelectArgs = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select: WeekSelect
}

export type WeekSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Week
  **/
  select?: WeekSelect | null
}

export type WeekIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WeekInclude
}

export type WeekIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WeekInclude | null
}

export type ExtractWeekSelectArgs<S extends undefined | boolean | WeekSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekSelectArgs
  ? S['select']
  : true

export type ExtractWeekIncludeArgs<S extends undefined | boolean | WeekIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WeekIncludeArgs
  ? S['include']
  : true




/**
 * Model Days
 */

export type Days = {
  id: number
  createdAt: Date
  updatedAt: Date
}

export type DaysScalars = 'id' | 'createdAt' | 'updatedAt'
  

export type DaysSelect = {
  id?: boolean
  monday?: boolean | MondaySelectArgsOptional
  tuesday?: boolean | TuesdaySelectArgsOptional
  wednesday?: boolean | WednesdaySelectArgsOptional
  thursday?: boolean | ThursdaySelectArgsOptional
  friday?: boolean | FridaySelectArgsOptional
  createdAt?: boolean
  updatedAt?: boolean
  weeks?: boolean | FindManyWeekSelectArgsOptional
}

export type DaysInclude = {
  monday?: boolean | MondayIncludeArgsOptional
  tuesday?: boolean | TuesdayIncludeArgsOptional
  wednesday?: boolean | WednesdayIncludeArgsOptional
  thursday?: boolean | ThursdayIncludeArgsOptional
  friday?: boolean | FridayIncludeArgsOptional
  weeks?: boolean | FindManyWeekIncludeArgsOptional
}

type DaysDefault = {
  id: true
  createdAt: true
  updatedAt: true
}


export type DaysGetSelectPayload<S extends boolean | DaysSelect> = S extends true
  ? Days
  : S extends DaysSelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends DaysScalars
        ? Days[P]
        : P extends 'monday'
        ? MondayGetSelectPayload<ExtractMondaySelectArgs<S[P]>>
        : P extends 'tuesday'
        ? TuesdayGetSelectPayload<ExtractTuesdaySelectArgs<S[P]>>
        : P extends 'wednesday'
        ? WednesdayGetSelectPayload<ExtractWednesdaySelectArgs<S[P]>>
        : P extends 'thursday'
        ? ThursdayGetSelectPayload<ExtractThursdaySelectArgs<S[P]>>
        : P extends 'friday'
        ? FridayGetSelectPayload<ExtractFridaySelectArgs<S[P]>>
        : P extends 'weeks'
        ? Array<WeekGetSelectPayload<ExtractFindManyWeekSelectArgs<S[P]>>>
        : never
    }
   : never

export type DaysGetIncludePayload<S extends boolean | DaysInclude> = S extends true
  ? Days
  : S extends DaysInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<DaysDefault, S>>]: P extends DaysScalars
        ? Days[P]
        : P extends 'monday'
        ? MondayGetIncludePayload<ExtractMondayIncludeArgs<S[P]>>
        : P extends 'tuesday'
        ? TuesdayGetIncludePayload<ExtractTuesdayIncludeArgs<S[P]>>
        : P extends 'wednesday'
        ? WednesdayGetIncludePayload<ExtractWednesdayIncludeArgs<S[P]>>
        : P extends 'thursday'
        ? ThursdayGetIncludePayload<ExtractThursdayIncludeArgs<S[P]>>
        : P extends 'friday'
        ? FridayGetIncludePayload<ExtractFridayIncludeArgs<S[P]>>
        : P extends 'weeks'
        ? Array<WeekGetIncludePayload<ExtractFindManyWeekIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface DaysDelegate {
  /**
   * Find zero or one Days.
   * @param {FindOneDaysArgs} args - Arguments to find a Days
   * @example
   * // Get one Days
   * const days = await prisma.days.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneDaysArgs>(
    args: Subset<T, FindOneDaysArgs>
  ): T extends FindOneDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneDaysSelectArgs ? Promise<DaysGetSelectPayload<ExtractFindOneDaysSelectArgs<T>> | null>
  : T extends FindOneDaysIncludeArgs ? Promise<DaysGetIncludePayload<ExtractFindOneDaysIncludeArgs<T>> | null> : DaysClient<Days | null>
  /**
   * Find zero or more Days.
   * @param {FindManyDaysArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Days
   * const days = await prisma.days.findMany()
   * 
   * // Get first 10 Days
   * const days = await prisma.days.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const daysWithIdOnly = await prisma.days.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyDaysArgs>(
    args?: Subset<T, FindManyDaysArgs>
  ): T extends FindManyDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyDaysSelectArgs
  ? Promise<Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<T>>>> : T extends FindManyDaysIncludeArgs
  ? Promise<Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<T>>>> : Promise<Array<Days>>
  /**
   * Create a Days.
   * @param {DaysCreateArgs} args - Arguments to create a Days.
   * @example
   * // Create one Days
   * const user = await prisma.days.create({
   *   data: {
   *     // ... data to create a Days
   *   }
   * })
   * 
  **/
  create<T extends DaysCreateArgs>(
    args: Subset<T, DaysCreateArgs>
  ): T extends DaysCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends DaysSelectCreateArgs ? Promise<DaysGetSelectPayload<ExtractDaysSelectCreateArgs<T>>>
  : T extends DaysIncludeCreateArgs ? Promise<DaysGetIncludePayload<ExtractDaysIncludeCreateArgs<T>>> : DaysClient<Days>
  /**
   * Delete a Days.
   * @param {DaysDeleteArgs} args - Arguments to delete one Days.
   * @example
   * // Delete one Days
   * const user = await prisma.days.delete({
   *   where: {
   *     // ... filter to delete one Days
   *   }
   * })
   * 
  **/
  delete<T extends DaysDeleteArgs>(
    args: Subset<T, DaysDeleteArgs>
  ): T extends DaysDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends DaysSelectDeleteArgs ? Promise<DaysGetSelectPayload<ExtractDaysSelectDeleteArgs<T>>>
  : T extends DaysIncludeDeleteArgs ? Promise<DaysGetIncludePayload<ExtractDaysIncludeDeleteArgs<T>>> : DaysClient<Days>
  /**
   * Update one Days.
   * @param {DaysUpdateArgs} args - Arguments to update one Days.
   * @example
   * // Update one Days
   * const days = await prisma.days.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends DaysUpdateArgs>(
    args: Subset<T, DaysUpdateArgs>
  ): T extends DaysUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends DaysSelectUpdateArgs ? Promise<DaysGetSelectPayload<ExtractDaysSelectUpdateArgs<T>>>
  : T extends DaysIncludeUpdateArgs ? Promise<DaysGetIncludePayload<ExtractDaysIncludeUpdateArgs<T>>> : DaysClient<Days>
  /**
   * Delete zero or more Days.
   * @param {DaysDeleteManyArgs} args - Arguments to filter Days to delete.
   * @example
   * // Delete a few Days
   * const { count } = await prisma.days.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends DaysDeleteManyArgs>(
    args: Subset<T, DaysDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Days.
   * @param {DaysUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Days
   * const days = await prisma.days.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends DaysUpdateManyArgs>(
    args: Subset<T, DaysUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Days.
   * @param {DaysUpsertArgs} args - Arguments to update or create a Days.
   * @example
   * // Update or create a Days
   * const days = await prisma.days.upsert({
   *   create: {
   *     // ... data to create a Days
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Days we want to update
   *   }
   * })
  **/
  upsert<T extends DaysUpsertArgs>(
    args: Subset<T, DaysUpsertArgs>
  ): T extends DaysUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends DaysSelectUpsertArgs ? Promise<DaysGetSelectPayload<ExtractDaysSelectUpsertArgs<T>>>
  : T extends DaysIncludeUpsertArgs ? Promise<DaysGetIncludePayload<ExtractDaysIncludeUpsertArgs<T>>> : DaysClient<Days>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class DaysClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  monday<T extends MondayArgs = {}>(args?: Subset<T, MondayArgs>): T extends FindOneMondayArgsRequired ? 'Please either choose `select` or `include`' : T extends MondaySelectArgs ? Promise<MondayGetSelectPayload<ExtractMondaySelectArgs<T>> | null>
  : T extends MondayIncludeArgs ? Promise<MondayGetIncludePayload<ExtractMondayIncludeArgs<T>> | null> : MondayClient<Monday | null>;

  tuesday<T extends TuesdayArgs = {}>(args?: Subset<T, TuesdayArgs>): T extends FindOneTuesdayArgsRequired ? 'Please either choose `select` or `include`' : T extends TuesdaySelectArgs ? Promise<TuesdayGetSelectPayload<ExtractTuesdaySelectArgs<T>> | null>
  : T extends TuesdayIncludeArgs ? Promise<TuesdayGetIncludePayload<ExtractTuesdayIncludeArgs<T>> | null> : TuesdayClient<Tuesday | null>;

  wednesday<T extends WednesdayArgs = {}>(args?: Subset<T, WednesdayArgs>): T extends FindOneWednesdayArgsRequired ? 'Please either choose `select` or `include`' : T extends WednesdaySelectArgs ? Promise<WednesdayGetSelectPayload<ExtractWednesdaySelectArgs<T>> | null>
  : T extends WednesdayIncludeArgs ? Promise<WednesdayGetIncludePayload<ExtractWednesdayIncludeArgs<T>> | null> : WednesdayClient<Wednesday | null>;

  thursday<T extends ThursdayArgs = {}>(args?: Subset<T, ThursdayArgs>): T extends FindOneThursdayArgsRequired ? 'Please either choose `select` or `include`' : T extends ThursdaySelectArgs ? Promise<ThursdayGetSelectPayload<ExtractThursdaySelectArgs<T>> | null>
  : T extends ThursdayIncludeArgs ? Promise<ThursdayGetIncludePayload<ExtractThursdayIncludeArgs<T>> | null> : ThursdayClient<Thursday | null>;

  friday<T extends FridayArgs = {}>(args?: Subset<T, FridayArgs>): T extends FindOneFridayArgsRequired ? 'Please either choose `select` or `include`' : T extends FridaySelectArgs ? Promise<FridayGetSelectPayload<ExtractFridaySelectArgs<T>> | null>
  : T extends FridayIncludeArgs ? Promise<FridayGetIncludePayload<ExtractFridayIncludeArgs<T>> | null> : FridayClient<Friday | null>;

  weeks<T extends FindManyWeekArgs = {}>(args?: Subset<T, FindManyWeekArgs>): T extends FindManyWeekArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyWeekSelectArgs
  ? Promise<Array<WeekGetSelectPayload<ExtractFindManyWeekSelectArgs<T>>>> : T extends FindManyWeekIncludeArgs
  ? Promise<Array<WeekGetIncludePayload<ExtractFindManyWeekIncludeArgs<T>>>> : Promise<Array<Week>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Days findOne
 */
export type FindOneDaysArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * Filter, which Days to fetch.
  **/
  where: DaysWhereUniqueInput
}

export type FindOneDaysArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * Filter, which Days to fetch.
  **/
  where: DaysWhereUniqueInput
}

export type FindOneDaysSelectArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Filter, which Days to fetch.
  **/
  where: DaysWhereUniqueInput
}

export type FindOneDaysSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Filter, which Days to fetch.
  **/
  where: DaysWhereUniqueInput
}

export type FindOneDaysIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * Filter, which Days to fetch.
  **/
  where: DaysWhereUniqueInput
}

export type FindOneDaysIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * Filter, which Days to fetch.
  **/
  where: DaysWhereUniqueInput
}

export type ExtractFindOneDaysSelectArgs<S extends undefined | boolean | FindOneDaysSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneDaysSelectArgs
  ? S['select']
  : true

export type ExtractFindOneDaysIncludeArgs<S extends undefined | boolean | FindOneDaysIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneDaysIncludeArgs
  ? S['include']
  : true



/**
 * Days findMany
 */
export type FindManyDaysArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * Filter, which Days to fetch.
  **/
  where?: DaysWhereInput | null
  /**
   * Determine the order of the Days to fetch.
  **/
  orderBy?: DaysOrderByInput | null
  /**
   * Skip the first `n` Days.
  **/
  skip?: number | null
  /**
   * Get all Days that come after the Days you provide with the current order.
  **/
  after?: DaysWhereUniqueInput | null
  /**
   * Get all Days that come before the Days you provide with the current order.
  **/
  before?: DaysWhereUniqueInput | null
  /**
   * Get the first `n` Days.
  **/
  first?: number | null
  /**
   * Get the last `n` Days.
  **/
  last?: number | null
}

export type FindManyDaysArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * Filter, which Days to fetch.
  **/
  where?: DaysWhereInput | null
  /**
   * Determine the order of the Days to fetch.
  **/
  orderBy?: DaysOrderByInput | null
  /**
   * Skip the first `n` Days.
  **/
  skip?: number | null
  /**
   * Get all Days that come after the Days you provide with the current order.
  **/
  after?: DaysWhereUniqueInput | null
  /**
   * Get all Days that come before the Days you provide with the current order.
  **/
  before?: DaysWhereUniqueInput | null
  /**
   * Get the first `n` Days.
  **/
  first?: number | null
  /**
   * Get the last `n` Days.
  **/
  last?: number | null
}

export type FindManyDaysSelectArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Filter, which Days to fetch.
  **/
  where?: DaysWhereInput | null
  /**
   * Determine the order of the Days to fetch.
  **/
  orderBy?: DaysOrderByInput | null
  /**
   * Skip the first `n` Days.
  **/
  skip?: number | null
  /**
   * Get all Days that come after the Days you provide with the current order.
  **/
  after?: DaysWhereUniqueInput | null
  /**
   * Get all Days that come before the Days you provide with the current order.
  **/
  before?: DaysWhereUniqueInput | null
  /**
   * Get the first `n` Days.
  **/
  first?: number | null
  /**
   * Get the last `n` Days.
  **/
  last?: number | null
}

export type FindManyDaysSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Filter, which Days to fetch.
  **/
  where?: DaysWhereInput | null
  /**
   * Determine the order of the Days to fetch.
  **/
  orderBy?: DaysOrderByInput | null
  /**
   * Skip the first `n` Days.
  **/
  skip?: number | null
  /**
   * Get all Days that come after the Days you provide with the current order.
  **/
  after?: DaysWhereUniqueInput | null
  /**
   * Get all Days that come before the Days you provide with the current order.
  **/
  before?: DaysWhereUniqueInput | null
  /**
   * Get the first `n` Days.
  **/
  first?: number | null
  /**
   * Get the last `n` Days.
  **/
  last?: number | null
}

export type FindManyDaysIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * Filter, which Days to fetch.
  **/
  where?: DaysWhereInput | null
  /**
   * Determine the order of the Days to fetch.
  **/
  orderBy?: DaysOrderByInput | null
  /**
   * Skip the first `n` Days.
  **/
  skip?: number | null
  /**
   * Get all Days that come after the Days you provide with the current order.
  **/
  after?: DaysWhereUniqueInput | null
  /**
   * Get all Days that come before the Days you provide with the current order.
  **/
  before?: DaysWhereUniqueInput | null
  /**
   * Get the first `n` Days.
  **/
  first?: number | null
  /**
   * Get the last `n` Days.
  **/
  last?: number | null
}

export type FindManyDaysIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * Filter, which Days to fetch.
  **/
  where?: DaysWhereInput | null
  /**
   * Determine the order of the Days to fetch.
  **/
  orderBy?: DaysOrderByInput | null
  /**
   * Skip the first `n` Days.
  **/
  skip?: number | null
  /**
   * Get all Days that come after the Days you provide with the current order.
  **/
  after?: DaysWhereUniqueInput | null
  /**
   * Get all Days that come before the Days you provide with the current order.
  **/
  before?: DaysWhereUniqueInput | null
  /**
   * Get the first `n` Days.
  **/
  first?: number | null
  /**
   * Get the last `n` Days.
  **/
  last?: number | null
}

export type ExtractFindManyDaysSelectArgs<S extends undefined | boolean | FindManyDaysSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyDaysSelectArgs
  ? S['select']
  : true

export type ExtractFindManyDaysIncludeArgs<S extends undefined | boolean | FindManyDaysIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyDaysIncludeArgs
  ? S['include']
  : true



/**
 * Days create
 */
export type DaysCreateArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * The data needed to create a Days.
  **/
  data: DaysCreateInput
}

export type DaysCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * The data needed to create a Days.
  **/
  data: DaysCreateInput
}

export type DaysSelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * The data needed to create a Days.
  **/
  data: DaysCreateInput
}

export type DaysSelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * The data needed to create a Days.
  **/
  data: DaysCreateInput
}

export type DaysIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * The data needed to create a Days.
  **/
  data: DaysCreateInput
}

export type DaysIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * The data needed to create a Days.
  **/
  data: DaysCreateInput
}

export type ExtractDaysSelectCreateArgs<S extends undefined | boolean | DaysSelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysSelectCreateArgs
  ? S['select']
  : true

export type ExtractDaysIncludeCreateArgs<S extends undefined | boolean | DaysIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysIncludeCreateArgs
  ? S['include']
  : true



/**
 * Days update
 */
export type DaysUpdateArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * The data needed to update a Days.
  **/
  data: DaysUpdateInput
  /**
   * Choose, which Days to update.
  **/
  where: DaysWhereUniqueInput
}

export type DaysUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * The data needed to update a Days.
  **/
  data: DaysUpdateInput
  /**
   * Choose, which Days to update.
  **/
  where: DaysWhereUniqueInput
}

export type DaysSelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * The data needed to update a Days.
  **/
  data: DaysUpdateInput
  /**
   * Choose, which Days to update.
  **/
  where: DaysWhereUniqueInput
}

export type DaysSelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * The data needed to update a Days.
  **/
  data: DaysUpdateInput
  /**
   * Choose, which Days to update.
  **/
  where: DaysWhereUniqueInput
}

export type DaysIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * The data needed to update a Days.
  **/
  data: DaysUpdateInput
  /**
   * Choose, which Days to update.
  **/
  where: DaysWhereUniqueInput
}

export type DaysIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * The data needed to update a Days.
  **/
  data: DaysUpdateInput
  /**
   * Choose, which Days to update.
  **/
  where: DaysWhereUniqueInput
}

export type ExtractDaysSelectUpdateArgs<S extends undefined | boolean | DaysSelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysSelectUpdateArgs
  ? S['select']
  : true

export type ExtractDaysIncludeUpdateArgs<S extends undefined | boolean | DaysIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Days updateMany
 */
export type DaysUpdateManyArgs = {
  data: DaysUpdateManyMutationInput
  where?: DaysWhereInput | null
}


/**
 * Days upsert
 */
export type DaysUpsertArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * The filter to search for the Days to update in case it exists.
  **/
  where: DaysWhereUniqueInput
  /**
   * In case the Days found by the `where` argument doesn't exist, create a new Days with this data.
  **/
  create: DaysCreateInput
  /**
   * In case the Days was found with the provided `where` argument, update it with this data.
  **/
  update: DaysUpdateInput
}

export type DaysUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * The filter to search for the Days to update in case it exists.
  **/
  where: DaysWhereUniqueInput
  /**
   * In case the Days found by the `where` argument doesn't exist, create a new Days with this data.
  **/
  create: DaysCreateInput
  /**
   * In case the Days was found with the provided `where` argument, update it with this data.
  **/
  update: DaysUpdateInput
}

export type DaysSelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * The filter to search for the Days to update in case it exists.
  **/
  where: DaysWhereUniqueInput
  /**
   * In case the Days found by the `where` argument doesn't exist, create a new Days with this data.
  **/
  create: DaysCreateInput
  /**
   * In case the Days was found with the provided `where` argument, update it with this data.
  **/
  update: DaysUpdateInput
}

export type DaysSelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * The filter to search for the Days to update in case it exists.
  **/
  where: DaysWhereUniqueInput
  /**
   * In case the Days found by the `where` argument doesn't exist, create a new Days with this data.
  **/
  create: DaysCreateInput
  /**
   * In case the Days was found with the provided `where` argument, update it with this data.
  **/
  update: DaysUpdateInput
}

export type DaysIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * The filter to search for the Days to update in case it exists.
  **/
  where: DaysWhereUniqueInput
  /**
   * In case the Days found by the `where` argument doesn't exist, create a new Days with this data.
  **/
  create: DaysCreateInput
  /**
   * In case the Days was found with the provided `where` argument, update it with this data.
  **/
  update: DaysUpdateInput
}

export type DaysIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * The filter to search for the Days to update in case it exists.
  **/
  where: DaysWhereUniqueInput
  /**
   * In case the Days found by the `where` argument doesn't exist, create a new Days with this data.
  **/
  create: DaysCreateInput
  /**
   * In case the Days was found with the provided `where` argument, update it with this data.
  **/
  update: DaysUpdateInput
}

export type ExtractDaysSelectUpsertArgs<S extends undefined | boolean | DaysSelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysSelectUpsertArgs
  ? S['select']
  : true

export type ExtractDaysIncludeUpsertArgs<S extends undefined | boolean | DaysIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Days delete
 */
export type DaysDeleteArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * Filter which Days to delete.
  **/
  where: DaysWhereUniqueInput
}

export type DaysDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * Filter which Days to delete.
  **/
  where: DaysWhereUniqueInput
}

export type DaysSelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Filter which Days to delete.
  **/
  where: DaysWhereUniqueInput
}

export type DaysSelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Filter which Days to delete.
  **/
  where: DaysWhereUniqueInput
}

export type DaysIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
  /**
   * Filter which Days to delete.
  **/
  where: DaysWhereUniqueInput
}

export type DaysIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
  /**
   * Filter which Days to delete.
  **/
  where: DaysWhereUniqueInput
}

export type ExtractDaysSelectDeleteArgs<S extends undefined | boolean | DaysSelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysSelectDeleteArgs
  ? S['select']
  : true

export type ExtractDaysIncludeDeleteArgs<S extends undefined | boolean | DaysIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Days deleteMany
 */
export type DaysDeleteManyArgs = {
  where?: DaysWhereInput | null
}


/**
 * Days without action
 */
export type DaysArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
}

export type DaysArgsRequired = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
}

export type DaysSelectArgs = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select: DaysSelect
}

export type DaysSelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Days
  **/
  select?: DaysSelect | null
}

export type DaysIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: DaysInclude
}

export type DaysIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: DaysInclude | null
}

export type ExtractDaysSelectArgs<S extends undefined | boolean | DaysSelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysSelectArgs
  ? S['select']
  : true

export type ExtractDaysIncludeArgs<S extends undefined | boolean | DaysIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends DaysIncludeArgs
  ? S['include']
  : true




/**
 * Model Monday
 */

export type Monday = {
  id: number
  eighttoten: boolean
  tentotwelve: boolean
  twelvetotwo: boolean
  twotofour: boolean
  fourtosix: boolean
  createdAt: Date
  updatedAt: Date
}

export type MondayScalars = 'id' | 'eighttoten' | 'tentotwelve' | 'twelvetotwo' | 'twotofour' | 'fourtosix' | 'createdAt' | 'updatedAt'
  

export type MondaySelect = {
  id?: boolean
  eighttoten?: boolean
  tentotwelve?: boolean
  twelvetotwo?: boolean
  twotofour?: boolean
  fourtosix?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  dayses?: boolean | FindManyDaysSelectArgsOptional
}

export type MondayInclude = {
  dayses?: boolean | FindManyDaysIncludeArgsOptional
}

type MondayDefault = {
  id: true
  eighttoten: true
  tentotwelve: true
  twelvetotwo: true
  twotofour: true
  fourtosix: true
  createdAt: true
  updatedAt: true
}


export type MondayGetSelectPayload<S extends boolean | MondaySelect> = S extends true
  ? Monday
  : S extends MondaySelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends MondayScalars
        ? Monday[P]
        : P extends 'dayses'
        ? Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<S[P]>>>
        : never
    }
   : never

export type MondayGetIncludePayload<S extends boolean | MondayInclude> = S extends true
  ? Monday
  : S extends MondayInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<MondayDefault, S>>]: P extends MondayScalars
        ? Monday[P]
        : P extends 'dayses'
        ? Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface MondayDelegate {
  /**
   * Find zero or one Monday.
   * @param {FindOneMondayArgs} args - Arguments to find a Monday
   * @example
   * // Get one Monday
   * const monday = await prisma.monday.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneMondayArgs>(
    args: Subset<T, FindOneMondayArgs>
  ): T extends FindOneMondayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneMondaySelectArgs ? Promise<MondayGetSelectPayload<ExtractFindOneMondaySelectArgs<T>> | null>
  : T extends FindOneMondayIncludeArgs ? Promise<MondayGetIncludePayload<ExtractFindOneMondayIncludeArgs<T>> | null> : MondayClient<Monday | null>
  /**
   * Find zero or more Mondays.
   * @param {FindManyMondayArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Mondays
   * const mondays = await prisma.monday.findMany()
   * 
   * // Get first 10 Mondays
   * const mondays = await prisma.monday.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const mondayWithIdOnly = await prisma.monday.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyMondayArgs>(
    args?: Subset<T, FindManyMondayArgs>
  ): T extends FindManyMondayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyMondaySelectArgs
  ? Promise<Array<MondayGetSelectPayload<ExtractFindManyMondaySelectArgs<T>>>> : T extends FindManyMondayIncludeArgs
  ? Promise<Array<MondayGetIncludePayload<ExtractFindManyMondayIncludeArgs<T>>>> : Promise<Array<Monday>>
  /**
   * Create a Monday.
   * @param {MondayCreateArgs} args - Arguments to create a Monday.
   * @example
   * // Create one Monday
   * const user = await prisma.monday.create({
   *   data: {
   *     // ... data to create a Monday
   *   }
   * })
   * 
  **/
  create<T extends MondayCreateArgs>(
    args: Subset<T, MondayCreateArgs>
  ): T extends MondayCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends MondaySelectCreateArgs ? Promise<MondayGetSelectPayload<ExtractMondaySelectCreateArgs<T>>>
  : T extends MondayIncludeCreateArgs ? Promise<MondayGetIncludePayload<ExtractMondayIncludeCreateArgs<T>>> : MondayClient<Monday>
  /**
   * Delete a Monday.
   * @param {MondayDeleteArgs} args - Arguments to delete one Monday.
   * @example
   * // Delete one Monday
   * const user = await prisma.monday.delete({
   *   where: {
   *     // ... filter to delete one Monday
   *   }
   * })
   * 
  **/
  delete<T extends MondayDeleteArgs>(
    args: Subset<T, MondayDeleteArgs>
  ): T extends MondayDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends MondaySelectDeleteArgs ? Promise<MondayGetSelectPayload<ExtractMondaySelectDeleteArgs<T>>>
  : T extends MondayIncludeDeleteArgs ? Promise<MondayGetIncludePayload<ExtractMondayIncludeDeleteArgs<T>>> : MondayClient<Monday>
  /**
   * Update one Monday.
   * @param {MondayUpdateArgs} args - Arguments to update one Monday.
   * @example
   * // Update one Monday
   * const monday = await prisma.monday.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends MondayUpdateArgs>(
    args: Subset<T, MondayUpdateArgs>
  ): T extends MondayUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends MondaySelectUpdateArgs ? Promise<MondayGetSelectPayload<ExtractMondaySelectUpdateArgs<T>>>
  : T extends MondayIncludeUpdateArgs ? Promise<MondayGetIncludePayload<ExtractMondayIncludeUpdateArgs<T>>> : MondayClient<Monday>
  /**
   * Delete zero or more Mondays.
   * @param {MondayDeleteManyArgs} args - Arguments to filter Mondays to delete.
   * @example
   * // Delete a few Mondays
   * const { count } = await prisma.monday.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends MondayDeleteManyArgs>(
    args: Subset<T, MondayDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Mondays.
   * @param {MondayUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Mondays
   * const monday = await prisma.monday.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends MondayUpdateManyArgs>(
    args: Subset<T, MondayUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Monday.
   * @param {MondayUpsertArgs} args - Arguments to update or create a Monday.
   * @example
   * // Update or create a Monday
   * const monday = await prisma.monday.upsert({
   *   create: {
   *     // ... data to create a Monday
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Monday we want to update
   *   }
   * })
  **/
  upsert<T extends MondayUpsertArgs>(
    args: Subset<T, MondayUpsertArgs>
  ): T extends MondayUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends MondaySelectUpsertArgs ? Promise<MondayGetSelectPayload<ExtractMondaySelectUpsertArgs<T>>>
  : T extends MondayIncludeUpsertArgs ? Promise<MondayGetIncludePayload<ExtractMondayIncludeUpsertArgs<T>>> : MondayClient<Monday>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class MondayClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  dayses<T extends FindManyDaysArgs = {}>(args?: Subset<T, FindManyDaysArgs>): T extends FindManyDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyDaysSelectArgs
  ? Promise<Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<T>>>> : T extends FindManyDaysIncludeArgs
  ? Promise<Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<T>>>> : Promise<Array<Days>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Monday findOne
 */
export type FindOneMondayArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * Filter, which Monday to fetch.
  **/
  where: MondayWhereUniqueInput
}

export type FindOneMondayArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * Filter, which Monday to fetch.
  **/
  where: MondayWhereUniqueInput
}

export type FindOneMondaySelectArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Filter, which Monday to fetch.
  **/
  where: MondayWhereUniqueInput
}

export type FindOneMondaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Filter, which Monday to fetch.
  **/
  where: MondayWhereUniqueInput
}

export type FindOneMondayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * Filter, which Monday to fetch.
  **/
  where: MondayWhereUniqueInput
}

export type FindOneMondayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * Filter, which Monday to fetch.
  **/
  where: MondayWhereUniqueInput
}

export type ExtractFindOneMondaySelectArgs<S extends undefined | boolean | FindOneMondaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneMondaySelectArgs
  ? S['select']
  : true

export type ExtractFindOneMondayIncludeArgs<S extends undefined | boolean | FindOneMondayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneMondayIncludeArgs
  ? S['include']
  : true



/**
 * Monday findMany
 */
export type FindManyMondayArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * Filter, which Mondays to fetch.
  **/
  where?: MondayWhereInput | null
  /**
   * Determine the order of the Mondays to fetch.
  **/
  orderBy?: MondayOrderByInput | null
  /**
   * Skip the first `n` Mondays.
  **/
  skip?: number | null
  /**
   * Get all Mondays that come after the Monday you provide with the current order.
  **/
  after?: MondayWhereUniqueInput | null
  /**
   * Get all Mondays that come before the Monday you provide with the current order.
  **/
  before?: MondayWhereUniqueInput | null
  /**
   * Get the first `n` Mondays.
  **/
  first?: number | null
  /**
   * Get the last `n` Mondays.
  **/
  last?: number | null
}

export type FindManyMondayArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * Filter, which Mondays to fetch.
  **/
  where?: MondayWhereInput | null
  /**
   * Determine the order of the Mondays to fetch.
  **/
  orderBy?: MondayOrderByInput | null
  /**
   * Skip the first `n` Mondays.
  **/
  skip?: number | null
  /**
   * Get all Mondays that come after the Monday you provide with the current order.
  **/
  after?: MondayWhereUniqueInput | null
  /**
   * Get all Mondays that come before the Monday you provide with the current order.
  **/
  before?: MondayWhereUniqueInput | null
  /**
   * Get the first `n` Mondays.
  **/
  first?: number | null
  /**
   * Get the last `n` Mondays.
  **/
  last?: number | null
}

export type FindManyMondaySelectArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Filter, which Mondays to fetch.
  **/
  where?: MondayWhereInput | null
  /**
   * Determine the order of the Mondays to fetch.
  **/
  orderBy?: MondayOrderByInput | null
  /**
   * Skip the first `n` Mondays.
  **/
  skip?: number | null
  /**
   * Get all Mondays that come after the Monday you provide with the current order.
  **/
  after?: MondayWhereUniqueInput | null
  /**
   * Get all Mondays that come before the Monday you provide with the current order.
  **/
  before?: MondayWhereUniqueInput | null
  /**
   * Get the first `n` Mondays.
  **/
  first?: number | null
  /**
   * Get the last `n` Mondays.
  **/
  last?: number | null
}

export type FindManyMondaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Filter, which Mondays to fetch.
  **/
  where?: MondayWhereInput | null
  /**
   * Determine the order of the Mondays to fetch.
  **/
  orderBy?: MondayOrderByInput | null
  /**
   * Skip the first `n` Mondays.
  **/
  skip?: number | null
  /**
   * Get all Mondays that come after the Monday you provide with the current order.
  **/
  after?: MondayWhereUniqueInput | null
  /**
   * Get all Mondays that come before the Monday you provide with the current order.
  **/
  before?: MondayWhereUniqueInput | null
  /**
   * Get the first `n` Mondays.
  **/
  first?: number | null
  /**
   * Get the last `n` Mondays.
  **/
  last?: number | null
}

export type FindManyMondayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * Filter, which Mondays to fetch.
  **/
  where?: MondayWhereInput | null
  /**
   * Determine the order of the Mondays to fetch.
  **/
  orderBy?: MondayOrderByInput | null
  /**
   * Skip the first `n` Mondays.
  **/
  skip?: number | null
  /**
   * Get all Mondays that come after the Monday you provide with the current order.
  **/
  after?: MondayWhereUniqueInput | null
  /**
   * Get all Mondays that come before the Monday you provide with the current order.
  **/
  before?: MondayWhereUniqueInput | null
  /**
   * Get the first `n` Mondays.
  **/
  first?: number | null
  /**
   * Get the last `n` Mondays.
  **/
  last?: number | null
}

export type FindManyMondayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * Filter, which Mondays to fetch.
  **/
  where?: MondayWhereInput | null
  /**
   * Determine the order of the Mondays to fetch.
  **/
  orderBy?: MondayOrderByInput | null
  /**
   * Skip the first `n` Mondays.
  **/
  skip?: number | null
  /**
   * Get all Mondays that come after the Monday you provide with the current order.
  **/
  after?: MondayWhereUniqueInput | null
  /**
   * Get all Mondays that come before the Monday you provide with the current order.
  **/
  before?: MondayWhereUniqueInput | null
  /**
   * Get the first `n` Mondays.
  **/
  first?: number | null
  /**
   * Get the last `n` Mondays.
  **/
  last?: number | null
}

export type ExtractFindManyMondaySelectArgs<S extends undefined | boolean | FindManyMondaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyMondaySelectArgs
  ? S['select']
  : true

export type ExtractFindManyMondayIncludeArgs<S extends undefined | boolean | FindManyMondayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyMondayIncludeArgs
  ? S['include']
  : true



/**
 * Monday create
 */
export type MondayCreateArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * The data needed to create a Monday.
  **/
  data: MondayCreateInput
}

export type MondayCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * The data needed to create a Monday.
  **/
  data: MondayCreateInput
}

export type MondaySelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * The data needed to create a Monday.
  **/
  data: MondayCreateInput
}

export type MondaySelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * The data needed to create a Monday.
  **/
  data: MondayCreateInput
}

export type MondayIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * The data needed to create a Monday.
  **/
  data: MondayCreateInput
}

export type MondayIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * The data needed to create a Monday.
  **/
  data: MondayCreateInput
}

export type ExtractMondaySelectCreateArgs<S extends undefined | boolean | MondaySelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondaySelectCreateArgs
  ? S['select']
  : true

export type ExtractMondayIncludeCreateArgs<S extends undefined | boolean | MondayIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondayIncludeCreateArgs
  ? S['include']
  : true



/**
 * Monday update
 */
export type MondayUpdateArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * The data needed to update a Monday.
  **/
  data: MondayUpdateInput
  /**
   * Choose, which Monday to update.
  **/
  where: MondayWhereUniqueInput
}

export type MondayUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * The data needed to update a Monday.
  **/
  data: MondayUpdateInput
  /**
   * Choose, which Monday to update.
  **/
  where: MondayWhereUniqueInput
}

export type MondaySelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * The data needed to update a Monday.
  **/
  data: MondayUpdateInput
  /**
   * Choose, which Monday to update.
  **/
  where: MondayWhereUniqueInput
}

export type MondaySelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * The data needed to update a Monday.
  **/
  data: MondayUpdateInput
  /**
   * Choose, which Monday to update.
  **/
  where: MondayWhereUniqueInput
}

export type MondayIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * The data needed to update a Monday.
  **/
  data: MondayUpdateInput
  /**
   * Choose, which Monday to update.
  **/
  where: MondayWhereUniqueInput
}

export type MondayIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * The data needed to update a Monday.
  **/
  data: MondayUpdateInput
  /**
   * Choose, which Monday to update.
  **/
  where: MondayWhereUniqueInput
}

export type ExtractMondaySelectUpdateArgs<S extends undefined | boolean | MondaySelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondaySelectUpdateArgs
  ? S['select']
  : true

export type ExtractMondayIncludeUpdateArgs<S extends undefined | boolean | MondayIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondayIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Monday updateMany
 */
export type MondayUpdateManyArgs = {
  data: MondayUpdateManyMutationInput
  where?: MondayWhereInput | null
}


/**
 * Monday upsert
 */
export type MondayUpsertArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * The filter to search for the Monday to update in case it exists.
  **/
  where: MondayWhereUniqueInput
  /**
   * In case the Monday found by the `where` argument doesn't exist, create a new Monday with this data.
  **/
  create: MondayCreateInput
  /**
   * In case the Monday was found with the provided `where` argument, update it with this data.
  **/
  update: MondayUpdateInput
}

export type MondayUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * The filter to search for the Monday to update in case it exists.
  **/
  where: MondayWhereUniqueInput
  /**
   * In case the Monday found by the `where` argument doesn't exist, create a new Monday with this data.
  **/
  create: MondayCreateInput
  /**
   * In case the Monday was found with the provided `where` argument, update it with this data.
  **/
  update: MondayUpdateInput
}

export type MondaySelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * The filter to search for the Monday to update in case it exists.
  **/
  where: MondayWhereUniqueInput
  /**
   * In case the Monday found by the `where` argument doesn't exist, create a new Monday with this data.
  **/
  create: MondayCreateInput
  /**
   * In case the Monday was found with the provided `where` argument, update it with this data.
  **/
  update: MondayUpdateInput
}

export type MondaySelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * The filter to search for the Monday to update in case it exists.
  **/
  where: MondayWhereUniqueInput
  /**
   * In case the Monday found by the `where` argument doesn't exist, create a new Monday with this data.
  **/
  create: MondayCreateInput
  /**
   * In case the Monday was found with the provided `where` argument, update it with this data.
  **/
  update: MondayUpdateInput
}

export type MondayIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * The filter to search for the Monday to update in case it exists.
  **/
  where: MondayWhereUniqueInput
  /**
   * In case the Monday found by the `where` argument doesn't exist, create a new Monday with this data.
  **/
  create: MondayCreateInput
  /**
   * In case the Monday was found with the provided `where` argument, update it with this data.
  **/
  update: MondayUpdateInput
}

export type MondayIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * The filter to search for the Monday to update in case it exists.
  **/
  where: MondayWhereUniqueInput
  /**
   * In case the Monday found by the `where` argument doesn't exist, create a new Monday with this data.
  **/
  create: MondayCreateInput
  /**
   * In case the Monday was found with the provided `where` argument, update it with this data.
  **/
  update: MondayUpdateInput
}

export type ExtractMondaySelectUpsertArgs<S extends undefined | boolean | MondaySelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondaySelectUpsertArgs
  ? S['select']
  : true

export type ExtractMondayIncludeUpsertArgs<S extends undefined | boolean | MondayIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondayIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Monday delete
 */
export type MondayDeleteArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * Filter which Monday to delete.
  **/
  where: MondayWhereUniqueInput
}

export type MondayDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * Filter which Monday to delete.
  **/
  where: MondayWhereUniqueInput
}

export type MondaySelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Filter which Monday to delete.
  **/
  where: MondayWhereUniqueInput
}

export type MondaySelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Filter which Monday to delete.
  **/
  where: MondayWhereUniqueInput
}

export type MondayIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
  /**
   * Filter which Monday to delete.
  **/
  where: MondayWhereUniqueInput
}

export type MondayIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
  /**
   * Filter which Monday to delete.
  **/
  where: MondayWhereUniqueInput
}

export type ExtractMondaySelectDeleteArgs<S extends undefined | boolean | MondaySelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondaySelectDeleteArgs
  ? S['select']
  : true

export type ExtractMondayIncludeDeleteArgs<S extends undefined | boolean | MondayIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondayIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Monday deleteMany
 */
export type MondayDeleteManyArgs = {
  where?: MondayWhereInput | null
}


/**
 * Monday without action
 */
export type MondayArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
}

export type MondayArgsRequired = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
}

export type MondaySelectArgs = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select: MondaySelect
}

export type MondaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Monday
  **/
  select?: MondaySelect | null
}

export type MondayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: MondayInclude
}

export type MondayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: MondayInclude | null
}

export type ExtractMondaySelectArgs<S extends undefined | boolean | MondaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondaySelectArgs
  ? S['select']
  : true

export type ExtractMondayIncludeArgs<S extends undefined | boolean | MondayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends MondayIncludeArgs
  ? S['include']
  : true




/**
 * Model Tuesday
 */

export type Tuesday = {
  id: number
  eighttoten: boolean
  tentotwelve: boolean
  twelvetotwo: boolean
  twotofour: boolean
  fourtosix: boolean
  createdAt: Date
  updatedAt: Date
}

export type TuesdayScalars = 'id' | 'eighttoten' | 'tentotwelve' | 'twelvetotwo' | 'twotofour' | 'fourtosix' | 'createdAt' | 'updatedAt'
  

export type TuesdaySelect = {
  id?: boolean
  eighttoten?: boolean
  tentotwelve?: boolean
  twelvetotwo?: boolean
  twotofour?: boolean
  fourtosix?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  dayses?: boolean | FindManyDaysSelectArgsOptional
}

export type TuesdayInclude = {
  dayses?: boolean | FindManyDaysIncludeArgsOptional
}

type TuesdayDefault = {
  id: true
  eighttoten: true
  tentotwelve: true
  twelvetotwo: true
  twotofour: true
  fourtosix: true
  createdAt: true
  updatedAt: true
}


export type TuesdayGetSelectPayload<S extends boolean | TuesdaySelect> = S extends true
  ? Tuesday
  : S extends TuesdaySelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends TuesdayScalars
        ? Tuesday[P]
        : P extends 'dayses'
        ? Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<S[P]>>>
        : never
    }
   : never

export type TuesdayGetIncludePayload<S extends boolean | TuesdayInclude> = S extends true
  ? Tuesday
  : S extends TuesdayInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<TuesdayDefault, S>>]: P extends TuesdayScalars
        ? Tuesday[P]
        : P extends 'dayses'
        ? Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface TuesdayDelegate {
  /**
   * Find zero or one Tuesday.
   * @param {FindOneTuesdayArgs} args - Arguments to find a Tuesday
   * @example
   * // Get one Tuesday
   * const tuesday = await prisma.tuesday.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneTuesdayArgs>(
    args: Subset<T, FindOneTuesdayArgs>
  ): T extends FindOneTuesdayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneTuesdaySelectArgs ? Promise<TuesdayGetSelectPayload<ExtractFindOneTuesdaySelectArgs<T>> | null>
  : T extends FindOneTuesdayIncludeArgs ? Promise<TuesdayGetIncludePayload<ExtractFindOneTuesdayIncludeArgs<T>> | null> : TuesdayClient<Tuesday | null>
  /**
   * Find zero or more Tuesdays.
   * @param {FindManyTuesdayArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Tuesdays
   * const tuesdays = await prisma.tuesday.findMany()
   * 
   * // Get first 10 Tuesdays
   * const tuesdays = await prisma.tuesday.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const tuesdayWithIdOnly = await prisma.tuesday.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyTuesdayArgs>(
    args?: Subset<T, FindManyTuesdayArgs>
  ): T extends FindManyTuesdayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyTuesdaySelectArgs
  ? Promise<Array<TuesdayGetSelectPayload<ExtractFindManyTuesdaySelectArgs<T>>>> : T extends FindManyTuesdayIncludeArgs
  ? Promise<Array<TuesdayGetIncludePayload<ExtractFindManyTuesdayIncludeArgs<T>>>> : Promise<Array<Tuesday>>
  /**
   * Create a Tuesday.
   * @param {TuesdayCreateArgs} args - Arguments to create a Tuesday.
   * @example
   * // Create one Tuesday
   * const user = await prisma.tuesday.create({
   *   data: {
   *     // ... data to create a Tuesday
   *   }
   * })
   * 
  **/
  create<T extends TuesdayCreateArgs>(
    args: Subset<T, TuesdayCreateArgs>
  ): T extends TuesdayCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends TuesdaySelectCreateArgs ? Promise<TuesdayGetSelectPayload<ExtractTuesdaySelectCreateArgs<T>>>
  : T extends TuesdayIncludeCreateArgs ? Promise<TuesdayGetIncludePayload<ExtractTuesdayIncludeCreateArgs<T>>> : TuesdayClient<Tuesday>
  /**
   * Delete a Tuesday.
   * @param {TuesdayDeleteArgs} args - Arguments to delete one Tuesday.
   * @example
   * // Delete one Tuesday
   * const user = await prisma.tuesday.delete({
   *   where: {
   *     // ... filter to delete one Tuesday
   *   }
   * })
   * 
  **/
  delete<T extends TuesdayDeleteArgs>(
    args: Subset<T, TuesdayDeleteArgs>
  ): T extends TuesdayDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends TuesdaySelectDeleteArgs ? Promise<TuesdayGetSelectPayload<ExtractTuesdaySelectDeleteArgs<T>>>
  : T extends TuesdayIncludeDeleteArgs ? Promise<TuesdayGetIncludePayload<ExtractTuesdayIncludeDeleteArgs<T>>> : TuesdayClient<Tuesday>
  /**
   * Update one Tuesday.
   * @param {TuesdayUpdateArgs} args - Arguments to update one Tuesday.
   * @example
   * // Update one Tuesday
   * const tuesday = await prisma.tuesday.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends TuesdayUpdateArgs>(
    args: Subset<T, TuesdayUpdateArgs>
  ): T extends TuesdayUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends TuesdaySelectUpdateArgs ? Promise<TuesdayGetSelectPayload<ExtractTuesdaySelectUpdateArgs<T>>>
  : T extends TuesdayIncludeUpdateArgs ? Promise<TuesdayGetIncludePayload<ExtractTuesdayIncludeUpdateArgs<T>>> : TuesdayClient<Tuesday>
  /**
   * Delete zero or more Tuesdays.
   * @param {TuesdayDeleteManyArgs} args - Arguments to filter Tuesdays to delete.
   * @example
   * // Delete a few Tuesdays
   * const { count } = await prisma.tuesday.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends TuesdayDeleteManyArgs>(
    args: Subset<T, TuesdayDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Tuesdays.
   * @param {TuesdayUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Tuesdays
   * const tuesday = await prisma.tuesday.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends TuesdayUpdateManyArgs>(
    args: Subset<T, TuesdayUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Tuesday.
   * @param {TuesdayUpsertArgs} args - Arguments to update or create a Tuesday.
   * @example
   * // Update or create a Tuesday
   * const tuesday = await prisma.tuesday.upsert({
   *   create: {
   *     // ... data to create a Tuesday
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Tuesday we want to update
   *   }
   * })
  **/
  upsert<T extends TuesdayUpsertArgs>(
    args: Subset<T, TuesdayUpsertArgs>
  ): T extends TuesdayUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends TuesdaySelectUpsertArgs ? Promise<TuesdayGetSelectPayload<ExtractTuesdaySelectUpsertArgs<T>>>
  : T extends TuesdayIncludeUpsertArgs ? Promise<TuesdayGetIncludePayload<ExtractTuesdayIncludeUpsertArgs<T>>> : TuesdayClient<Tuesday>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class TuesdayClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  dayses<T extends FindManyDaysArgs = {}>(args?: Subset<T, FindManyDaysArgs>): T extends FindManyDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyDaysSelectArgs
  ? Promise<Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<T>>>> : T extends FindManyDaysIncludeArgs
  ? Promise<Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<T>>>> : Promise<Array<Days>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Tuesday findOne
 */
export type FindOneTuesdayArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * Filter, which Tuesday to fetch.
  **/
  where: TuesdayWhereUniqueInput
}

export type FindOneTuesdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * Filter, which Tuesday to fetch.
  **/
  where: TuesdayWhereUniqueInput
}

export type FindOneTuesdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Filter, which Tuesday to fetch.
  **/
  where: TuesdayWhereUniqueInput
}

export type FindOneTuesdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Filter, which Tuesday to fetch.
  **/
  where: TuesdayWhereUniqueInput
}

export type FindOneTuesdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * Filter, which Tuesday to fetch.
  **/
  where: TuesdayWhereUniqueInput
}

export type FindOneTuesdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * Filter, which Tuesday to fetch.
  **/
  where: TuesdayWhereUniqueInput
}

export type ExtractFindOneTuesdaySelectArgs<S extends undefined | boolean | FindOneTuesdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneTuesdaySelectArgs
  ? S['select']
  : true

export type ExtractFindOneTuesdayIncludeArgs<S extends undefined | boolean | FindOneTuesdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneTuesdayIncludeArgs
  ? S['include']
  : true



/**
 * Tuesday findMany
 */
export type FindManyTuesdayArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * Filter, which Tuesdays to fetch.
  **/
  where?: TuesdayWhereInput | null
  /**
   * Determine the order of the Tuesdays to fetch.
  **/
  orderBy?: TuesdayOrderByInput | null
  /**
   * Skip the first `n` Tuesdays.
  **/
  skip?: number | null
  /**
   * Get all Tuesdays that come after the Tuesday you provide with the current order.
  **/
  after?: TuesdayWhereUniqueInput | null
  /**
   * Get all Tuesdays that come before the Tuesday you provide with the current order.
  **/
  before?: TuesdayWhereUniqueInput | null
  /**
   * Get the first `n` Tuesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Tuesdays.
  **/
  last?: number | null
}

export type FindManyTuesdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * Filter, which Tuesdays to fetch.
  **/
  where?: TuesdayWhereInput | null
  /**
   * Determine the order of the Tuesdays to fetch.
  **/
  orderBy?: TuesdayOrderByInput | null
  /**
   * Skip the first `n` Tuesdays.
  **/
  skip?: number | null
  /**
   * Get all Tuesdays that come after the Tuesday you provide with the current order.
  **/
  after?: TuesdayWhereUniqueInput | null
  /**
   * Get all Tuesdays that come before the Tuesday you provide with the current order.
  **/
  before?: TuesdayWhereUniqueInput | null
  /**
   * Get the first `n` Tuesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Tuesdays.
  **/
  last?: number | null
}

export type FindManyTuesdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Filter, which Tuesdays to fetch.
  **/
  where?: TuesdayWhereInput | null
  /**
   * Determine the order of the Tuesdays to fetch.
  **/
  orderBy?: TuesdayOrderByInput | null
  /**
   * Skip the first `n` Tuesdays.
  **/
  skip?: number | null
  /**
   * Get all Tuesdays that come after the Tuesday you provide with the current order.
  **/
  after?: TuesdayWhereUniqueInput | null
  /**
   * Get all Tuesdays that come before the Tuesday you provide with the current order.
  **/
  before?: TuesdayWhereUniqueInput | null
  /**
   * Get the first `n` Tuesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Tuesdays.
  **/
  last?: number | null
}

export type FindManyTuesdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Filter, which Tuesdays to fetch.
  **/
  where?: TuesdayWhereInput | null
  /**
   * Determine the order of the Tuesdays to fetch.
  **/
  orderBy?: TuesdayOrderByInput | null
  /**
   * Skip the first `n` Tuesdays.
  **/
  skip?: number | null
  /**
   * Get all Tuesdays that come after the Tuesday you provide with the current order.
  **/
  after?: TuesdayWhereUniqueInput | null
  /**
   * Get all Tuesdays that come before the Tuesday you provide with the current order.
  **/
  before?: TuesdayWhereUniqueInput | null
  /**
   * Get the first `n` Tuesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Tuesdays.
  **/
  last?: number | null
}

export type FindManyTuesdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * Filter, which Tuesdays to fetch.
  **/
  where?: TuesdayWhereInput | null
  /**
   * Determine the order of the Tuesdays to fetch.
  **/
  orderBy?: TuesdayOrderByInput | null
  /**
   * Skip the first `n` Tuesdays.
  **/
  skip?: number | null
  /**
   * Get all Tuesdays that come after the Tuesday you provide with the current order.
  **/
  after?: TuesdayWhereUniqueInput | null
  /**
   * Get all Tuesdays that come before the Tuesday you provide with the current order.
  **/
  before?: TuesdayWhereUniqueInput | null
  /**
   * Get the first `n` Tuesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Tuesdays.
  **/
  last?: number | null
}

export type FindManyTuesdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * Filter, which Tuesdays to fetch.
  **/
  where?: TuesdayWhereInput | null
  /**
   * Determine the order of the Tuesdays to fetch.
  **/
  orderBy?: TuesdayOrderByInput | null
  /**
   * Skip the first `n` Tuesdays.
  **/
  skip?: number | null
  /**
   * Get all Tuesdays that come after the Tuesday you provide with the current order.
  **/
  after?: TuesdayWhereUniqueInput | null
  /**
   * Get all Tuesdays that come before the Tuesday you provide with the current order.
  **/
  before?: TuesdayWhereUniqueInput | null
  /**
   * Get the first `n` Tuesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Tuesdays.
  **/
  last?: number | null
}

export type ExtractFindManyTuesdaySelectArgs<S extends undefined | boolean | FindManyTuesdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyTuesdaySelectArgs
  ? S['select']
  : true

export type ExtractFindManyTuesdayIncludeArgs<S extends undefined | boolean | FindManyTuesdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyTuesdayIncludeArgs
  ? S['include']
  : true



/**
 * Tuesday create
 */
export type TuesdayCreateArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * The data needed to create a Tuesday.
  **/
  data: TuesdayCreateInput
}

export type TuesdayCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * The data needed to create a Tuesday.
  **/
  data: TuesdayCreateInput
}

export type TuesdaySelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * The data needed to create a Tuesday.
  **/
  data: TuesdayCreateInput
}

export type TuesdaySelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * The data needed to create a Tuesday.
  **/
  data: TuesdayCreateInput
}

export type TuesdayIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * The data needed to create a Tuesday.
  **/
  data: TuesdayCreateInput
}

export type TuesdayIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * The data needed to create a Tuesday.
  **/
  data: TuesdayCreateInput
}

export type ExtractTuesdaySelectCreateArgs<S extends undefined | boolean | TuesdaySelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdaySelectCreateArgs
  ? S['select']
  : true

export type ExtractTuesdayIncludeCreateArgs<S extends undefined | boolean | TuesdayIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdayIncludeCreateArgs
  ? S['include']
  : true



/**
 * Tuesday update
 */
export type TuesdayUpdateArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * The data needed to update a Tuesday.
  **/
  data: TuesdayUpdateInput
  /**
   * Choose, which Tuesday to update.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdayUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * The data needed to update a Tuesday.
  **/
  data: TuesdayUpdateInput
  /**
   * Choose, which Tuesday to update.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdaySelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * The data needed to update a Tuesday.
  **/
  data: TuesdayUpdateInput
  /**
   * Choose, which Tuesday to update.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdaySelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * The data needed to update a Tuesday.
  **/
  data: TuesdayUpdateInput
  /**
   * Choose, which Tuesday to update.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdayIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * The data needed to update a Tuesday.
  **/
  data: TuesdayUpdateInput
  /**
   * Choose, which Tuesday to update.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdayIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * The data needed to update a Tuesday.
  **/
  data: TuesdayUpdateInput
  /**
   * Choose, which Tuesday to update.
  **/
  where: TuesdayWhereUniqueInput
}

export type ExtractTuesdaySelectUpdateArgs<S extends undefined | boolean | TuesdaySelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdaySelectUpdateArgs
  ? S['select']
  : true

export type ExtractTuesdayIncludeUpdateArgs<S extends undefined | boolean | TuesdayIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdayIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Tuesday updateMany
 */
export type TuesdayUpdateManyArgs = {
  data: TuesdayUpdateManyMutationInput
  where?: TuesdayWhereInput | null
}


/**
 * Tuesday upsert
 */
export type TuesdayUpsertArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * The filter to search for the Tuesday to update in case it exists.
  **/
  where: TuesdayWhereUniqueInput
  /**
   * In case the Tuesday found by the `where` argument doesn't exist, create a new Tuesday with this data.
  **/
  create: TuesdayCreateInput
  /**
   * In case the Tuesday was found with the provided `where` argument, update it with this data.
  **/
  update: TuesdayUpdateInput
}

export type TuesdayUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * The filter to search for the Tuesday to update in case it exists.
  **/
  where: TuesdayWhereUniqueInput
  /**
   * In case the Tuesday found by the `where` argument doesn't exist, create a new Tuesday with this data.
  **/
  create: TuesdayCreateInput
  /**
   * In case the Tuesday was found with the provided `where` argument, update it with this data.
  **/
  update: TuesdayUpdateInput
}

export type TuesdaySelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * The filter to search for the Tuesday to update in case it exists.
  **/
  where: TuesdayWhereUniqueInput
  /**
   * In case the Tuesday found by the `where` argument doesn't exist, create a new Tuesday with this data.
  **/
  create: TuesdayCreateInput
  /**
   * In case the Tuesday was found with the provided `where` argument, update it with this data.
  **/
  update: TuesdayUpdateInput
}

export type TuesdaySelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * The filter to search for the Tuesday to update in case it exists.
  **/
  where: TuesdayWhereUniqueInput
  /**
   * In case the Tuesday found by the `where` argument doesn't exist, create a new Tuesday with this data.
  **/
  create: TuesdayCreateInput
  /**
   * In case the Tuesday was found with the provided `where` argument, update it with this data.
  **/
  update: TuesdayUpdateInput
}

export type TuesdayIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * The filter to search for the Tuesday to update in case it exists.
  **/
  where: TuesdayWhereUniqueInput
  /**
   * In case the Tuesday found by the `where` argument doesn't exist, create a new Tuesday with this data.
  **/
  create: TuesdayCreateInput
  /**
   * In case the Tuesday was found with the provided `where` argument, update it with this data.
  **/
  update: TuesdayUpdateInput
}

export type TuesdayIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * The filter to search for the Tuesday to update in case it exists.
  **/
  where: TuesdayWhereUniqueInput
  /**
   * In case the Tuesday found by the `where` argument doesn't exist, create a new Tuesday with this data.
  **/
  create: TuesdayCreateInput
  /**
   * In case the Tuesday was found with the provided `where` argument, update it with this data.
  **/
  update: TuesdayUpdateInput
}

export type ExtractTuesdaySelectUpsertArgs<S extends undefined | boolean | TuesdaySelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdaySelectUpsertArgs
  ? S['select']
  : true

export type ExtractTuesdayIncludeUpsertArgs<S extends undefined | boolean | TuesdayIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdayIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Tuesday delete
 */
export type TuesdayDeleteArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * Filter which Tuesday to delete.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdayDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * Filter which Tuesday to delete.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdaySelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Filter which Tuesday to delete.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdaySelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Filter which Tuesday to delete.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdayIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
  /**
   * Filter which Tuesday to delete.
  **/
  where: TuesdayWhereUniqueInput
}

export type TuesdayIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
  /**
   * Filter which Tuesday to delete.
  **/
  where: TuesdayWhereUniqueInput
}

export type ExtractTuesdaySelectDeleteArgs<S extends undefined | boolean | TuesdaySelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdaySelectDeleteArgs
  ? S['select']
  : true

export type ExtractTuesdayIncludeDeleteArgs<S extends undefined | boolean | TuesdayIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdayIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Tuesday deleteMany
 */
export type TuesdayDeleteManyArgs = {
  where?: TuesdayWhereInput | null
}


/**
 * Tuesday without action
 */
export type TuesdayArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
}

export type TuesdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
}

export type TuesdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select: TuesdaySelect
}

export type TuesdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Tuesday
  **/
  select?: TuesdaySelect | null
}

export type TuesdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: TuesdayInclude
}

export type TuesdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: TuesdayInclude | null
}

export type ExtractTuesdaySelectArgs<S extends undefined | boolean | TuesdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdaySelectArgs
  ? S['select']
  : true

export type ExtractTuesdayIncludeArgs<S extends undefined | boolean | TuesdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends TuesdayIncludeArgs
  ? S['include']
  : true




/**
 * Model Wednesday
 */

export type Wednesday = {
  id: number
  eighttoten: boolean
  tentotwelve: boolean
  twelvetotwo: boolean
  twotofour: boolean
  fourtosix: boolean
  createdAt: Date
  updatedAt: Date
}

export type WednesdayScalars = 'id' | 'eighttoten' | 'tentotwelve' | 'twelvetotwo' | 'twotofour' | 'fourtosix' | 'createdAt' | 'updatedAt'
  

export type WednesdaySelect = {
  id?: boolean
  eighttoten?: boolean
  tentotwelve?: boolean
  twelvetotwo?: boolean
  twotofour?: boolean
  fourtosix?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  dayses?: boolean | FindManyDaysSelectArgsOptional
}

export type WednesdayInclude = {
  dayses?: boolean | FindManyDaysIncludeArgsOptional
}

type WednesdayDefault = {
  id: true
  eighttoten: true
  tentotwelve: true
  twelvetotwo: true
  twotofour: true
  fourtosix: true
  createdAt: true
  updatedAt: true
}


export type WednesdayGetSelectPayload<S extends boolean | WednesdaySelect> = S extends true
  ? Wednesday
  : S extends WednesdaySelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends WednesdayScalars
        ? Wednesday[P]
        : P extends 'dayses'
        ? Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<S[P]>>>
        : never
    }
   : never

export type WednesdayGetIncludePayload<S extends boolean | WednesdayInclude> = S extends true
  ? Wednesday
  : S extends WednesdayInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<WednesdayDefault, S>>]: P extends WednesdayScalars
        ? Wednesday[P]
        : P extends 'dayses'
        ? Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface WednesdayDelegate {
  /**
   * Find zero or one Wednesday.
   * @param {FindOneWednesdayArgs} args - Arguments to find a Wednesday
   * @example
   * // Get one Wednesday
   * const wednesday = await prisma.wednesday.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneWednesdayArgs>(
    args: Subset<T, FindOneWednesdayArgs>
  ): T extends FindOneWednesdayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneWednesdaySelectArgs ? Promise<WednesdayGetSelectPayload<ExtractFindOneWednesdaySelectArgs<T>> | null>
  : T extends FindOneWednesdayIncludeArgs ? Promise<WednesdayGetIncludePayload<ExtractFindOneWednesdayIncludeArgs<T>> | null> : WednesdayClient<Wednesday | null>
  /**
   * Find zero or more Wednesdays.
   * @param {FindManyWednesdayArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Wednesdays
   * const wednesdays = await prisma.wednesday.findMany()
   * 
   * // Get first 10 Wednesdays
   * const wednesdays = await prisma.wednesday.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const wednesdayWithIdOnly = await prisma.wednesday.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyWednesdayArgs>(
    args?: Subset<T, FindManyWednesdayArgs>
  ): T extends FindManyWednesdayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyWednesdaySelectArgs
  ? Promise<Array<WednesdayGetSelectPayload<ExtractFindManyWednesdaySelectArgs<T>>>> : T extends FindManyWednesdayIncludeArgs
  ? Promise<Array<WednesdayGetIncludePayload<ExtractFindManyWednesdayIncludeArgs<T>>>> : Promise<Array<Wednesday>>
  /**
   * Create a Wednesday.
   * @param {WednesdayCreateArgs} args - Arguments to create a Wednesday.
   * @example
   * // Create one Wednesday
   * const user = await prisma.wednesday.create({
   *   data: {
   *     // ... data to create a Wednesday
   *   }
   * })
   * 
  **/
  create<T extends WednesdayCreateArgs>(
    args: Subset<T, WednesdayCreateArgs>
  ): T extends WednesdayCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends WednesdaySelectCreateArgs ? Promise<WednesdayGetSelectPayload<ExtractWednesdaySelectCreateArgs<T>>>
  : T extends WednesdayIncludeCreateArgs ? Promise<WednesdayGetIncludePayload<ExtractWednesdayIncludeCreateArgs<T>>> : WednesdayClient<Wednesday>
  /**
   * Delete a Wednesday.
   * @param {WednesdayDeleteArgs} args - Arguments to delete one Wednesday.
   * @example
   * // Delete one Wednesday
   * const user = await prisma.wednesday.delete({
   *   where: {
   *     // ... filter to delete one Wednesday
   *   }
   * })
   * 
  **/
  delete<T extends WednesdayDeleteArgs>(
    args: Subset<T, WednesdayDeleteArgs>
  ): T extends WednesdayDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends WednesdaySelectDeleteArgs ? Promise<WednesdayGetSelectPayload<ExtractWednesdaySelectDeleteArgs<T>>>
  : T extends WednesdayIncludeDeleteArgs ? Promise<WednesdayGetIncludePayload<ExtractWednesdayIncludeDeleteArgs<T>>> : WednesdayClient<Wednesday>
  /**
   * Update one Wednesday.
   * @param {WednesdayUpdateArgs} args - Arguments to update one Wednesday.
   * @example
   * // Update one Wednesday
   * const wednesday = await prisma.wednesday.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends WednesdayUpdateArgs>(
    args: Subset<T, WednesdayUpdateArgs>
  ): T extends WednesdayUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends WednesdaySelectUpdateArgs ? Promise<WednesdayGetSelectPayload<ExtractWednesdaySelectUpdateArgs<T>>>
  : T extends WednesdayIncludeUpdateArgs ? Promise<WednesdayGetIncludePayload<ExtractWednesdayIncludeUpdateArgs<T>>> : WednesdayClient<Wednesday>
  /**
   * Delete zero or more Wednesdays.
   * @param {WednesdayDeleteManyArgs} args - Arguments to filter Wednesdays to delete.
   * @example
   * // Delete a few Wednesdays
   * const { count } = await prisma.wednesday.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends WednesdayDeleteManyArgs>(
    args: Subset<T, WednesdayDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Wednesdays.
   * @param {WednesdayUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Wednesdays
   * const wednesday = await prisma.wednesday.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends WednesdayUpdateManyArgs>(
    args: Subset<T, WednesdayUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Wednesday.
   * @param {WednesdayUpsertArgs} args - Arguments to update or create a Wednesday.
   * @example
   * // Update or create a Wednesday
   * const wednesday = await prisma.wednesday.upsert({
   *   create: {
   *     // ... data to create a Wednesday
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Wednesday we want to update
   *   }
   * })
  **/
  upsert<T extends WednesdayUpsertArgs>(
    args: Subset<T, WednesdayUpsertArgs>
  ): T extends WednesdayUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends WednesdaySelectUpsertArgs ? Promise<WednesdayGetSelectPayload<ExtractWednesdaySelectUpsertArgs<T>>>
  : T extends WednesdayIncludeUpsertArgs ? Promise<WednesdayGetIncludePayload<ExtractWednesdayIncludeUpsertArgs<T>>> : WednesdayClient<Wednesday>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class WednesdayClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  dayses<T extends FindManyDaysArgs = {}>(args?: Subset<T, FindManyDaysArgs>): T extends FindManyDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyDaysSelectArgs
  ? Promise<Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<T>>>> : T extends FindManyDaysIncludeArgs
  ? Promise<Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<T>>>> : Promise<Array<Days>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Wednesday findOne
 */
export type FindOneWednesdayArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * Filter, which Wednesday to fetch.
  **/
  where: WednesdayWhereUniqueInput
}

export type FindOneWednesdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * Filter, which Wednesday to fetch.
  **/
  where: WednesdayWhereUniqueInput
}

export type FindOneWednesdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Filter, which Wednesday to fetch.
  **/
  where: WednesdayWhereUniqueInput
}

export type FindOneWednesdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Filter, which Wednesday to fetch.
  **/
  where: WednesdayWhereUniqueInput
}

export type FindOneWednesdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * Filter, which Wednesday to fetch.
  **/
  where: WednesdayWhereUniqueInput
}

export type FindOneWednesdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * Filter, which Wednesday to fetch.
  **/
  where: WednesdayWhereUniqueInput
}

export type ExtractFindOneWednesdaySelectArgs<S extends undefined | boolean | FindOneWednesdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneWednesdaySelectArgs
  ? S['select']
  : true

export type ExtractFindOneWednesdayIncludeArgs<S extends undefined | boolean | FindOneWednesdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneWednesdayIncludeArgs
  ? S['include']
  : true



/**
 * Wednesday findMany
 */
export type FindManyWednesdayArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * Filter, which Wednesdays to fetch.
  **/
  where?: WednesdayWhereInput | null
  /**
   * Determine the order of the Wednesdays to fetch.
  **/
  orderBy?: WednesdayOrderByInput | null
  /**
   * Skip the first `n` Wednesdays.
  **/
  skip?: number | null
  /**
   * Get all Wednesdays that come after the Wednesday you provide with the current order.
  **/
  after?: WednesdayWhereUniqueInput | null
  /**
   * Get all Wednesdays that come before the Wednesday you provide with the current order.
  **/
  before?: WednesdayWhereUniqueInput | null
  /**
   * Get the first `n` Wednesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Wednesdays.
  **/
  last?: number | null
}

export type FindManyWednesdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * Filter, which Wednesdays to fetch.
  **/
  where?: WednesdayWhereInput | null
  /**
   * Determine the order of the Wednesdays to fetch.
  **/
  orderBy?: WednesdayOrderByInput | null
  /**
   * Skip the first `n` Wednesdays.
  **/
  skip?: number | null
  /**
   * Get all Wednesdays that come after the Wednesday you provide with the current order.
  **/
  after?: WednesdayWhereUniqueInput | null
  /**
   * Get all Wednesdays that come before the Wednesday you provide with the current order.
  **/
  before?: WednesdayWhereUniqueInput | null
  /**
   * Get the first `n` Wednesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Wednesdays.
  **/
  last?: number | null
}

export type FindManyWednesdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Filter, which Wednesdays to fetch.
  **/
  where?: WednesdayWhereInput | null
  /**
   * Determine the order of the Wednesdays to fetch.
  **/
  orderBy?: WednesdayOrderByInput | null
  /**
   * Skip the first `n` Wednesdays.
  **/
  skip?: number | null
  /**
   * Get all Wednesdays that come after the Wednesday you provide with the current order.
  **/
  after?: WednesdayWhereUniqueInput | null
  /**
   * Get all Wednesdays that come before the Wednesday you provide with the current order.
  **/
  before?: WednesdayWhereUniqueInput | null
  /**
   * Get the first `n` Wednesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Wednesdays.
  **/
  last?: number | null
}

export type FindManyWednesdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Filter, which Wednesdays to fetch.
  **/
  where?: WednesdayWhereInput | null
  /**
   * Determine the order of the Wednesdays to fetch.
  **/
  orderBy?: WednesdayOrderByInput | null
  /**
   * Skip the first `n` Wednesdays.
  **/
  skip?: number | null
  /**
   * Get all Wednesdays that come after the Wednesday you provide with the current order.
  **/
  after?: WednesdayWhereUniqueInput | null
  /**
   * Get all Wednesdays that come before the Wednesday you provide with the current order.
  **/
  before?: WednesdayWhereUniqueInput | null
  /**
   * Get the first `n` Wednesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Wednesdays.
  **/
  last?: number | null
}

export type FindManyWednesdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * Filter, which Wednesdays to fetch.
  **/
  where?: WednesdayWhereInput | null
  /**
   * Determine the order of the Wednesdays to fetch.
  **/
  orderBy?: WednesdayOrderByInput | null
  /**
   * Skip the first `n` Wednesdays.
  **/
  skip?: number | null
  /**
   * Get all Wednesdays that come after the Wednesday you provide with the current order.
  **/
  after?: WednesdayWhereUniqueInput | null
  /**
   * Get all Wednesdays that come before the Wednesday you provide with the current order.
  **/
  before?: WednesdayWhereUniqueInput | null
  /**
   * Get the first `n` Wednesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Wednesdays.
  **/
  last?: number | null
}

export type FindManyWednesdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * Filter, which Wednesdays to fetch.
  **/
  where?: WednesdayWhereInput | null
  /**
   * Determine the order of the Wednesdays to fetch.
  **/
  orderBy?: WednesdayOrderByInput | null
  /**
   * Skip the first `n` Wednesdays.
  **/
  skip?: number | null
  /**
   * Get all Wednesdays that come after the Wednesday you provide with the current order.
  **/
  after?: WednesdayWhereUniqueInput | null
  /**
   * Get all Wednesdays that come before the Wednesday you provide with the current order.
  **/
  before?: WednesdayWhereUniqueInput | null
  /**
   * Get the first `n` Wednesdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Wednesdays.
  **/
  last?: number | null
}

export type ExtractFindManyWednesdaySelectArgs<S extends undefined | boolean | FindManyWednesdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyWednesdaySelectArgs
  ? S['select']
  : true

export type ExtractFindManyWednesdayIncludeArgs<S extends undefined | boolean | FindManyWednesdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyWednesdayIncludeArgs
  ? S['include']
  : true



/**
 * Wednesday create
 */
export type WednesdayCreateArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * The data needed to create a Wednesday.
  **/
  data: WednesdayCreateInput
}

export type WednesdayCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * The data needed to create a Wednesday.
  **/
  data: WednesdayCreateInput
}

export type WednesdaySelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * The data needed to create a Wednesday.
  **/
  data: WednesdayCreateInput
}

export type WednesdaySelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * The data needed to create a Wednesday.
  **/
  data: WednesdayCreateInput
}

export type WednesdayIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * The data needed to create a Wednesday.
  **/
  data: WednesdayCreateInput
}

export type WednesdayIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * The data needed to create a Wednesday.
  **/
  data: WednesdayCreateInput
}

export type ExtractWednesdaySelectCreateArgs<S extends undefined | boolean | WednesdaySelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdaySelectCreateArgs
  ? S['select']
  : true

export type ExtractWednesdayIncludeCreateArgs<S extends undefined | boolean | WednesdayIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdayIncludeCreateArgs
  ? S['include']
  : true



/**
 * Wednesday update
 */
export type WednesdayUpdateArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * The data needed to update a Wednesday.
  **/
  data: WednesdayUpdateInput
  /**
   * Choose, which Wednesday to update.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdayUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * The data needed to update a Wednesday.
  **/
  data: WednesdayUpdateInput
  /**
   * Choose, which Wednesday to update.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdaySelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * The data needed to update a Wednesday.
  **/
  data: WednesdayUpdateInput
  /**
   * Choose, which Wednesday to update.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdaySelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * The data needed to update a Wednesday.
  **/
  data: WednesdayUpdateInput
  /**
   * Choose, which Wednesday to update.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdayIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * The data needed to update a Wednesday.
  **/
  data: WednesdayUpdateInput
  /**
   * Choose, which Wednesday to update.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdayIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * The data needed to update a Wednesday.
  **/
  data: WednesdayUpdateInput
  /**
   * Choose, which Wednesday to update.
  **/
  where: WednesdayWhereUniqueInput
}

export type ExtractWednesdaySelectUpdateArgs<S extends undefined | boolean | WednesdaySelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdaySelectUpdateArgs
  ? S['select']
  : true

export type ExtractWednesdayIncludeUpdateArgs<S extends undefined | boolean | WednesdayIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdayIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Wednesday updateMany
 */
export type WednesdayUpdateManyArgs = {
  data: WednesdayUpdateManyMutationInput
  where?: WednesdayWhereInput | null
}


/**
 * Wednesday upsert
 */
export type WednesdayUpsertArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * The filter to search for the Wednesday to update in case it exists.
  **/
  where: WednesdayWhereUniqueInput
  /**
   * In case the Wednesday found by the `where` argument doesn't exist, create a new Wednesday with this data.
  **/
  create: WednesdayCreateInput
  /**
   * In case the Wednesday was found with the provided `where` argument, update it with this data.
  **/
  update: WednesdayUpdateInput
}

export type WednesdayUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * The filter to search for the Wednesday to update in case it exists.
  **/
  where: WednesdayWhereUniqueInput
  /**
   * In case the Wednesday found by the `where` argument doesn't exist, create a new Wednesday with this data.
  **/
  create: WednesdayCreateInput
  /**
   * In case the Wednesday was found with the provided `where` argument, update it with this data.
  **/
  update: WednesdayUpdateInput
}

export type WednesdaySelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * The filter to search for the Wednesday to update in case it exists.
  **/
  where: WednesdayWhereUniqueInput
  /**
   * In case the Wednesday found by the `where` argument doesn't exist, create a new Wednesday with this data.
  **/
  create: WednesdayCreateInput
  /**
   * In case the Wednesday was found with the provided `where` argument, update it with this data.
  **/
  update: WednesdayUpdateInput
}

export type WednesdaySelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * The filter to search for the Wednesday to update in case it exists.
  **/
  where: WednesdayWhereUniqueInput
  /**
   * In case the Wednesday found by the `where` argument doesn't exist, create a new Wednesday with this data.
  **/
  create: WednesdayCreateInput
  /**
   * In case the Wednesday was found with the provided `where` argument, update it with this data.
  **/
  update: WednesdayUpdateInput
}

export type WednesdayIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * The filter to search for the Wednesday to update in case it exists.
  **/
  where: WednesdayWhereUniqueInput
  /**
   * In case the Wednesday found by the `where` argument doesn't exist, create a new Wednesday with this data.
  **/
  create: WednesdayCreateInput
  /**
   * In case the Wednesday was found with the provided `where` argument, update it with this data.
  **/
  update: WednesdayUpdateInput
}

export type WednesdayIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * The filter to search for the Wednesday to update in case it exists.
  **/
  where: WednesdayWhereUniqueInput
  /**
   * In case the Wednesday found by the `where` argument doesn't exist, create a new Wednesday with this data.
  **/
  create: WednesdayCreateInput
  /**
   * In case the Wednesday was found with the provided `where` argument, update it with this data.
  **/
  update: WednesdayUpdateInput
}

export type ExtractWednesdaySelectUpsertArgs<S extends undefined | boolean | WednesdaySelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdaySelectUpsertArgs
  ? S['select']
  : true

export type ExtractWednesdayIncludeUpsertArgs<S extends undefined | boolean | WednesdayIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdayIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Wednesday delete
 */
export type WednesdayDeleteArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * Filter which Wednesday to delete.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdayDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * Filter which Wednesday to delete.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdaySelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Filter which Wednesday to delete.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdaySelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Filter which Wednesday to delete.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdayIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
  /**
   * Filter which Wednesday to delete.
  **/
  where: WednesdayWhereUniqueInput
}

export type WednesdayIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
  /**
   * Filter which Wednesday to delete.
  **/
  where: WednesdayWhereUniqueInput
}

export type ExtractWednesdaySelectDeleteArgs<S extends undefined | boolean | WednesdaySelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdaySelectDeleteArgs
  ? S['select']
  : true

export type ExtractWednesdayIncludeDeleteArgs<S extends undefined | boolean | WednesdayIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdayIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Wednesday deleteMany
 */
export type WednesdayDeleteManyArgs = {
  where?: WednesdayWhereInput | null
}


/**
 * Wednesday without action
 */
export type WednesdayArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
}

export type WednesdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
}

export type WednesdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select: WednesdaySelect
}

export type WednesdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Wednesday
  **/
  select?: WednesdaySelect | null
}

export type WednesdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: WednesdayInclude
}

export type WednesdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: WednesdayInclude | null
}

export type ExtractWednesdaySelectArgs<S extends undefined | boolean | WednesdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdaySelectArgs
  ? S['select']
  : true

export type ExtractWednesdayIncludeArgs<S extends undefined | boolean | WednesdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends WednesdayIncludeArgs
  ? S['include']
  : true




/**
 * Model Thursday
 */

export type Thursday = {
  id: number
  eighttoten: boolean
  tentotwelve: boolean
  twelvetotwo: boolean
  twotofour: boolean
  fourtosix: boolean
  createdAt: Date
  updatedAt: Date
}

export type ThursdayScalars = 'id' | 'eighttoten' | 'tentotwelve' | 'twelvetotwo' | 'twotofour' | 'fourtosix' | 'createdAt' | 'updatedAt'
  

export type ThursdaySelect = {
  id?: boolean
  eighttoten?: boolean
  tentotwelve?: boolean
  twelvetotwo?: boolean
  twotofour?: boolean
  fourtosix?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  dayses?: boolean | FindManyDaysSelectArgsOptional
}

export type ThursdayInclude = {
  dayses?: boolean | FindManyDaysIncludeArgsOptional
}

type ThursdayDefault = {
  id: true
  eighttoten: true
  tentotwelve: true
  twelvetotwo: true
  twotofour: true
  fourtosix: true
  createdAt: true
  updatedAt: true
}


export type ThursdayGetSelectPayload<S extends boolean | ThursdaySelect> = S extends true
  ? Thursday
  : S extends ThursdaySelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends ThursdayScalars
        ? Thursday[P]
        : P extends 'dayses'
        ? Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<S[P]>>>
        : never
    }
   : never

export type ThursdayGetIncludePayload<S extends boolean | ThursdayInclude> = S extends true
  ? Thursday
  : S extends ThursdayInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<ThursdayDefault, S>>]: P extends ThursdayScalars
        ? Thursday[P]
        : P extends 'dayses'
        ? Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface ThursdayDelegate {
  /**
   * Find zero or one Thursday.
   * @param {FindOneThursdayArgs} args - Arguments to find a Thursday
   * @example
   * // Get one Thursday
   * const thursday = await prisma.thursday.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneThursdayArgs>(
    args: Subset<T, FindOneThursdayArgs>
  ): T extends FindOneThursdayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneThursdaySelectArgs ? Promise<ThursdayGetSelectPayload<ExtractFindOneThursdaySelectArgs<T>> | null>
  : T extends FindOneThursdayIncludeArgs ? Promise<ThursdayGetIncludePayload<ExtractFindOneThursdayIncludeArgs<T>> | null> : ThursdayClient<Thursday | null>
  /**
   * Find zero or more Thursdays.
   * @param {FindManyThursdayArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Thursdays
   * const thursdays = await prisma.thursday.findMany()
   * 
   * // Get first 10 Thursdays
   * const thursdays = await prisma.thursday.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const thursdayWithIdOnly = await prisma.thursday.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyThursdayArgs>(
    args?: Subset<T, FindManyThursdayArgs>
  ): T extends FindManyThursdayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyThursdaySelectArgs
  ? Promise<Array<ThursdayGetSelectPayload<ExtractFindManyThursdaySelectArgs<T>>>> : T extends FindManyThursdayIncludeArgs
  ? Promise<Array<ThursdayGetIncludePayload<ExtractFindManyThursdayIncludeArgs<T>>>> : Promise<Array<Thursday>>
  /**
   * Create a Thursday.
   * @param {ThursdayCreateArgs} args - Arguments to create a Thursday.
   * @example
   * // Create one Thursday
   * const user = await prisma.thursday.create({
   *   data: {
   *     // ... data to create a Thursday
   *   }
   * })
   * 
  **/
  create<T extends ThursdayCreateArgs>(
    args: Subset<T, ThursdayCreateArgs>
  ): T extends ThursdayCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends ThursdaySelectCreateArgs ? Promise<ThursdayGetSelectPayload<ExtractThursdaySelectCreateArgs<T>>>
  : T extends ThursdayIncludeCreateArgs ? Promise<ThursdayGetIncludePayload<ExtractThursdayIncludeCreateArgs<T>>> : ThursdayClient<Thursday>
  /**
   * Delete a Thursday.
   * @param {ThursdayDeleteArgs} args - Arguments to delete one Thursday.
   * @example
   * // Delete one Thursday
   * const user = await prisma.thursday.delete({
   *   where: {
   *     // ... filter to delete one Thursday
   *   }
   * })
   * 
  **/
  delete<T extends ThursdayDeleteArgs>(
    args: Subset<T, ThursdayDeleteArgs>
  ): T extends ThursdayDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends ThursdaySelectDeleteArgs ? Promise<ThursdayGetSelectPayload<ExtractThursdaySelectDeleteArgs<T>>>
  : T extends ThursdayIncludeDeleteArgs ? Promise<ThursdayGetIncludePayload<ExtractThursdayIncludeDeleteArgs<T>>> : ThursdayClient<Thursday>
  /**
   * Update one Thursday.
   * @param {ThursdayUpdateArgs} args - Arguments to update one Thursday.
   * @example
   * // Update one Thursday
   * const thursday = await prisma.thursday.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends ThursdayUpdateArgs>(
    args: Subset<T, ThursdayUpdateArgs>
  ): T extends ThursdayUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends ThursdaySelectUpdateArgs ? Promise<ThursdayGetSelectPayload<ExtractThursdaySelectUpdateArgs<T>>>
  : T extends ThursdayIncludeUpdateArgs ? Promise<ThursdayGetIncludePayload<ExtractThursdayIncludeUpdateArgs<T>>> : ThursdayClient<Thursday>
  /**
   * Delete zero or more Thursdays.
   * @param {ThursdayDeleteManyArgs} args - Arguments to filter Thursdays to delete.
   * @example
   * // Delete a few Thursdays
   * const { count } = await prisma.thursday.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends ThursdayDeleteManyArgs>(
    args: Subset<T, ThursdayDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Thursdays.
   * @param {ThursdayUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Thursdays
   * const thursday = await prisma.thursday.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends ThursdayUpdateManyArgs>(
    args: Subset<T, ThursdayUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Thursday.
   * @param {ThursdayUpsertArgs} args - Arguments to update or create a Thursday.
   * @example
   * // Update or create a Thursday
   * const thursday = await prisma.thursday.upsert({
   *   create: {
   *     // ... data to create a Thursday
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Thursday we want to update
   *   }
   * })
  **/
  upsert<T extends ThursdayUpsertArgs>(
    args: Subset<T, ThursdayUpsertArgs>
  ): T extends ThursdayUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends ThursdaySelectUpsertArgs ? Promise<ThursdayGetSelectPayload<ExtractThursdaySelectUpsertArgs<T>>>
  : T extends ThursdayIncludeUpsertArgs ? Promise<ThursdayGetIncludePayload<ExtractThursdayIncludeUpsertArgs<T>>> : ThursdayClient<Thursday>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class ThursdayClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  dayses<T extends FindManyDaysArgs = {}>(args?: Subset<T, FindManyDaysArgs>): T extends FindManyDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyDaysSelectArgs
  ? Promise<Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<T>>>> : T extends FindManyDaysIncludeArgs
  ? Promise<Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<T>>>> : Promise<Array<Days>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Thursday findOne
 */
export type FindOneThursdayArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * Filter, which Thursday to fetch.
  **/
  where: ThursdayWhereUniqueInput
}

export type FindOneThursdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * Filter, which Thursday to fetch.
  **/
  where: ThursdayWhereUniqueInput
}

export type FindOneThursdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Filter, which Thursday to fetch.
  **/
  where: ThursdayWhereUniqueInput
}

export type FindOneThursdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Filter, which Thursday to fetch.
  **/
  where: ThursdayWhereUniqueInput
}

export type FindOneThursdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * Filter, which Thursday to fetch.
  **/
  where: ThursdayWhereUniqueInput
}

export type FindOneThursdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * Filter, which Thursday to fetch.
  **/
  where: ThursdayWhereUniqueInput
}

export type ExtractFindOneThursdaySelectArgs<S extends undefined | boolean | FindOneThursdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneThursdaySelectArgs
  ? S['select']
  : true

export type ExtractFindOneThursdayIncludeArgs<S extends undefined | boolean | FindOneThursdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneThursdayIncludeArgs
  ? S['include']
  : true



/**
 * Thursday findMany
 */
export type FindManyThursdayArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * Filter, which Thursdays to fetch.
  **/
  where?: ThursdayWhereInput | null
  /**
   * Determine the order of the Thursdays to fetch.
  **/
  orderBy?: ThursdayOrderByInput | null
  /**
   * Skip the first `n` Thursdays.
  **/
  skip?: number | null
  /**
   * Get all Thursdays that come after the Thursday you provide with the current order.
  **/
  after?: ThursdayWhereUniqueInput | null
  /**
   * Get all Thursdays that come before the Thursday you provide with the current order.
  **/
  before?: ThursdayWhereUniqueInput | null
  /**
   * Get the first `n` Thursdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Thursdays.
  **/
  last?: number | null
}

export type FindManyThursdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * Filter, which Thursdays to fetch.
  **/
  where?: ThursdayWhereInput | null
  /**
   * Determine the order of the Thursdays to fetch.
  **/
  orderBy?: ThursdayOrderByInput | null
  /**
   * Skip the first `n` Thursdays.
  **/
  skip?: number | null
  /**
   * Get all Thursdays that come after the Thursday you provide with the current order.
  **/
  after?: ThursdayWhereUniqueInput | null
  /**
   * Get all Thursdays that come before the Thursday you provide with the current order.
  **/
  before?: ThursdayWhereUniqueInput | null
  /**
   * Get the first `n` Thursdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Thursdays.
  **/
  last?: number | null
}

export type FindManyThursdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Filter, which Thursdays to fetch.
  **/
  where?: ThursdayWhereInput | null
  /**
   * Determine the order of the Thursdays to fetch.
  **/
  orderBy?: ThursdayOrderByInput | null
  /**
   * Skip the first `n` Thursdays.
  **/
  skip?: number | null
  /**
   * Get all Thursdays that come after the Thursday you provide with the current order.
  **/
  after?: ThursdayWhereUniqueInput | null
  /**
   * Get all Thursdays that come before the Thursday you provide with the current order.
  **/
  before?: ThursdayWhereUniqueInput | null
  /**
   * Get the first `n` Thursdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Thursdays.
  **/
  last?: number | null
}

export type FindManyThursdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Filter, which Thursdays to fetch.
  **/
  where?: ThursdayWhereInput | null
  /**
   * Determine the order of the Thursdays to fetch.
  **/
  orderBy?: ThursdayOrderByInput | null
  /**
   * Skip the first `n` Thursdays.
  **/
  skip?: number | null
  /**
   * Get all Thursdays that come after the Thursday you provide with the current order.
  **/
  after?: ThursdayWhereUniqueInput | null
  /**
   * Get all Thursdays that come before the Thursday you provide with the current order.
  **/
  before?: ThursdayWhereUniqueInput | null
  /**
   * Get the first `n` Thursdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Thursdays.
  **/
  last?: number | null
}

export type FindManyThursdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * Filter, which Thursdays to fetch.
  **/
  where?: ThursdayWhereInput | null
  /**
   * Determine the order of the Thursdays to fetch.
  **/
  orderBy?: ThursdayOrderByInput | null
  /**
   * Skip the first `n` Thursdays.
  **/
  skip?: number | null
  /**
   * Get all Thursdays that come after the Thursday you provide with the current order.
  **/
  after?: ThursdayWhereUniqueInput | null
  /**
   * Get all Thursdays that come before the Thursday you provide with the current order.
  **/
  before?: ThursdayWhereUniqueInput | null
  /**
   * Get the first `n` Thursdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Thursdays.
  **/
  last?: number | null
}

export type FindManyThursdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * Filter, which Thursdays to fetch.
  **/
  where?: ThursdayWhereInput | null
  /**
   * Determine the order of the Thursdays to fetch.
  **/
  orderBy?: ThursdayOrderByInput | null
  /**
   * Skip the first `n` Thursdays.
  **/
  skip?: number | null
  /**
   * Get all Thursdays that come after the Thursday you provide with the current order.
  **/
  after?: ThursdayWhereUniqueInput | null
  /**
   * Get all Thursdays that come before the Thursday you provide with the current order.
  **/
  before?: ThursdayWhereUniqueInput | null
  /**
   * Get the first `n` Thursdays.
  **/
  first?: number | null
  /**
   * Get the last `n` Thursdays.
  **/
  last?: number | null
}

export type ExtractFindManyThursdaySelectArgs<S extends undefined | boolean | FindManyThursdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyThursdaySelectArgs
  ? S['select']
  : true

export type ExtractFindManyThursdayIncludeArgs<S extends undefined | boolean | FindManyThursdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyThursdayIncludeArgs
  ? S['include']
  : true



/**
 * Thursday create
 */
export type ThursdayCreateArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * The data needed to create a Thursday.
  **/
  data: ThursdayCreateInput
}

export type ThursdayCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * The data needed to create a Thursday.
  **/
  data: ThursdayCreateInput
}

export type ThursdaySelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * The data needed to create a Thursday.
  **/
  data: ThursdayCreateInput
}

export type ThursdaySelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * The data needed to create a Thursday.
  **/
  data: ThursdayCreateInput
}

export type ThursdayIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * The data needed to create a Thursday.
  **/
  data: ThursdayCreateInput
}

export type ThursdayIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * The data needed to create a Thursday.
  **/
  data: ThursdayCreateInput
}

export type ExtractThursdaySelectCreateArgs<S extends undefined | boolean | ThursdaySelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdaySelectCreateArgs
  ? S['select']
  : true

export type ExtractThursdayIncludeCreateArgs<S extends undefined | boolean | ThursdayIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdayIncludeCreateArgs
  ? S['include']
  : true



/**
 * Thursday update
 */
export type ThursdayUpdateArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * The data needed to update a Thursday.
  **/
  data: ThursdayUpdateInput
  /**
   * Choose, which Thursday to update.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdayUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * The data needed to update a Thursday.
  **/
  data: ThursdayUpdateInput
  /**
   * Choose, which Thursday to update.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdaySelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * The data needed to update a Thursday.
  **/
  data: ThursdayUpdateInput
  /**
   * Choose, which Thursday to update.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdaySelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * The data needed to update a Thursday.
  **/
  data: ThursdayUpdateInput
  /**
   * Choose, which Thursday to update.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdayIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * The data needed to update a Thursday.
  **/
  data: ThursdayUpdateInput
  /**
   * Choose, which Thursday to update.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdayIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * The data needed to update a Thursday.
  **/
  data: ThursdayUpdateInput
  /**
   * Choose, which Thursday to update.
  **/
  where: ThursdayWhereUniqueInput
}

export type ExtractThursdaySelectUpdateArgs<S extends undefined | boolean | ThursdaySelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdaySelectUpdateArgs
  ? S['select']
  : true

export type ExtractThursdayIncludeUpdateArgs<S extends undefined | boolean | ThursdayIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdayIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Thursday updateMany
 */
export type ThursdayUpdateManyArgs = {
  data: ThursdayUpdateManyMutationInput
  where?: ThursdayWhereInput | null
}


/**
 * Thursday upsert
 */
export type ThursdayUpsertArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * The filter to search for the Thursday to update in case it exists.
  **/
  where: ThursdayWhereUniqueInput
  /**
   * In case the Thursday found by the `where` argument doesn't exist, create a new Thursday with this data.
  **/
  create: ThursdayCreateInput
  /**
   * In case the Thursday was found with the provided `where` argument, update it with this data.
  **/
  update: ThursdayUpdateInput
}

export type ThursdayUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * The filter to search for the Thursday to update in case it exists.
  **/
  where: ThursdayWhereUniqueInput
  /**
   * In case the Thursday found by the `where` argument doesn't exist, create a new Thursday with this data.
  **/
  create: ThursdayCreateInput
  /**
   * In case the Thursday was found with the provided `where` argument, update it with this data.
  **/
  update: ThursdayUpdateInput
}

export type ThursdaySelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * The filter to search for the Thursday to update in case it exists.
  **/
  where: ThursdayWhereUniqueInput
  /**
   * In case the Thursday found by the `where` argument doesn't exist, create a new Thursday with this data.
  **/
  create: ThursdayCreateInput
  /**
   * In case the Thursday was found with the provided `where` argument, update it with this data.
  **/
  update: ThursdayUpdateInput
}

export type ThursdaySelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * The filter to search for the Thursday to update in case it exists.
  **/
  where: ThursdayWhereUniqueInput
  /**
   * In case the Thursday found by the `where` argument doesn't exist, create a new Thursday with this data.
  **/
  create: ThursdayCreateInput
  /**
   * In case the Thursday was found with the provided `where` argument, update it with this data.
  **/
  update: ThursdayUpdateInput
}

export type ThursdayIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * The filter to search for the Thursday to update in case it exists.
  **/
  where: ThursdayWhereUniqueInput
  /**
   * In case the Thursday found by the `where` argument doesn't exist, create a new Thursday with this data.
  **/
  create: ThursdayCreateInput
  /**
   * In case the Thursday was found with the provided `where` argument, update it with this data.
  **/
  update: ThursdayUpdateInput
}

export type ThursdayIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * The filter to search for the Thursday to update in case it exists.
  **/
  where: ThursdayWhereUniqueInput
  /**
   * In case the Thursday found by the `where` argument doesn't exist, create a new Thursday with this data.
  **/
  create: ThursdayCreateInput
  /**
   * In case the Thursday was found with the provided `where` argument, update it with this data.
  **/
  update: ThursdayUpdateInput
}

export type ExtractThursdaySelectUpsertArgs<S extends undefined | boolean | ThursdaySelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdaySelectUpsertArgs
  ? S['select']
  : true

export type ExtractThursdayIncludeUpsertArgs<S extends undefined | boolean | ThursdayIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdayIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Thursday delete
 */
export type ThursdayDeleteArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * Filter which Thursday to delete.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdayDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * Filter which Thursday to delete.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdaySelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Filter which Thursday to delete.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdaySelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Filter which Thursday to delete.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdayIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
  /**
   * Filter which Thursday to delete.
  **/
  where: ThursdayWhereUniqueInput
}

export type ThursdayIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
  /**
   * Filter which Thursday to delete.
  **/
  where: ThursdayWhereUniqueInput
}

export type ExtractThursdaySelectDeleteArgs<S extends undefined | boolean | ThursdaySelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdaySelectDeleteArgs
  ? S['select']
  : true

export type ExtractThursdayIncludeDeleteArgs<S extends undefined | boolean | ThursdayIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdayIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Thursday deleteMany
 */
export type ThursdayDeleteManyArgs = {
  where?: ThursdayWhereInput | null
}


/**
 * Thursday without action
 */
export type ThursdayArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
}

export type ThursdayArgsRequired = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
}

export type ThursdaySelectArgs = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select: ThursdaySelect
}

export type ThursdaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Thursday
  **/
  select?: ThursdaySelect | null
}

export type ThursdayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: ThursdayInclude
}

export type ThursdayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: ThursdayInclude | null
}

export type ExtractThursdaySelectArgs<S extends undefined | boolean | ThursdaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdaySelectArgs
  ? S['select']
  : true

export type ExtractThursdayIncludeArgs<S extends undefined | boolean | ThursdayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends ThursdayIncludeArgs
  ? S['include']
  : true




/**
 * Model Friday
 */

export type Friday = {
  id: number
  eighttoten: boolean
  tentotwelve: boolean
  twelvetotwo: boolean
  twotofour: boolean
  fourtosix: boolean
  createdAt: Date
  updatedAt: Date
}

export type FridayScalars = 'id' | 'eighttoten' | 'tentotwelve' | 'twelvetotwo' | 'twotofour' | 'fourtosix' | 'createdAt' | 'updatedAt'
  

export type FridaySelect = {
  id?: boolean
  eighttoten?: boolean
  tentotwelve?: boolean
  twelvetotwo?: boolean
  twotofour?: boolean
  fourtosix?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  dayses?: boolean | FindManyDaysSelectArgsOptional
}

export type FridayInclude = {
  dayses?: boolean | FindManyDaysIncludeArgsOptional
}

type FridayDefault = {
  id: true
  eighttoten: true
  tentotwelve: true
  twelvetotwo: true
  twotofour: true
  fourtosix: true
  createdAt: true
  updatedAt: true
}


export type FridayGetSelectPayload<S extends boolean | FridaySelect> = S extends true
  ? Friday
  : S extends FridaySelect
  ? {
      [P in CleanupNever<MergeTruthyValues<{}, S>>]: P extends FridayScalars
        ? Friday[P]
        : P extends 'dayses'
        ? Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<S[P]>>>
        : never
    }
   : never

export type FridayGetIncludePayload<S extends boolean | FridayInclude> = S extends true
  ? Friday
  : S extends FridayInclude
  ? {
      [P in CleanupNever<MergeTruthyValues<FridayDefault, S>>]: P extends FridayScalars
        ? Friday[P]
        : P extends 'dayses'
        ? Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<S[P]>>>
        : never
    }
   : never

export interface FridayDelegate {
  /**
   * Find zero or one Friday.
   * @param {FindOneFridayArgs} args - Arguments to find a Friday
   * @example
   * // Get one Friday
   * const friday = await prisma.friday.findOne({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
  **/
  findOne<T extends FindOneFridayArgs>(
    args: Subset<T, FindOneFridayArgs>
  ): T extends FindOneFridayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindOneFridaySelectArgs ? Promise<FridayGetSelectPayload<ExtractFindOneFridaySelectArgs<T>> | null>
  : T extends FindOneFridayIncludeArgs ? Promise<FridayGetIncludePayload<ExtractFindOneFridayIncludeArgs<T>> | null> : FridayClient<Friday | null>
  /**
   * Find zero or more Fridays.
   * @param {FindManyFridayArgs=} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Fridays
   * const fridays = await prisma.friday.findMany()
   * 
   * // Get first 10 Fridays
   * const fridays = await prisma.friday.findMany({ first: 10 })
   * 
   * // Only select the `id`
   * const fridayWithIdOnly = await prisma.friday.findMany({ select: { id: true } })
   * 
  **/
  findMany<T extends FindManyFridayArgs>(
    args?: Subset<T, FindManyFridayArgs>
  ): T extends FindManyFridayArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyFridaySelectArgs
  ? Promise<Array<FridayGetSelectPayload<ExtractFindManyFridaySelectArgs<T>>>> : T extends FindManyFridayIncludeArgs
  ? Promise<Array<FridayGetIncludePayload<ExtractFindManyFridayIncludeArgs<T>>>> : Promise<Array<Friday>>
  /**
   * Create a Friday.
   * @param {FridayCreateArgs} args - Arguments to create a Friday.
   * @example
   * // Create one Friday
   * const user = await prisma.friday.create({
   *   data: {
   *     // ... data to create a Friday
   *   }
   * })
   * 
  **/
  create<T extends FridayCreateArgs>(
    args: Subset<T, FridayCreateArgs>
  ): T extends FridayCreateArgsRequired ? 'Please either choose `select` or `include`' : T extends FridaySelectCreateArgs ? Promise<FridayGetSelectPayload<ExtractFridaySelectCreateArgs<T>>>
  : T extends FridayIncludeCreateArgs ? Promise<FridayGetIncludePayload<ExtractFridayIncludeCreateArgs<T>>> : FridayClient<Friday>
  /**
   * Delete a Friday.
   * @param {FridayDeleteArgs} args - Arguments to delete one Friday.
   * @example
   * // Delete one Friday
   * const user = await prisma.friday.delete({
   *   where: {
   *     // ... filter to delete one Friday
   *   }
   * })
   * 
  **/
  delete<T extends FridayDeleteArgs>(
    args: Subset<T, FridayDeleteArgs>
  ): T extends FridayDeleteArgsRequired ? 'Please either choose `select` or `include`' : T extends FridaySelectDeleteArgs ? Promise<FridayGetSelectPayload<ExtractFridaySelectDeleteArgs<T>>>
  : T extends FridayIncludeDeleteArgs ? Promise<FridayGetIncludePayload<ExtractFridayIncludeDeleteArgs<T>>> : FridayClient<Friday>
  /**
   * Update one Friday.
   * @param {FridayUpdateArgs} args - Arguments to update one Friday.
   * @example
   * // Update one Friday
   * const friday = await prisma.friday.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  update<T extends FridayUpdateArgs>(
    args: Subset<T, FridayUpdateArgs>
  ): T extends FridayUpdateArgsRequired ? 'Please either choose `select` or `include`' : T extends FridaySelectUpdateArgs ? Promise<FridayGetSelectPayload<ExtractFridaySelectUpdateArgs<T>>>
  : T extends FridayIncludeUpdateArgs ? Promise<FridayGetIncludePayload<ExtractFridayIncludeUpdateArgs<T>>> : FridayClient<Friday>
  /**
   * Delete zero or more Fridays.
   * @param {FridayDeleteManyArgs} args - Arguments to filter Fridays to delete.
   * @example
   * // Delete a few Fridays
   * const { count } = await prisma.friday.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
  **/
  deleteMany<T extends FridayDeleteManyArgs>(
    args: Subset<T, FridayDeleteManyArgs>
  ): Promise<BatchPayload>
  /**
   * Update zero or more Fridays.
   * @param {FridayUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Fridays
   * const friday = await prisma.friday.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provider data here
   *   }
   * })
   * 
  **/
  updateMany<T extends FridayUpdateManyArgs>(
    args: Subset<T, FridayUpdateManyArgs>
  ): Promise<BatchPayload>
  /**
   * Create or update one Friday.
   * @param {FridayUpsertArgs} args - Arguments to update or create a Friday.
   * @example
   * // Update or create a Friday
   * const friday = await prisma.friday.upsert({
   *   create: {
   *     // ... data to create a Friday
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Friday we want to update
   *   }
   * })
  **/
  upsert<T extends FridayUpsertArgs>(
    args: Subset<T, FridayUpsertArgs>
  ): T extends FridayUpsertArgsRequired ? 'Please either choose `select` or `include`' : T extends FridaySelectUpsertArgs ? Promise<FridayGetSelectPayload<ExtractFridaySelectUpsertArgs<T>>>
  : T extends FridayIncludeUpsertArgs ? Promise<FridayGetIncludePayload<ExtractFridayIncludeUpsertArgs<T>>> : FridayClient<Friday>
  /**
   * 
   */
  count(): Promise<number>
}

export declare class FridayClient<T> implements Promise<T> {
  private readonly _dmmf;
  private readonly _fetcher;
  private readonly _queryType;
  private readonly _rootField;
  private readonly _clientMethod;
  private readonly _args;
  private readonly _dataPath;
  private readonly _errorFormat;
  private readonly _measurePerformance?;
  private _isList;
  private _callsite;
  private _requestPromise?;
  private _collectTimestamps?;
  constructor(_dmmf: DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
  readonly [Symbol.toStringTag]: 'PrismaClientPromise';

  dayses<T extends FindManyDaysArgs = {}>(args?: Subset<T, FindManyDaysArgs>): T extends FindManyDaysArgsRequired ? 'Please either choose `select` or `include`' : T extends FindManyDaysSelectArgs
  ? Promise<Array<DaysGetSelectPayload<ExtractFindManyDaysSelectArgs<T>>>> : T extends FindManyDaysIncludeArgs
  ? Promise<Array<DaysGetIncludePayload<ExtractFindManyDaysIncludeArgs<T>>>> : Promise<Array<Days>>;

  private get _document();
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult>;
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

// Custom InputTypes

/**
 * Friday findOne
 */
export type FindOneFridayArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * Filter, which Friday to fetch.
  **/
  where: FridayWhereUniqueInput
}

export type FindOneFridayArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * Filter, which Friday to fetch.
  **/
  where: FridayWhereUniqueInput
}

export type FindOneFridaySelectArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Filter, which Friday to fetch.
  **/
  where: FridayWhereUniqueInput
}

export type FindOneFridaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Filter, which Friday to fetch.
  **/
  where: FridayWhereUniqueInput
}

export type FindOneFridayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * Filter, which Friday to fetch.
  **/
  where: FridayWhereUniqueInput
}

export type FindOneFridayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * Filter, which Friday to fetch.
  **/
  where: FridayWhereUniqueInput
}

export type ExtractFindOneFridaySelectArgs<S extends undefined | boolean | FindOneFridaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneFridaySelectArgs
  ? S['select']
  : true

export type ExtractFindOneFridayIncludeArgs<S extends undefined | boolean | FindOneFridayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindOneFridayIncludeArgs
  ? S['include']
  : true



/**
 * Friday findMany
 */
export type FindManyFridayArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * Filter, which Fridays to fetch.
  **/
  where?: FridayWhereInput | null
  /**
   * Determine the order of the Fridays to fetch.
  **/
  orderBy?: FridayOrderByInput | null
  /**
   * Skip the first `n` Fridays.
  **/
  skip?: number | null
  /**
   * Get all Fridays that come after the Friday you provide with the current order.
  **/
  after?: FridayWhereUniqueInput | null
  /**
   * Get all Fridays that come before the Friday you provide with the current order.
  **/
  before?: FridayWhereUniqueInput | null
  /**
   * Get the first `n` Fridays.
  **/
  first?: number | null
  /**
   * Get the last `n` Fridays.
  **/
  last?: number | null
}

export type FindManyFridayArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * Filter, which Fridays to fetch.
  **/
  where?: FridayWhereInput | null
  /**
   * Determine the order of the Fridays to fetch.
  **/
  orderBy?: FridayOrderByInput | null
  /**
   * Skip the first `n` Fridays.
  **/
  skip?: number | null
  /**
   * Get all Fridays that come after the Friday you provide with the current order.
  **/
  after?: FridayWhereUniqueInput | null
  /**
   * Get all Fridays that come before the Friday you provide with the current order.
  **/
  before?: FridayWhereUniqueInput | null
  /**
   * Get the first `n` Fridays.
  **/
  first?: number | null
  /**
   * Get the last `n` Fridays.
  **/
  last?: number | null
}

export type FindManyFridaySelectArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Filter, which Fridays to fetch.
  **/
  where?: FridayWhereInput | null
  /**
   * Determine the order of the Fridays to fetch.
  **/
  orderBy?: FridayOrderByInput | null
  /**
   * Skip the first `n` Fridays.
  **/
  skip?: number | null
  /**
   * Get all Fridays that come after the Friday you provide with the current order.
  **/
  after?: FridayWhereUniqueInput | null
  /**
   * Get all Fridays that come before the Friday you provide with the current order.
  **/
  before?: FridayWhereUniqueInput | null
  /**
   * Get the first `n` Fridays.
  **/
  first?: number | null
  /**
   * Get the last `n` Fridays.
  **/
  last?: number | null
}

export type FindManyFridaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Filter, which Fridays to fetch.
  **/
  where?: FridayWhereInput | null
  /**
   * Determine the order of the Fridays to fetch.
  **/
  orderBy?: FridayOrderByInput | null
  /**
   * Skip the first `n` Fridays.
  **/
  skip?: number | null
  /**
   * Get all Fridays that come after the Friday you provide with the current order.
  **/
  after?: FridayWhereUniqueInput | null
  /**
   * Get all Fridays that come before the Friday you provide with the current order.
  **/
  before?: FridayWhereUniqueInput | null
  /**
   * Get the first `n` Fridays.
  **/
  first?: number | null
  /**
   * Get the last `n` Fridays.
  **/
  last?: number | null
}

export type FindManyFridayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * Filter, which Fridays to fetch.
  **/
  where?: FridayWhereInput | null
  /**
   * Determine the order of the Fridays to fetch.
  **/
  orderBy?: FridayOrderByInput | null
  /**
   * Skip the first `n` Fridays.
  **/
  skip?: number | null
  /**
   * Get all Fridays that come after the Friday you provide with the current order.
  **/
  after?: FridayWhereUniqueInput | null
  /**
   * Get all Fridays that come before the Friday you provide with the current order.
  **/
  before?: FridayWhereUniqueInput | null
  /**
   * Get the first `n` Fridays.
  **/
  first?: number | null
  /**
   * Get the last `n` Fridays.
  **/
  last?: number | null
}

export type FindManyFridayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * Filter, which Fridays to fetch.
  **/
  where?: FridayWhereInput | null
  /**
   * Determine the order of the Fridays to fetch.
  **/
  orderBy?: FridayOrderByInput | null
  /**
   * Skip the first `n` Fridays.
  **/
  skip?: number | null
  /**
   * Get all Fridays that come after the Friday you provide with the current order.
  **/
  after?: FridayWhereUniqueInput | null
  /**
   * Get all Fridays that come before the Friday you provide with the current order.
  **/
  before?: FridayWhereUniqueInput | null
  /**
   * Get the first `n` Fridays.
  **/
  first?: number | null
  /**
   * Get the last `n` Fridays.
  **/
  last?: number | null
}

export type ExtractFindManyFridaySelectArgs<S extends undefined | boolean | FindManyFridaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyFridaySelectArgs
  ? S['select']
  : true

export type ExtractFindManyFridayIncludeArgs<S extends undefined | boolean | FindManyFridayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FindManyFridayIncludeArgs
  ? S['include']
  : true



/**
 * Friday create
 */
export type FridayCreateArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * The data needed to create a Friday.
  **/
  data: FridayCreateInput
}

export type FridayCreateArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * The data needed to create a Friday.
  **/
  data: FridayCreateInput
}

export type FridaySelectCreateArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * The data needed to create a Friday.
  **/
  data: FridayCreateInput
}

export type FridaySelectCreateArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * The data needed to create a Friday.
  **/
  data: FridayCreateInput
}

export type FridayIncludeCreateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * The data needed to create a Friday.
  **/
  data: FridayCreateInput
}

export type FridayIncludeCreateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * The data needed to create a Friday.
  **/
  data: FridayCreateInput
}

export type ExtractFridaySelectCreateArgs<S extends undefined | boolean | FridaySelectCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridaySelectCreateArgs
  ? S['select']
  : true

export type ExtractFridayIncludeCreateArgs<S extends undefined | boolean | FridayIncludeCreateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridayIncludeCreateArgs
  ? S['include']
  : true



/**
 * Friday update
 */
export type FridayUpdateArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * The data needed to update a Friday.
  **/
  data: FridayUpdateInput
  /**
   * Choose, which Friday to update.
  **/
  where: FridayWhereUniqueInput
}

export type FridayUpdateArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * The data needed to update a Friday.
  **/
  data: FridayUpdateInput
  /**
   * Choose, which Friday to update.
  **/
  where: FridayWhereUniqueInput
}

export type FridaySelectUpdateArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * The data needed to update a Friday.
  **/
  data: FridayUpdateInput
  /**
   * Choose, which Friday to update.
  **/
  where: FridayWhereUniqueInput
}

export type FridaySelectUpdateArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * The data needed to update a Friday.
  **/
  data: FridayUpdateInput
  /**
   * Choose, which Friday to update.
  **/
  where: FridayWhereUniqueInput
}

export type FridayIncludeUpdateArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * The data needed to update a Friday.
  **/
  data: FridayUpdateInput
  /**
   * Choose, which Friday to update.
  **/
  where: FridayWhereUniqueInput
}

export type FridayIncludeUpdateArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * The data needed to update a Friday.
  **/
  data: FridayUpdateInput
  /**
   * Choose, which Friday to update.
  **/
  where: FridayWhereUniqueInput
}

export type ExtractFridaySelectUpdateArgs<S extends undefined | boolean | FridaySelectUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridaySelectUpdateArgs
  ? S['select']
  : true

export type ExtractFridayIncludeUpdateArgs<S extends undefined | boolean | FridayIncludeUpdateArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridayIncludeUpdateArgs
  ? S['include']
  : true



/**
 * Friday updateMany
 */
export type FridayUpdateManyArgs = {
  data: FridayUpdateManyMutationInput
  where?: FridayWhereInput | null
}


/**
 * Friday upsert
 */
export type FridayUpsertArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * The filter to search for the Friday to update in case it exists.
  **/
  where: FridayWhereUniqueInput
  /**
   * In case the Friday found by the `where` argument doesn't exist, create a new Friday with this data.
  **/
  create: FridayCreateInput
  /**
   * In case the Friday was found with the provided `where` argument, update it with this data.
  **/
  update: FridayUpdateInput
}

export type FridayUpsertArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * The filter to search for the Friday to update in case it exists.
  **/
  where: FridayWhereUniqueInput
  /**
   * In case the Friday found by the `where` argument doesn't exist, create a new Friday with this data.
  **/
  create: FridayCreateInput
  /**
   * In case the Friday was found with the provided `where` argument, update it with this data.
  **/
  update: FridayUpdateInput
}

export type FridaySelectUpsertArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * The filter to search for the Friday to update in case it exists.
  **/
  where: FridayWhereUniqueInput
  /**
   * In case the Friday found by the `where` argument doesn't exist, create a new Friday with this data.
  **/
  create: FridayCreateInput
  /**
   * In case the Friday was found with the provided `where` argument, update it with this data.
  **/
  update: FridayUpdateInput
}

export type FridaySelectUpsertArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * The filter to search for the Friday to update in case it exists.
  **/
  where: FridayWhereUniqueInput
  /**
   * In case the Friday found by the `where` argument doesn't exist, create a new Friday with this data.
  **/
  create: FridayCreateInput
  /**
   * In case the Friday was found with the provided `where` argument, update it with this data.
  **/
  update: FridayUpdateInput
}

export type FridayIncludeUpsertArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * The filter to search for the Friday to update in case it exists.
  **/
  where: FridayWhereUniqueInput
  /**
   * In case the Friday found by the `where` argument doesn't exist, create a new Friday with this data.
  **/
  create: FridayCreateInput
  /**
   * In case the Friday was found with the provided `where` argument, update it with this data.
  **/
  update: FridayUpdateInput
}

export type FridayIncludeUpsertArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * The filter to search for the Friday to update in case it exists.
  **/
  where: FridayWhereUniqueInput
  /**
   * In case the Friday found by the `where` argument doesn't exist, create a new Friday with this data.
  **/
  create: FridayCreateInput
  /**
   * In case the Friday was found with the provided `where` argument, update it with this data.
  **/
  update: FridayUpdateInput
}

export type ExtractFridaySelectUpsertArgs<S extends undefined | boolean | FridaySelectUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridaySelectUpsertArgs
  ? S['select']
  : true

export type ExtractFridayIncludeUpsertArgs<S extends undefined | boolean | FridayIncludeUpsertArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridayIncludeUpsertArgs
  ? S['include']
  : true



/**
 * Friday delete
 */
export type FridayDeleteArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * Filter which Friday to delete.
  **/
  where: FridayWhereUniqueInput
}

export type FridayDeleteArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * Filter which Friday to delete.
  **/
  where: FridayWhereUniqueInput
}

export type FridaySelectDeleteArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Filter which Friday to delete.
  **/
  where: FridayWhereUniqueInput
}

export type FridaySelectDeleteArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Filter which Friday to delete.
  **/
  where: FridayWhereUniqueInput
}

export type FridayIncludeDeleteArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
  /**
   * Filter which Friday to delete.
  **/
  where: FridayWhereUniqueInput
}

export type FridayIncludeDeleteArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
  /**
   * Filter which Friday to delete.
  **/
  where: FridayWhereUniqueInput
}

export type ExtractFridaySelectDeleteArgs<S extends undefined | boolean | FridaySelectDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridaySelectDeleteArgs
  ? S['select']
  : true

export type ExtractFridayIncludeDeleteArgs<S extends undefined | boolean | FridayIncludeDeleteArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridayIncludeDeleteArgs
  ? S['include']
  : true



/**
 * Friday deleteMany
 */
export type FridayDeleteManyArgs = {
  where?: FridayWhereInput | null
}


/**
 * Friday without action
 */
export type FridayArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
}

export type FridayArgsRequired = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
}

export type FridaySelectArgs = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select: FridaySelect
}

export type FridaySelectArgsOptional = {
  /**
   * Select specific fields to fetch from the Friday
  **/
  select?: FridaySelect | null
}

export type FridayIncludeArgs = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include: FridayInclude
}

export type FridayIncludeArgsOptional = {
  /**
   * Choose, which related nodes to fetch as well.
  **/
  include?: FridayInclude | null
}

export type ExtractFridaySelectArgs<S extends undefined | boolean | FridaySelectArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridaySelectArgs
  ? S['select']
  : true

export type ExtractFridayIncludeArgs<S extends undefined | boolean | FridayIncludeArgsOptional> = S extends undefined
  ? false
  : S extends boolean
  ? S
  : S extends FridayIncludeArgs
  ? S['include']
  : true




/**
 * Deep Input Types
 */


export type MondayWhereInput = {
  id?: number | IntFilter | null
  eighttoten?: boolean | BooleanFilter | null
  tentotwelve?: boolean | BooleanFilter | null
  twelvetotwo?: boolean | BooleanFilter | null
  twotofour?: boolean | BooleanFilter | null
  fourtosix?: boolean | BooleanFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  dayses?: DaysFilter | null
  AND?: Enumerable<MondayWhereInput> | null
  OR?: Enumerable<MondayWhereInput> | null
  NOT?: Enumerable<MondayWhereInput> | null
}

export type TuesdayWhereInput = {
  id?: number | IntFilter | null
  eighttoten?: boolean | BooleanFilter | null
  tentotwelve?: boolean | BooleanFilter | null
  twelvetotwo?: boolean | BooleanFilter | null
  twotofour?: boolean | BooleanFilter | null
  fourtosix?: boolean | BooleanFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  dayses?: DaysFilter | null
  AND?: Enumerable<TuesdayWhereInput> | null
  OR?: Enumerable<TuesdayWhereInput> | null
  NOT?: Enumerable<TuesdayWhereInput> | null
}

export type WednesdayWhereInput = {
  id?: number | IntFilter | null
  eighttoten?: boolean | BooleanFilter | null
  tentotwelve?: boolean | BooleanFilter | null
  twelvetotwo?: boolean | BooleanFilter | null
  twotofour?: boolean | BooleanFilter | null
  fourtosix?: boolean | BooleanFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  dayses?: DaysFilter | null
  AND?: Enumerable<WednesdayWhereInput> | null
  OR?: Enumerable<WednesdayWhereInput> | null
  NOT?: Enumerable<WednesdayWhereInput> | null
}

export type ThursdayWhereInput = {
  id?: number | IntFilter | null
  eighttoten?: boolean | BooleanFilter | null
  tentotwelve?: boolean | BooleanFilter | null
  twelvetotwo?: boolean | BooleanFilter | null
  twotofour?: boolean | BooleanFilter | null
  fourtosix?: boolean | BooleanFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  dayses?: DaysFilter | null
  AND?: Enumerable<ThursdayWhereInput> | null
  OR?: Enumerable<ThursdayWhereInput> | null
  NOT?: Enumerable<ThursdayWhereInput> | null
}

export type FridayWhereInput = {
  id?: number | IntFilter | null
  eighttoten?: boolean | BooleanFilter | null
  tentotwelve?: boolean | BooleanFilter | null
  twelvetotwo?: boolean | BooleanFilter | null
  twotofour?: boolean | BooleanFilter | null
  fourtosix?: boolean | BooleanFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  dayses?: DaysFilter | null
  AND?: Enumerable<FridayWhereInput> | null
  OR?: Enumerable<FridayWhereInput> | null
  NOT?: Enumerable<FridayWhereInput> | null
}

export type DaysWhereInput = {
  id?: number | IntFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  weeks?: WeekFilter | null
  AND?: Enumerable<DaysWhereInput> | null
  OR?: Enumerable<DaysWhereInput> | null
  NOT?: Enumerable<DaysWhereInput> | null
  monday?: MondayWhereInput | null
  tuesday?: TuesdayWhereInput | null
  wednesday?: WednesdayWhereInput | null
  thursday?: ThursdayWhereInput | null
  friday?: FridayWhereInput | null
}

export type WeekWhereInput = {
  id?: number | IntFilter | null
  anchor?: string | StringFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  AND?: Enumerable<WeekWhereInput> | null
  OR?: Enumerable<WeekWhereInput> | null
  NOT?: Enumerable<WeekWhereInput> | null
  days?: DaysWhereInput | null
  bookings?: BookingsWhereInput | null
}

export type BookingsWhereInput = {
  id?: number | IntFilter | null
  weeks?: WeekFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  AND?: Enumerable<BookingsWhereInput> | null
  OR?: Enumerable<BookingsWhereInput> | null
  NOT?: Enumerable<BookingsWhereInput> | null
}

export type IdCompoundUniqueInput = {
  id: number
}

export type BookingsWhereUniqueInput = {
  id?: number | null
}

export type WeekWhereUniqueInput = {
  id?: number | null
}

export type DaysWhereUniqueInput = {
  id?: number | null
}

export type MondayWhereUniqueInput = {
  id?: number | null
}

export type TuesdayWhereUniqueInput = {
  id?: number | null
}

export type WednesdayWhereUniqueInput = {
  id?: number | null
}

export type ThursdayWhereUniqueInput = {
  id?: number | null
}

export type FridayWhereUniqueInput = {
  id?: number | null
}

export type MondayCreateWithoutDaysesInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type MondayCreateOneWithoutDaysesInput = {
  create?: MondayCreateWithoutDaysesInput | null
  connect?: MondayWhereUniqueInput | null
}

export type TuesdayCreateWithoutDaysesInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type TuesdayCreateOneWithoutDaysesInput = {
  create?: TuesdayCreateWithoutDaysesInput | null
  connect?: TuesdayWhereUniqueInput | null
}

export type WednesdayCreateWithoutDaysesInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type WednesdayCreateOneWithoutDaysesInput = {
  create?: WednesdayCreateWithoutDaysesInput | null
  connect?: WednesdayWhereUniqueInput | null
}

export type ThursdayCreateWithoutDaysesInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type ThursdayCreateOneWithoutDaysesInput = {
  create?: ThursdayCreateWithoutDaysesInput | null
  connect?: ThursdayWhereUniqueInput | null
}

export type FridayCreateWithoutDaysesInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type FridayCreateOneWithoutDaysesInput = {
  create?: FridayCreateWithoutDaysesInput | null
  connect?: FridayWhereUniqueInput | null
}

export type DaysCreateWithoutWeeksInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday: MondayCreateOneWithoutDaysesInput
  tuesday: TuesdayCreateOneWithoutDaysesInput
  wednesday: WednesdayCreateOneWithoutDaysesInput
  thursday: ThursdayCreateOneWithoutDaysesInput
  friday: FridayCreateOneWithoutDaysesInput
}

export type DaysCreateOneWithoutWeeksInput = {
  create?: DaysCreateWithoutWeeksInput | null
  connect?: DaysWhereUniqueInput | null
}

export type WeekCreateWithoutBookingsInput = {
  anchor: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  days: DaysCreateOneWithoutWeeksInput
}

export type WeekCreateManyWithoutBookingsInput = {
  create?: Enumerable<WeekCreateWithoutBookingsInput> | null
  connect?: Enumerable<WeekWhereUniqueInput> | null
}

export type BookingsCreateInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  weeks?: WeekCreateManyWithoutBookingsInput | null
}

export type MondayUpdateWithoutDaysesDataInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type MondayUpsertWithoutDaysesInput = {
  update: MondayUpdateWithoutDaysesDataInput
  create: MondayCreateWithoutDaysesInput
}

export type MondayUpdateOneRequiredWithoutDaysesInput = {
  create?: MondayCreateWithoutDaysesInput | null
  connect?: MondayWhereUniqueInput | null
  update?: MondayUpdateWithoutDaysesDataInput | null
  upsert?: MondayUpsertWithoutDaysesInput | null
}

export type TuesdayUpdateWithoutDaysesDataInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type TuesdayUpsertWithoutDaysesInput = {
  update: TuesdayUpdateWithoutDaysesDataInput
  create: TuesdayCreateWithoutDaysesInput
}

export type TuesdayUpdateOneRequiredWithoutDaysesInput = {
  create?: TuesdayCreateWithoutDaysesInput | null
  connect?: TuesdayWhereUniqueInput | null
  update?: TuesdayUpdateWithoutDaysesDataInput | null
  upsert?: TuesdayUpsertWithoutDaysesInput | null
}

export type WednesdayUpdateWithoutDaysesDataInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type WednesdayUpsertWithoutDaysesInput = {
  update: WednesdayUpdateWithoutDaysesDataInput
  create: WednesdayCreateWithoutDaysesInput
}

export type WednesdayUpdateOneRequiredWithoutDaysesInput = {
  create?: WednesdayCreateWithoutDaysesInput | null
  connect?: WednesdayWhereUniqueInput | null
  update?: WednesdayUpdateWithoutDaysesDataInput | null
  upsert?: WednesdayUpsertWithoutDaysesInput | null
}

export type ThursdayUpdateWithoutDaysesDataInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type ThursdayUpsertWithoutDaysesInput = {
  update: ThursdayUpdateWithoutDaysesDataInput
  create: ThursdayCreateWithoutDaysesInput
}

export type ThursdayUpdateOneRequiredWithoutDaysesInput = {
  create?: ThursdayCreateWithoutDaysesInput | null
  connect?: ThursdayWhereUniqueInput | null
  update?: ThursdayUpdateWithoutDaysesDataInput | null
  upsert?: ThursdayUpsertWithoutDaysesInput | null
}

export type FridayUpdateWithoutDaysesDataInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type FridayUpsertWithoutDaysesInput = {
  update: FridayUpdateWithoutDaysesDataInput
  create: FridayCreateWithoutDaysesInput
}

export type FridayUpdateOneRequiredWithoutDaysesInput = {
  create?: FridayCreateWithoutDaysesInput | null
  connect?: FridayWhereUniqueInput | null
  update?: FridayUpdateWithoutDaysesDataInput | null
  upsert?: FridayUpsertWithoutDaysesInput | null
}

export type DaysUpdateWithoutWeeksDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday?: MondayUpdateOneRequiredWithoutDaysesInput | null
  tuesday?: TuesdayUpdateOneRequiredWithoutDaysesInput | null
  wednesday?: WednesdayUpdateOneRequiredWithoutDaysesInput | null
  thursday?: ThursdayUpdateOneRequiredWithoutDaysesInput | null
  friday?: FridayUpdateOneRequiredWithoutDaysesInput | null
}

export type DaysUpsertWithoutWeeksInput = {
  update: DaysUpdateWithoutWeeksDataInput
  create: DaysCreateWithoutWeeksInput
}

export type DaysUpdateOneRequiredWithoutWeeksInput = {
  create?: DaysCreateWithoutWeeksInput | null
  connect?: DaysWhereUniqueInput | null
  update?: DaysUpdateWithoutWeeksDataInput | null
  upsert?: DaysUpsertWithoutWeeksInput | null
}

export type WeekUpdateWithoutBookingsDataInput = {
  id?: number | null
  anchor?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  days?: DaysUpdateOneRequiredWithoutWeeksInput | null
}

export type WeekUpdateWithWhereUniqueWithoutBookingsInput = {
  where: WeekWhereUniqueInput
  data: WeekUpdateWithoutBookingsDataInput
}

export type WeekScalarWhereInput = {
  id?: number | IntFilter | null
  anchor?: string | StringFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  AND?: Enumerable<WeekScalarWhereInput> | null
  OR?: Enumerable<WeekScalarWhereInput> | null
  NOT?: Enumerable<WeekScalarWhereInput> | null
}

export type WeekUpdateManyDataInput = {
  id?: number | null
  anchor?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type WeekUpdateManyWithWhereNestedInput = {
  where: WeekScalarWhereInput
  data: WeekUpdateManyDataInput
}

export type WeekUpsertWithWhereUniqueWithoutBookingsInput = {
  where: WeekWhereUniqueInput
  update: WeekUpdateWithoutBookingsDataInput
  create: WeekCreateWithoutBookingsInput
}

export type WeekUpdateManyWithoutBookingsInput = {
  create?: Enumerable<WeekCreateWithoutBookingsInput> | null
  connect?: Enumerable<WeekWhereUniqueInput> | null
  set?: Enumerable<WeekWhereUniqueInput> | null
  disconnect?: Enumerable<WeekWhereUniqueInput> | null
  delete?: Enumerable<WeekWhereUniqueInput> | null
  update?: Enumerable<WeekUpdateWithWhereUniqueWithoutBookingsInput> | null
  updateMany?: Enumerable<WeekUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<WeekScalarWhereInput> | null
  upsert?: Enumerable<WeekUpsertWithWhereUniqueWithoutBookingsInput> | null
}

export type BookingsUpdateInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  weeks?: WeekUpdateManyWithoutBookingsInput | null
}

export type BookingsUpdateManyMutationInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type BookingsCreateWithoutWeeksInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type BookingsCreateOneWithoutWeeksInput = {
  create?: BookingsCreateWithoutWeeksInput | null
  connect?: BookingsWhereUniqueInput | null
}

export type WeekCreateInput = {
  anchor: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  days: DaysCreateOneWithoutWeeksInput
  bookings?: BookingsCreateOneWithoutWeeksInput | null
}

export type BookingsUpdateWithoutWeeksDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type BookingsUpsertWithoutWeeksInput = {
  update: BookingsUpdateWithoutWeeksDataInput
  create: BookingsCreateWithoutWeeksInput
}

export type BookingsUpdateOneWithoutWeeksInput = {
  create?: BookingsCreateWithoutWeeksInput | null
  connect?: BookingsWhereUniqueInput | null
  disconnect?: boolean | null
  delete?: boolean | null
  update?: BookingsUpdateWithoutWeeksDataInput | null
  upsert?: BookingsUpsertWithoutWeeksInput | null
}

export type WeekUpdateInput = {
  id?: number | null
  anchor?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  days?: DaysUpdateOneRequiredWithoutWeeksInput | null
  bookings?: BookingsUpdateOneWithoutWeeksInput | null
}

export type WeekUpdateManyMutationInput = {
  id?: number | null
  anchor?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type WeekCreateWithoutDaysInput = {
  anchor: string
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  bookings?: BookingsCreateOneWithoutWeeksInput | null
}

export type WeekCreateManyWithoutDaysInput = {
  create?: Enumerable<WeekCreateWithoutDaysInput> | null
  connect?: Enumerable<WeekWhereUniqueInput> | null
}

export type DaysCreateInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday: MondayCreateOneWithoutDaysesInput
  tuesday: TuesdayCreateOneWithoutDaysesInput
  wednesday: WednesdayCreateOneWithoutDaysesInput
  thursday: ThursdayCreateOneWithoutDaysesInput
  friday: FridayCreateOneWithoutDaysesInput
  weeks?: WeekCreateManyWithoutDaysInput | null
}

export type WeekUpdateWithoutDaysDataInput = {
  id?: number | null
  anchor?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  bookings?: BookingsUpdateOneWithoutWeeksInput | null
}

export type WeekUpdateWithWhereUniqueWithoutDaysInput = {
  where: WeekWhereUniqueInput
  data: WeekUpdateWithoutDaysDataInput
}

export type WeekUpsertWithWhereUniqueWithoutDaysInput = {
  where: WeekWhereUniqueInput
  update: WeekUpdateWithoutDaysDataInput
  create: WeekCreateWithoutDaysInput
}

export type WeekUpdateManyWithoutDaysInput = {
  create?: Enumerable<WeekCreateWithoutDaysInput> | null
  connect?: Enumerable<WeekWhereUniqueInput> | null
  set?: Enumerable<WeekWhereUniqueInput> | null
  disconnect?: Enumerable<WeekWhereUniqueInput> | null
  delete?: Enumerable<WeekWhereUniqueInput> | null
  update?: Enumerable<WeekUpdateWithWhereUniqueWithoutDaysInput> | null
  updateMany?: Enumerable<WeekUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<WeekScalarWhereInput> | null
  upsert?: Enumerable<WeekUpsertWithWhereUniqueWithoutDaysInput> | null
}

export type DaysUpdateInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday?: MondayUpdateOneRequiredWithoutDaysesInput | null
  tuesday?: TuesdayUpdateOneRequiredWithoutDaysesInput | null
  wednesday?: WednesdayUpdateOneRequiredWithoutDaysesInput | null
  thursday?: ThursdayUpdateOneRequiredWithoutDaysesInput | null
  friday?: FridayUpdateOneRequiredWithoutDaysesInput | null
  weeks?: WeekUpdateManyWithoutDaysInput | null
}

export type DaysUpdateManyMutationInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type DaysCreateWithoutMondayInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  tuesday: TuesdayCreateOneWithoutDaysesInput
  wednesday: WednesdayCreateOneWithoutDaysesInput
  thursday: ThursdayCreateOneWithoutDaysesInput
  friday: FridayCreateOneWithoutDaysesInput
  weeks?: WeekCreateManyWithoutDaysInput | null
}

export type DaysCreateManyWithoutMondayInput = {
  create?: Enumerable<DaysCreateWithoutMondayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
}

export type MondayCreateInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysCreateManyWithoutMondayInput | null
}

export type DaysUpdateWithoutMondayDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  tuesday?: TuesdayUpdateOneRequiredWithoutDaysesInput | null
  wednesday?: WednesdayUpdateOneRequiredWithoutDaysesInput | null
  thursday?: ThursdayUpdateOneRequiredWithoutDaysesInput | null
  friday?: FridayUpdateOneRequiredWithoutDaysesInput | null
  weeks?: WeekUpdateManyWithoutDaysInput | null
}

export type DaysUpdateWithWhereUniqueWithoutMondayInput = {
  where: DaysWhereUniqueInput
  data: DaysUpdateWithoutMondayDataInput
}

export type DaysScalarWhereInput = {
  id?: number | IntFilter | null
  createdAt?: Date | string | DateTimeFilter | null
  updatedAt?: Date | string | DateTimeFilter | null
  weeks?: WeekFilter | null
  AND?: Enumerable<DaysScalarWhereInput> | null
  OR?: Enumerable<DaysScalarWhereInput> | null
  NOT?: Enumerable<DaysScalarWhereInput> | null
}

export type DaysUpdateManyDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type DaysUpdateManyWithWhereNestedInput = {
  where: DaysScalarWhereInput
  data: DaysUpdateManyDataInput
}

export type DaysUpsertWithWhereUniqueWithoutMondayInput = {
  where: DaysWhereUniqueInput
  update: DaysUpdateWithoutMondayDataInput
  create: DaysCreateWithoutMondayInput
}

export type DaysUpdateManyWithoutMondayInput = {
  create?: Enumerable<DaysCreateWithoutMondayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
  set?: Enumerable<DaysWhereUniqueInput> | null
  disconnect?: Enumerable<DaysWhereUniqueInput> | null
  delete?: Enumerable<DaysWhereUniqueInput> | null
  update?: Enumerable<DaysUpdateWithWhereUniqueWithoutMondayInput> | null
  updateMany?: Enumerable<DaysUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<DaysScalarWhereInput> | null
  upsert?: Enumerable<DaysUpsertWithWhereUniqueWithoutMondayInput> | null
}

export type MondayUpdateInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysUpdateManyWithoutMondayInput | null
}

export type MondayUpdateManyMutationInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type DaysCreateWithoutTuesdayInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday: MondayCreateOneWithoutDaysesInput
  wednesday: WednesdayCreateOneWithoutDaysesInput
  thursday: ThursdayCreateOneWithoutDaysesInput
  friday: FridayCreateOneWithoutDaysesInput
  weeks?: WeekCreateManyWithoutDaysInput | null
}

export type DaysCreateManyWithoutTuesdayInput = {
  create?: Enumerable<DaysCreateWithoutTuesdayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
}

export type TuesdayCreateInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysCreateManyWithoutTuesdayInput | null
}

export type DaysUpdateWithoutTuesdayDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday?: MondayUpdateOneRequiredWithoutDaysesInput | null
  wednesday?: WednesdayUpdateOneRequiredWithoutDaysesInput | null
  thursday?: ThursdayUpdateOneRequiredWithoutDaysesInput | null
  friday?: FridayUpdateOneRequiredWithoutDaysesInput | null
  weeks?: WeekUpdateManyWithoutDaysInput | null
}

export type DaysUpdateWithWhereUniqueWithoutTuesdayInput = {
  where: DaysWhereUniqueInput
  data: DaysUpdateWithoutTuesdayDataInput
}

export type DaysUpsertWithWhereUniqueWithoutTuesdayInput = {
  where: DaysWhereUniqueInput
  update: DaysUpdateWithoutTuesdayDataInput
  create: DaysCreateWithoutTuesdayInput
}

export type DaysUpdateManyWithoutTuesdayInput = {
  create?: Enumerable<DaysCreateWithoutTuesdayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
  set?: Enumerable<DaysWhereUniqueInput> | null
  disconnect?: Enumerable<DaysWhereUniqueInput> | null
  delete?: Enumerable<DaysWhereUniqueInput> | null
  update?: Enumerable<DaysUpdateWithWhereUniqueWithoutTuesdayInput> | null
  updateMany?: Enumerable<DaysUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<DaysScalarWhereInput> | null
  upsert?: Enumerable<DaysUpsertWithWhereUniqueWithoutTuesdayInput> | null
}

export type TuesdayUpdateInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysUpdateManyWithoutTuesdayInput | null
}

export type TuesdayUpdateManyMutationInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type DaysCreateWithoutWednesdayInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday: MondayCreateOneWithoutDaysesInput
  tuesday: TuesdayCreateOneWithoutDaysesInput
  thursday: ThursdayCreateOneWithoutDaysesInput
  friday: FridayCreateOneWithoutDaysesInput
  weeks?: WeekCreateManyWithoutDaysInput | null
}

export type DaysCreateManyWithoutWednesdayInput = {
  create?: Enumerable<DaysCreateWithoutWednesdayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
}

export type WednesdayCreateInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysCreateManyWithoutWednesdayInput | null
}

export type DaysUpdateWithoutWednesdayDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday?: MondayUpdateOneRequiredWithoutDaysesInput | null
  tuesday?: TuesdayUpdateOneRequiredWithoutDaysesInput | null
  thursday?: ThursdayUpdateOneRequiredWithoutDaysesInput | null
  friday?: FridayUpdateOneRequiredWithoutDaysesInput | null
  weeks?: WeekUpdateManyWithoutDaysInput | null
}

export type DaysUpdateWithWhereUniqueWithoutWednesdayInput = {
  where: DaysWhereUniqueInput
  data: DaysUpdateWithoutWednesdayDataInput
}

export type DaysUpsertWithWhereUniqueWithoutWednesdayInput = {
  where: DaysWhereUniqueInput
  update: DaysUpdateWithoutWednesdayDataInput
  create: DaysCreateWithoutWednesdayInput
}

export type DaysUpdateManyWithoutWednesdayInput = {
  create?: Enumerable<DaysCreateWithoutWednesdayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
  set?: Enumerable<DaysWhereUniqueInput> | null
  disconnect?: Enumerable<DaysWhereUniqueInput> | null
  delete?: Enumerable<DaysWhereUniqueInput> | null
  update?: Enumerable<DaysUpdateWithWhereUniqueWithoutWednesdayInput> | null
  updateMany?: Enumerable<DaysUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<DaysScalarWhereInput> | null
  upsert?: Enumerable<DaysUpsertWithWhereUniqueWithoutWednesdayInput> | null
}

export type WednesdayUpdateInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysUpdateManyWithoutWednesdayInput | null
}

export type WednesdayUpdateManyMutationInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type DaysCreateWithoutThursdayInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday: MondayCreateOneWithoutDaysesInput
  tuesday: TuesdayCreateOneWithoutDaysesInput
  wednesday: WednesdayCreateOneWithoutDaysesInput
  friday: FridayCreateOneWithoutDaysesInput
  weeks?: WeekCreateManyWithoutDaysInput | null
}

export type DaysCreateManyWithoutThursdayInput = {
  create?: Enumerable<DaysCreateWithoutThursdayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
}

export type ThursdayCreateInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysCreateManyWithoutThursdayInput | null
}

export type DaysUpdateWithoutThursdayDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday?: MondayUpdateOneRequiredWithoutDaysesInput | null
  tuesday?: TuesdayUpdateOneRequiredWithoutDaysesInput | null
  wednesday?: WednesdayUpdateOneRequiredWithoutDaysesInput | null
  friday?: FridayUpdateOneRequiredWithoutDaysesInput | null
  weeks?: WeekUpdateManyWithoutDaysInput | null
}

export type DaysUpdateWithWhereUniqueWithoutThursdayInput = {
  where: DaysWhereUniqueInput
  data: DaysUpdateWithoutThursdayDataInput
}

export type DaysUpsertWithWhereUniqueWithoutThursdayInput = {
  where: DaysWhereUniqueInput
  update: DaysUpdateWithoutThursdayDataInput
  create: DaysCreateWithoutThursdayInput
}

export type DaysUpdateManyWithoutThursdayInput = {
  create?: Enumerable<DaysCreateWithoutThursdayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
  set?: Enumerable<DaysWhereUniqueInput> | null
  disconnect?: Enumerable<DaysWhereUniqueInput> | null
  delete?: Enumerable<DaysWhereUniqueInput> | null
  update?: Enumerable<DaysUpdateWithWhereUniqueWithoutThursdayInput> | null
  updateMany?: Enumerable<DaysUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<DaysScalarWhereInput> | null
  upsert?: Enumerable<DaysUpsertWithWhereUniqueWithoutThursdayInput> | null
}

export type ThursdayUpdateInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysUpdateManyWithoutThursdayInput | null
}

export type ThursdayUpdateManyMutationInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type DaysCreateWithoutFridayInput = {
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday: MondayCreateOneWithoutDaysesInput
  tuesday: TuesdayCreateOneWithoutDaysesInput
  wednesday: WednesdayCreateOneWithoutDaysesInput
  thursday: ThursdayCreateOneWithoutDaysesInput
  weeks?: WeekCreateManyWithoutDaysInput | null
}

export type DaysCreateManyWithoutFridayInput = {
  create?: Enumerable<DaysCreateWithoutFridayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
}

export type FridayCreateInput = {
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysCreateManyWithoutFridayInput | null
}

export type DaysUpdateWithoutFridayDataInput = {
  id?: number | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  monday?: MondayUpdateOneRequiredWithoutDaysesInput | null
  tuesday?: TuesdayUpdateOneRequiredWithoutDaysesInput | null
  wednesday?: WednesdayUpdateOneRequiredWithoutDaysesInput | null
  thursday?: ThursdayUpdateOneRequiredWithoutDaysesInput | null
  weeks?: WeekUpdateManyWithoutDaysInput | null
}

export type DaysUpdateWithWhereUniqueWithoutFridayInput = {
  where: DaysWhereUniqueInput
  data: DaysUpdateWithoutFridayDataInput
}

export type DaysUpsertWithWhereUniqueWithoutFridayInput = {
  where: DaysWhereUniqueInput
  update: DaysUpdateWithoutFridayDataInput
  create: DaysCreateWithoutFridayInput
}

export type DaysUpdateManyWithoutFridayInput = {
  create?: Enumerable<DaysCreateWithoutFridayInput> | null
  connect?: Enumerable<DaysWhereUniqueInput> | null
  set?: Enumerable<DaysWhereUniqueInput> | null
  disconnect?: Enumerable<DaysWhereUniqueInput> | null
  delete?: Enumerable<DaysWhereUniqueInput> | null
  update?: Enumerable<DaysUpdateWithWhereUniqueWithoutFridayInput> | null
  updateMany?: Enumerable<DaysUpdateManyWithWhereNestedInput> | null
  deleteMany?: Enumerable<DaysScalarWhereInput> | null
  upsert?: Enumerable<DaysUpsertWithWhereUniqueWithoutFridayInput> | null
}

export type FridayUpdateInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  dayses?: DaysUpdateManyWithoutFridayInput | null
}

export type FridayUpdateManyMutationInput = {
  id?: number | null
  eighttoten?: boolean | null
  tentotwelve?: boolean | null
  twelvetotwo?: boolean | null
  twotofour?: boolean | null
  fourtosix?: boolean | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type IntFilter = {
  equals?: number | null
  not?: number | IntFilter | null
  in?: Enumerable<number> | null
  notIn?: Enumerable<number> | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
}

export type BooleanFilter = {
  equals?: boolean | null
  not?: boolean | BooleanFilter | null
}

export type DateTimeFilter = {
  equals?: Date | string | null
  not?: Date | string | DateTimeFilter | null
  in?: Enumerable<Date | string> | null
  notIn?: Enumerable<Date | string> | null
  lt?: Date | string | null
  lte?: Date | string | null
  gt?: Date | string | null
  gte?: Date | string | null
}

export type DaysFilter = {
  every?: DaysWhereInput | null
  some?: DaysWhereInput | null
  none?: DaysWhereInput | null
}

export type WeekFilter = {
  every?: WeekWhereInput | null
  some?: WeekWhereInput | null
  none?: WeekWhereInput | null
}

export type StringFilter = {
  equals?: string | null
  not?: string | StringFilter | null
  in?: Enumerable<string> | null
  notIn?: Enumerable<string> | null
  lt?: string | null
  lte?: string | null
  gt?: string | null
  gte?: string | null
  contains?: string | null
  startsWith?: string | null
  endsWith?: string | null
}

export type BookingsOrderByInput = {
  id?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type WeekOrderByInput = {
  id?: OrderByArg | null
  anchor?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type DaysOrderByInput = {
  id?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type MondayOrderByInput = {
  id?: OrderByArg | null
  eighttoten?: OrderByArg | null
  tentotwelve?: OrderByArg | null
  twelvetotwo?: OrderByArg | null
  twotofour?: OrderByArg | null
  fourtosix?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type TuesdayOrderByInput = {
  id?: OrderByArg | null
  eighttoten?: OrderByArg | null
  tentotwelve?: OrderByArg | null
  twelvetotwo?: OrderByArg | null
  twotofour?: OrderByArg | null
  fourtosix?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type WednesdayOrderByInput = {
  id?: OrderByArg | null
  eighttoten?: OrderByArg | null
  tentotwelve?: OrderByArg | null
  twelvetotwo?: OrderByArg | null
  twotofour?: OrderByArg | null
  fourtosix?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type ThursdayOrderByInput = {
  id?: OrderByArg | null
  eighttoten?: OrderByArg | null
  tentotwelve?: OrderByArg | null
  twelvetotwo?: OrderByArg | null
  twotofour?: OrderByArg | null
  fourtosix?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

export type FridayOrderByInput = {
  id?: OrderByArg | null
  eighttoten?: OrderByArg | null
  tentotwelve?: OrderByArg | null
  twelvetotwo?: OrderByArg | null
  twotofour?: OrderByArg | null
  fourtosix?: OrderByArg | null
  createdAt?: OrderByArg | null
  updatedAt?: OrderByArg | null
}

/**
 * Batch Payload for updateMany & deleteMany
 */

export type BatchPayload = {
  count: number
}

/**
 * DMMF
 */
export declare const dmmf: DMMF.Document;
export {};
