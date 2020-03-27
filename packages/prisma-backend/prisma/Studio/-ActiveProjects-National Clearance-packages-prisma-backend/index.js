
Object.defineProperty(exports, "__esModule", { value: true });

const {
  DMMF,
  DMMFClass,
  deepGet,
  deepSet,
  makeDocument,
  Engine,
  debugLib,
  transformDocument,
  chalk,
  printStack,
  mergeBy,
  unpack,
  stripAnsi,
  parseDotenv,
  sqlTemplateTag,
  Dataloader,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  lowerCase
} = require('./runtime')

/**
 * Query Engine version: latest
 */

const path = require('path')
const fs = require('fs')

const debug = debugLib('prisma-client')

exports.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = PrismaClientRustPanicError;
exports.PrismaClientInitializationError = PrismaClientInitializationError;
exports.PrismaClientValidationError = PrismaClientValidationError;

class PrismaClientFetcher {
  constructor(prisma, enableDebug = false, hooks) {
    this.prisma = prisma;
    this.debug = enableDebug;
    this.hooks = hooks;
    this.dataloader = new Dataloader(async (requests) => {
      // TODO: More elaborate logic to only batch certain queries together
      // We should e.g. make sure, that findOne queries are batched together
      await this.prisma.connect();
      const queries = requests.map(r => String(r.document))
      debug('Requests:')
      debug(queries)
      const results = await this.prisma.engine.request(queries)
      debug('Results:')
      debug(results)
      return results
    })
  }
  async request({ document, dataPath = [], rootField, typeName, isList, callsite, collectTimestamps, clientMethod }) {
    if (this.hooks && this.hooks.beforeRequest) {
      const query = String(document);
      this.hooks.beforeRequest({ query, path: dataPath, rootField, typeName, document });
    }
    try {
      collectTimestamps && collectTimestamps.record("Pre-prismaClientConnect");
      collectTimestamps && collectTimestamps.record("Post-prismaClientConnect");
      collectTimestamps && collectTimestamps.record("Pre-engine_request");
      const result = await this.dataloader.request({ document });
      collectTimestamps && collectTimestamps.record("Post-engine_request");
      collectTimestamps && collectTimestamps.record("Pre-unpack");
      const unpackResult = this.unpack(document, result, dataPath, rootField, isList);
      collectTimestamps && collectTimestamps.record("Post-unpack");
      return unpackResult;
    } catch (e) {
      debug(e.stack);
      if (callsite) {
        const { stack } = printStack({
          callsite,
          originalMethod: clientMethod,
          onUs: e.isPanic
        });
        const message = stack + e.message;
        if (e.code) {
          throw new PrismaClientKnownRequestError(this.sanitizeMessage(message), e.code, e.meta);
        }
        if (e instanceof PrismaClientUnknownRequestError) {
          throw new PrismaClientUnknownRequestError(this.sanitizeMessage(message));
        } else if (e instanceof PrismaClientInitializationError) {
          throw new PrismaClientInitializationError(this.sanitizeMessage(message));
        } else if (e instanceof PrismaClientRustPanicError) {
          throw new PrismaClientRustPanicError(this.sanitizeMessage(message));
        }
      } else {
        if (e.code) {
          throw new PrismaClientKnownRequestError(this.sanitizeMessage(e.message), e.code, e.meta);
        }
        if (e.isPanic) {
          throw new PrismaClientRustPanicError(e.message);
        } else {
          if (e instanceof PrismaClientUnknownRequestError) {
            throw new PrismaClientUnknownRequestError(this.sanitizeMessage(message));
          } else if (e instanceof PrismaClientInitializationError) {
            throw new PrismaClientInitializationError(this.sanitizeMessage(message));
          } else if (e instanceof PrismaClientRustPanicError) {
            throw new PrismaClientRustPanicError(this.sanitizeMessage(message));
          }
        }
      }
    }
  }
  sanitizeMessage(message) {
    if (this.prisma.errorFormat && this.prisma.errorFormat !== 'pretty') {
      return stripAnsi(message);
    }
    return message;
  }
  unpack(document, data, path, rootField, isList) {
    if (data.data) {
      data = data.data
    }
    const getPath = [];
    if (rootField) {
      getPath.push(rootField);
    }
    getPath.push(...path.filter(p => p !== 'select' && p !== 'include'));
    return unpack({ document, data, path: getPath });
  }
}

class CollectTimestamps {
  constructor(startName) {
    this.records = [];
    this.start = undefined;
    this.additionalResults = {};
    this.start = { name: startName, value: process.hrtime() };
  }
  record(name) {
    this.records.push({ name, value: process.hrtime() });
  }
  elapsed(start, end) {
    const diff = [end[0] - start[0], end[1] - start[1]];
    const nanoseconds = (diff[0] * 1e9) + diff[1];
    const milliseconds = nanoseconds / 1e6;
    return milliseconds;
  }
  addResults(results) {
    Object.assign(this.additionalResults, results);
  }
  getResults() {
    const results = this.records.reduce((acc, record) => {
      const name = record.name.split('-')[1];
      if (acc[name]) {
        acc[name] = this.elapsed(acc[name], record.value);
      }
      else {
        acc[name] = record.value;
      }
      return acc;
    }, {});
    Object.assign(results, {
      total: this.elapsed(this.start.value, this.records[this.records.length - 1].value),
      ...this.additionalResults
    });
    return results;
  }
}


/**
 * Build tool annotations
 * In order to make `ncc` and `node-file-trace` happy.
**/

path.join(__dirname, 'runtime/query-engine-windows');

/**
 * Client
**/

// tested in getLogLevel.test.ts
function getLogLevel(log) {
    return log.reduce((acc, curr) => {
        const currentLevel = typeof curr === 'string' ? curr : curr.level;
        if (currentLevel === 'query') {
            return acc;
        }
        if (!acc) {
            return currentLevel;
        }
        if (curr === 'info' || acc === 'info') {
            // info always has precedence
            return 'info';
        }
        return currentLevel;
    }, undefined);
}
exports.getLogLevel = getLogLevel;

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
class PrismaClient {
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
  constructor(optionsArg) {
    const options = optionsArg || {}
    const internal = options.__internal || {}

    const useDebug = internal.debug === true
    if (useDebug) {
      debugLib.enable('prisma-client')
    }

    // datamodel = datamodel without datasources + printed datasources

    const predefinedDatasources = []

    const inputDatasources = Object.entries(options.datasources || {}).map(([name, url]) => ({ name, url }))
    const datasources = mergeBy(predefinedDatasources, inputDatasources, source => source.name)

    const engineConfig = internal.engine || {}

    if (options.errorFormat) {
      this.errorFormat = options.errorFormat
    } else if (process.env.NODE_ENV === 'production') {
      this.errorFormat = 'minimal'
    } else if (process.env.NO_COLOR) {
      this.errorFormat = 'colorless'
    } else {
      this.errorFormat = 'pretty'
    }

    this.measurePerformance = internal.measurePerformance || false

    const envFile = this.readEnv()

    this.engineConfig = {
      cwd: engineConfig.cwd || path.resolve(__dirname, "..\\.."),
      debug: useDebug,
      datamodelPath: path.resolve(__dirname, 'schema.prisma'),
      prismaPath: engineConfig.binaryPath || undefined,
      datasources,
      generator: {"binaryTargets":[],"config":{"copyRuntime":"true"},"name":"photon","provider":"prisma-client-js","output":"E:\\ActiveProjects\\National Clearance\\packages\\prisma-backend\\Prisma\\Studio\\-ActiveProjects-National Clearance-packages-prisma-backend"},
      showColors: this.errorFormat === 'pretty',
      logLevel: options.log && getLogLevel(options.log),
      logQueries: options.log && Boolean(options.log.find(o => typeof o === 'string' ? o === 'query' : o.level === 'query')),
      env: envFile,
      flags: options.forceTransactions ? ['--always_force_transactions'] : []
    }

    debug({ engineConfig: this.engineConfig })

    this.engine = new Engine(this.engineConfig)

    this.dmmf = new DMMFClass(dmmf)

    this.fetcher = new PrismaClientFetcher(this, false, internal.hooks)

    if (options.log) {
      for (const log of options.log) {
        const level = typeof log === 'string' ? log : log.emit === 'stdout' ? log.level : null
        if (level) {
          this.on(level, event => {
            const colorMap = {
              query: 'blue',
              info: 'cyan',
              warn: 'yellow'
            }
            console.error(chalk[colorMap[level]](`prisma:${level}`.padEnd(13)) + (event.message || event.query))
          })
        }
      }
    }
  }

  /**
   * @private
   */
  readEnv() {
    const dotEnvPath = path.resolve(path.resolve(__dirname, "..\\.."), '.env')

    if (fs.existsSync(dotEnvPath)) {
      return parseDotenv(fs.readFileSync(dotEnvPath, 'utf-8'))
    }

    return {}
  }

  on(eventType, callback) {
    this.engine.on(eventType, event => {
      const fields = event.fields
      if (eventType === 'query') {
        callback({
          timestamp: event.timestamp,
          query: fields.query,
          params: fields.params,
          duration: fields.duration_ms,
          target: event.target
        })
      } else { // warn or info events
        callback({
          timestamp: event.timestamp,
          message: fields.message,
          target: event.target
        })
      }
    })
  }
  /**
   * Connect with the database
   */
  async connect() {
    if (this.disconnectionPromise) {
      debug('awaiting disconnection promise')
      await this.disconnectionPromise
    } else {
      debug('disconnection promise doesnt exist')
    }
    if (this.connectionPromise) {
      return this.connectionPromise
    }
    this.connectionPromise = this.engine.start()
    return this.connectionPromise
  }
  /**
   * @private
   */
  async runDisconnect() {
    debug('disconnectionPromise: stopping engine')
    await this.engine.stop()
    delete this.connectionPromise
    this.engine = new Engine(this.engineConfig)
    delete this.disconnectionPromise
  }
  /**
   * Disconnect from the database
   */
  async disconnect() {
    if (!this.disconnectionPromise) {
      this.disconnectionPromise = this.runDisconnect() 
    }
    return this.disconnectionPromise
  }
  /**
   * Makes a raw query
   */ 
  async raw(stringOrTemplateStringsArray, ...values) {
    let query = ''
    let parameters = undefined

    if (Array.isArray(stringOrTemplateStringsArray)) {
      // Called with prisma.raw``
      const queryInstance = sqlTemplateTag.sqltag(stringOrTemplateStringsArray, ...values)
      query = queryInstance.sql
      parameters = JSON.stringify(queryInstance.values)
    } else {
      // Called with prisma.raw(string)
      query = stringOrTemplateStringsArray 
    }

    const document = makeDocument({
      dmmf: this.dmmf,
      rootField: "executeRaw",
      rootTypeName: 'mutation',
      select: {
        query,
        parameters
      }
    })

    document.validate({ query, parameters }, false, 'raw', this.errorFormat)
    
    return this.fetcher.request({ document, rootField: 'executeRaw', typeName: 'raw', isList: false })
  }

  /**
   * `prisma.bookings`: Exposes CRUD operations for the **Bookings** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Bookings
   * const bookings = await prisma.bookings.findMany()
   * ```
   */
  get bookings() {
    return BookingsDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.week`: Exposes CRUD operations for the **Week** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Weeks
   * const weeks = await prisma.week.findMany()
   * ```
   */
  get week() {
    return WeekDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.days`: Exposes CRUD operations for the **Days** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Days
   * const days = await prisma.days.findMany()
   * ```
   */
  get days() {
    return DaysDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.monday`: Exposes CRUD operations for the **Monday** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Mondays
   * const mondays = await prisma.monday.findMany()
   * ```
   */
  get monday() {
    return MondayDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.tuesday`: Exposes CRUD operations for the **Tuesday** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Tuesdays
   * const tuesdays = await prisma.tuesday.findMany()
   * ```
   */
  get tuesday() {
    return TuesdayDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.wednesday`: Exposes CRUD operations for the **Wednesday** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Wednesdays
   * const wednesdays = await prisma.wednesday.findMany()
   * ```
   */
  get wednesday() {
    return WednesdayDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.thursday`: Exposes CRUD operations for the **Thursday** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Thursdays
   * const thursdays = await prisma.thursday.findMany()
   * ```
   */
  get thursday() {
    return ThursdayDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
  /**
   * `prisma.friday`: Exposes CRUD operations for the **Friday** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Fridays
   * const fridays = await prisma.friday.findMany()
   * ```
   */
  get friday() {
    return FridayDelegate(this.dmmf, this.fetcher, this.errorFormat, this.measurePerformance)
  }
}
exports.PrismaClient = PrismaClient



/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

exports.OrderByArg = makeEnum({
  asc: 'asc',
  desc: 'desc'
});


function BookingsDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Bookings = {} 
  Bookings.findOne = (args) => args && args.select ? new BookingsClient(
    dmmf,
    fetcher,
    'query',
    'findOneBookings',
    'bookings.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new BookingsClient(
    dmmf,
    fetcher,
    'query',
    'findOneBookings',
    'bookings.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.findMany = (args) => new BookingsClient(
    dmmf,
    fetcher,
    'query',
    'findManyBookings',
    'bookings.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.create = (args) => args && args.select ? new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneBookings',
    'bookings.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneBookings',
    'bookings.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.delete = (args) => args && args.select ? new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneBookings',
    'bookings.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneBookings',
    'bookings.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.update = (args) => args && args.select ? new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneBookings',
    'bookings.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneBookings',
    'bookings.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.deleteMany = (args) => new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyBookings',
    'bookings.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.updateMany = (args) => new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyBookings',
    'bookings.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.upsert = (args) => args && args.select ? new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneBookings',
    'bookings.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new BookingsClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneBookings',
    'bookings.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Bookings.count = () => new BookingsClient(dmmf, fetcher, 'query', 'aggregateBookings', 'bookings.count', {}, ['count'], errorFormat)
  return Bookings
}

class BookingsClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  weeks(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'weeks']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new WeekClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Bookings',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Bookings',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Bookings',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.BookingsClient = BookingsClient

function WeekDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Week = {} 
  Week.findOne = (args) => args && args.select ? new WeekClient(
    dmmf,
    fetcher,
    'query',
    'findOneWeek',
    'weeks.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WeekClient(
    dmmf,
    fetcher,
    'query',
    'findOneWeek',
    'weeks.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.findMany = (args) => new WeekClient(
    dmmf,
    fetcher,
    'query',
    'findManyWeek',
    'weeks.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.create = (args) => args && args.select ? new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneWeek',
    'weeks.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneWeek',
    'weeks.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.delete = (args) => args && args.select ? new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneWeek',
    'weeks.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneWeek',
    'weeks.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.update = (args) => args && args.select ? new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneWeek',
    'weeks.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneWeek',
    'weeks.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.deleteMany = (args) => new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyWeek',
    'weeks.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.updateMany = (args) => new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyWeek',
    'weeks.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.upsert = (args) => args && args.select ? new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneWeek',
    'weeks.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WeekClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneWeek',
    'weeks.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Week.count = () => new WeekClient(dmmf, fetcher, 'query', 'aggregateWeek', 'weeks.count', {}, ['count'], errorFormat)
  return Week
}

class WeekClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  days(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'days']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new DaysClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  bookings(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'bookings']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new BookingsClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Week',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Week',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Week',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.WeekClient = WeekClient

function DaysDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Days = {} 
  Days.findOne = (args) => args && args.select ? new DaysClient(
    dmmf,
    fetcher,
    'query',
    'findOneDays',
    'days.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new DaysClient(
    dmmf,
    fetcher,
    'query',
    'findOneDays',
    'days.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.findMany = (args) => new DaysClient(
    dmmf,
    fetcher,
    'query',
    'findManyDays',
    'days.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.create = (args) => args && args.select ? new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneDays',
    'days.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneDays',
    'days.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.delete = (args) => args && args.select ? new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneDays',
    'days.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneDays',
    'days.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.update = (args) => args && args.select ? new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneDays',
    'days.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneDays',
    'days.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.deleteMany = (args) => new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyDays',
    'days.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.updateMany = (args) => new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyDays',
    'days.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.upsert = (args) => args && args.select ? new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneDays',
    'days.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new DaysClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneDays',
    'days.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Days.count = () => new DaysClient(dmmf, fetcher, 'query', 'aggregateDays', 'days.count', {}, ['count'], errorFormat)
  return Days
}

class DaysClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  monday(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'monday']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new MondayClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  tuesday(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'tuesday']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new TuesdayClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  wednesday(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'wednesday']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new WednesdayClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  thursday(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'thursday']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new ThursdayClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  friday(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'friday']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = false
    return new FridayClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  weeks(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'weeks']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new WeekClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Days',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Days',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Days',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.DaysClient = DaysClient

function MondayDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Monday = {} 
  Monday.findOne = (args) => args && args.select ? new MondayClient(
    dmmf,
    fetcher,
    'query',
    'findOneMonday',
    'mondays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new MondayClient(
    dmmf,
    fetcher,
    'query',
    'findOneMonday',
    'mondays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.findMany = (args) => new MondayClient(
    dmmf,
    fetcher,
    'query',
    'findManyMonday',
    'mondays.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.create = (args) => args && args.select ? new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneMonday',
    'mondays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneMonday',
    'mondays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.delete = (args) => args && args.select ? new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneMonday',
    'mondays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneMonday',
    'mondays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.update = (args) => args && args.select ? new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneMonday',
    'mondays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneMonday',
    'mondays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.deleteMany = (args) => new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyMonday',
    'mondays.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.updateMany = (args) => new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyMonday',
    'mondays.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.upsert = (args) => args && args.select ? new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneMonday',
    'mondays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new MondayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneMonday',
    'mondays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Monday.count = () => new MondayClient(dmmf, fetcher, 'query', 'aggregateMonday', 'mondays.count', {}, ['count'], errorFormat)
  return Monday
}

class MondayClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  dayses(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'dayses']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new DaysClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Monday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Monday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Monday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.MondayClient = MondayClient

function TuesdayDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Tuesday = {} 
  Tuesday.findOne = (args) => args && args.select ? new TuesdayClient(
    dmmf,
    fetcher,
    'query',
    'findOneTuesday',
    'tuesdays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new TuesdayClient(
    dmmf,
    fetcher,
    'query',
    'findOneTuesday',
    'tuesdays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.findMany = (args) => new TuesdayClient(
    dmmf,
    fetcher,
    'query',
    'findManyTuesday',
    'tuesdays.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.create = (args) => args && args.select ? new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneTuesday',
    'tuesdays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneTuesday',
    'tuesdays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.delete = (args) => args && args.select ? new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneTuesday',
    'tuesdays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneTuesday',
    'tuesdays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.update = (args) => args && args.select ? new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneTuesday',
    'tuesdays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneTuesday',
    'tuesdays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.deleteMany = (args) => new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyTuesday',
    'tuesdays.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.updateMany = (args) => new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyTuesday',
    'tuesdays.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.upsert = (args) => args && args.select ? new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneTuesday',
    'tuesdays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new TuesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneTuesday',
    'tuesdays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Tuesday.count = () => new TuesdayClient(dmmf, fetcher, 'query', 'aggregateTuesday', 'tuesdays.count', {}, ['count'], errorFormat)
  return Tuesday
}

class TuesdayClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  dayses(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'dayses']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new DaysClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Tuesday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Tuesday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Tuesday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.TuesdayClient = TuesdayClient

function WednesdayDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Wednesday = {} 
  Wednesday.findOne = (args) => args && args.select ? new WednesdayClient(
    dmmf,
    fetcher,
    'query',
    'findOneWednesday',
    'wednesdays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WednesdayClient(
    dmmf,
    fetcher,
    'query',
    'findOneWednesday',
    'wednesdays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.findMany = (args) => new WednesdayClient(
    dmmf,
    fetcher,
    'query',
    'findManyWednesday',
    'wednesdays.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.create = (args) => args && args.select ? new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneWednesday',
    'wednesdays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneWednesday',
    'wednesdays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.delete = (args) => args && args.select ? new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneWednesday',
    'wednesdays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneWednesday',
    'wednesdays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.update = (args) => args && args.select ? new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneWednesday',
    'wednesdays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneWednesday',
    'wednesdays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.deleteMany = (args) => new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyWednesday',
    'wednesdays.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.updateMany = (args) => new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyWednesday',
    'wednesdays.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.upsert = (args) => args && args.select ? new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneWednesday',
    'wednesdays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new WednesdayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneWednesday',
    'wednesdays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Wednesday.count = () => new WednesdayClient(dmmf, fetcher, 'query', 'aggregateWednesday', 'wednesdays.count', {}, ['count'], errorFormat)
  return Wednesday
}

class WednesdayClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  dayses(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'dayses']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new DaysClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Wednesday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Wednesday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Wednesday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.WednesdayClient = WednesdayClient

function ThursdayDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Thursday = {} 
  Thursday.findOne = (args) => args && args.select ? new ThursdayClient(
    dmmf,
    fetcher,
    'query',
    'findOneThursday',
    'thursdays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new ThursdayClient(
    dmmf,
    fetcher,
    'query',
    'findOneThursday',
    'thursdays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.findMany = (args) => new ThursdayClient(
    dmmf,
    fetcher,
    'query',
    'findManyThursday',
    'thursdays.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.create = (args) => args && args.select ? new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneThursday',
    'thursdays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneThursday',
    'thursdays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.delete = (args) => args && args.select ? new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneThursday',
    'thursdays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneThursday',
    'thursdays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.update = (args) => args && args.select ? new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneThursday',
    'thursdays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneThursday',
    'thursdays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.deleteMany = (args) => new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyThursday',
    'thursdays.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.updateMany = (args) => new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyThursday',
    'thursdays.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.upsert = (args) => args && args.select ? new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneThursday',
    'thursdays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new ThursdayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneThursday',
    'thursdays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Thursday.count = () => new ThursdayClient(dmmf, fetcher, 'query', 'aggregateThursday', 'thursdays.count', {}, ['count'], errorFormat)
  return Thursday
}

class ThursdayClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  dayses(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'dayses']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new DaysClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Thursday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Thursday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Thursday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.ThursdayClient = ThursdayClient

function FridayDelegate(dmmf, fetcher, errorFormat, measurePerformance) {
  const Friday = {} 
  Friday.findOne = (args) => args && args.select ? new FridayClient(
    dmmf,
    fetcher,
    'query',
    'findOneFriday',
    'fridays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new FridayClient(
    dmmf,
    fetcher,
    'query',
    'findOneFriday',
    'fridays.findOne',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.findMany = (args) => new FridayClient(
    dmmf,
    fetcher,
    'query',
    'findManyFriday',
    'fridays.findMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.create = (args) => args && args.select ? new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneFriday',
    'fridays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'createOneFriday',
    'fridays.create',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.delete = (args) => args && args.select ? new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneFriday',
    'fridays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteOneFriday',
    'fridays.delete',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.update = (args) => args && args.select ? new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneFriday',
    'fridays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateOneFriday',
    'fridays.update',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.deleteMany = (args) => new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'deleteManyFriday',
    'fridays.deleteMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.updateMany = (args) => new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'updateManyFriday',
    'fridays.updateMany',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.upsert = (args) => args && args.select ? new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneFriday',
    'fridays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  ) : new FridayClient(
    dmmf,
    fetcher,
    'mutation',
    'upsertOneFriday',
    'fridays.upsert',
    args || {},
    [],
    errorFormat,
    measurePerformance
  )
  Friday.count = () => new FridayClient(dmmf, fetcher, 'query', 'aggregateFriday', 'fridays.count', {}, ['count'], errorFormat)
  return Friday
}

class FridayClient {
  constructor(_dmmf, _fetcher, _queryType, _rootField, _clientMethod, _args, _dataPath, _errorFormat, _measurePerformance, _isList) {
    this._dmmf = _dmmf;
    this._fetcher = _fetcher;
    this._queryType = _queryType;
    this._rootField = _rootField;
    this._clientMethod = _clientMethod;
    this._args = _args;
    this._dataPath = _dataPath;
    this._errorFormat = _errorFormat;
    this._measurePerformance = _measurePerformance;
    this._isList = _isList;
    if (this._measurePerformance) {
      // Timestamps for performance checks
      this._collectTimestamps = new CollectTimestamps("PrismaClient");
    }
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && this._errorFormat !== 'minimal') {
      const error = new Error();
      if (error && error.stack) {
        const stack = error.stack;
        this._callsite = stack;
      }
    }
  }

  dayses(args) {
    const prefix = this._dataPath.includes('select') ? 'select' : this._dataPath.includes('include') ? 'include' : 'select'
    const dataPath = [...this._dataPath, prefix, 'dayses']
    const newArgs = deepSet(this._args, dataPath, args || true)
    this._isList = true
    return new DaysClient(this._dmmf, this._fetcher, this._queryType, this._rootField, this._clientMethod, newArgs, dataPath, this._errorFormat, this._measurePerformance, this._isList)
  }

  get _document() {
    const { _rootField: rootField } = this
    this._collectTimestamps && this._collectTimestamps.record("Pre-makeDocument")
    const document = makeDocument({
      dmmf: this._dmmf,
      rootField,
      rootTypeName: this._queryType,
      select: this._args
    })
    this._collectTimestamps && this._collectTimestamps.record("Post-makeDocument")
    try {
      this._collectTimestamps && this._collectTimestamps.record("Pre-document.validate")
      document.validate(this._args, false, this._clientMethod, this._errorFormat)
      this._collectTimestamps && this._collectTimestamps.record("Post-document.validate")
    } catch (e) {
      const x = e
      if (this._errorFormat !== 'minimal' && x.render) {
        if (this._callsite) {
          e.message = x.render(this._callsite)
        }
      }
      throw e
    }
    this._collectTimestamps && this._collectTimestamps.record("Pre-transformDocument")
    const transformedDocument = transformDocument(document)
    this._collectTimestamps && this._collectTimestamps.record("Post-transformDocument")
    return transformedDocument
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then(onfulfilled, onrejected) {
    if (!this._requestPromise){
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Friday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.then(onfulfilled, onrejected)
  }

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch(onrejected) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Friday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.catch(onrejected)
  }

  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally) {
    if (!this._requestPromise) {
      this._requestPromise = this._fetcher.request({
        document: this._document,
        dataPath: this._dataPath,
        rootField: this._rootField,
        typeName: 'Friday',
        isList: this._isList,
        callsite: this._callsite,
        collectTimestamps: this._collectTimestamps,
        clientMethod: this._clientMethod
      })
    }
    return this._requestPromise.finally(onfinally)
  }
}

exports.FridayClient = FridayClient


/**
 * DMMF
 */
const dmmfString = '{"datamodel":{"enums":[],"models":[{"name":"Bookings","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"weeks","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Week","relationName":"BookingsToWeek","relationToFields":[],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Week","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"days","kind":"object","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Days","relationName":"DaysToWeek","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"anchor","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"bookings","kind":"object","dbNames":[],"isList":false,"isRequired":false,"isUnique":false,"isId":false,"type":"Bookings","relationName":"BookingsToWeek","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Days","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"monday","kind":"object","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Monday","relationName":"monday-times","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"tuesday","kind":"object","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Tuesday","relationName":"tuesday-times","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"wednesday","kind":"object","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Wednesday","relationName":"wednesday-times","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"thursday","kind":"object","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Thursday","relationName":"thursday-times","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"friday","kind":"object","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Friday","relationName":"friday-times","relationToFields":["id"],"relationOnDelete":"NONE","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"weeks","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Week","relationName":"DaysToWeek","relationToFields":[],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Monday","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"eighttoten","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"tentotwelve","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twelvetotwo","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twotofour","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"fourtosix","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"dayses","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Days","relationName":"monday-times","relationToFields":[],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Tuesday","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"eighttoten","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"tentotwelve","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twelvetotwo","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twotofour","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"fourtosix","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"dayses","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Days","relationName":"tuesday-times","relationToFields":[],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Wednesday","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"eighttoten","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"tentotwelve","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twelvetotwo","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twotofour","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"fourtosix","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"dayses","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Days","relationName":"wednesday-times","relationToFields":[],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Thursday","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"eighttoten","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"tentotwelve","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twelvetotwo","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twotofour","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"fourtosix","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"dayses","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Days","relationName":"thursday-times","relationToFields":[],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]},{"name":"Friday","isEmbedded":false,"dbName":null,"fields":[{"name":"id","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":true,"type":"Int","default":{"name":"autoincrement","returnType":"Int","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"eighttoten","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"tentotwelve","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twelvetotwo","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"twotofour","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"fourtosix","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","dbNames":[],"isList":false,"isRequired":true,"isUnique":false,"isId":false,"type":"DateTime","default":{"name":"now","returnType":"DateTime","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"dayses","kind":"object","dbNames":[],"isList":true,"isRequired":false,"isUnique":false,"isId":false,"type":"Days","relationName":"friday-times","relationToFields":[],"relationOnDelete":"NONE","isGenerated":true,"isUpdatedAt":false}],"isGenerated":false,"idFields":[],"uniqueFields":[]}]},"mappings":[{"model":"Bookings","plural":"bookings","findOne":"findOneBookings","findMany":"findManyBookings","create":"createOneBookings","delete":"deleteOneBookings","update":"updateOneBookings","deleteMany":"deleteManyBookings","updateMany":"updateManyBookings","upsert":"upsertOneBookings","aggregate":"aggregateBookings"},{"model":"Week","plural":"weeks","findOne":"findOneWeek","findMany":"findManyWeek","create":"createOneWeek","delete":"deleteOneWeek","update":"updateOneWeek","deleteMany":"deleteManyWeek","updateMany":"updateManyWeek","upsert":"upsertOneWeek","aggregate":"aggregateWeek"},{"model":"Days","plural":"days","findOne":"findOneDays","findMany":"findManyDays","create":"createOneDays","delete":"deleteOneDays","update":"updateOneDays","deleteMany":"deleteManyDays","updateMany":"updateManyDays","upsert":"upsertOneDays","aggregate":"aggregateDays"},{"model":"Monday","plural":"mondays","findOne":"findOneMonday","findMany":"findManyMonday","create":"createOneMonday","delete":"deleteOneMonday","update":"updateOneMonday","deleteMany":"deleteManyMonday","updateMany":"updateManyMonday","upsert":"upsertOneMonday","aggregate":"aggregateMonday"},{"model":"Tuesday","plural":"tuesdays","findOne":"findOneTuesday","findMany":"findManyTuesday","create":"createOneTuesday","delete":"deleteOneTuesday","update":"updateOneTuesday","deleteMany":"deleteManyTuesday","updateMany":"updateManyTuesday","upsert":"upsertOneTuesday","aggregate":"aggregateTuesday"},{"model":"Wednesday","plural":"wednesdays","findOne":"findOneWednesday","findMany":"findManyWednesday","create":"createOneWednesday","delete":"deleteOneWednesday","update":"updateOneWednesday","deleteMany":"deleteManyWednesday","updateMany":"updateManyWednesday","upsert":"upsertOneWednesday","aggregate":"aggregateWednesday"},{"model":"Thursday","plural":"thursdays","findOne":"findOneThursday","findMany":"findManyThursday","create":"createOneThursday","delete":"deleteOneThursday","update":"updateOneThursday","deleteMany":"deleteManyThursday","updateMany":"updateManyThursday","upsert":"upsertOneThursday","aggregate":"aggregateThursday"},{"model":"Friday","plural":"fridays","findOne":"findOneFriday","findMany":"findManyFriday","create":"createOneFriday","delete":"deleteOneFriday","update":"updateOneFriday","deleteMany":"deleteManyFriday","updateMany":"updateManyFriday","upsert":"upsertOneFriday","aggregate":"aggregateFriday"}],"schema":{"enums":[{"name":"OrderByArg","values":["asc","desc"]}],"outputTypes":[{"name":"Monday","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"eighttoten","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"tentotwelve","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twelvetotwo","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twotofour","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"fourtosix","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"dayses","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"DaysOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":true}}]},{"name":"Tuesday","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"eighttoten","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"tentotwelve","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twelvetotwo","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twotofour","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"fourtosix","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"dayses","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"DaysOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":true}}]},{"name":"Wednesday","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"eighttoten","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"tentotwelve","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twelvetotwo","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twotofour","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"fourtosix","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"dayses","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"DaysOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":true}}]},{"name":"Thursday","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"eighttoten","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"tentotwelve","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twelvetotwo","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twotofour","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"fourtosix","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"dayses","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"DaysOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":true}}]},{"name":"Friday","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"eighttoten","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"tentotwelve","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twelvetotwo","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"twotofour","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"fourtosix","args":[],"outputType":{"type":"Boolean","kind":"scalar","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"dayses","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"DaysOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":true}}]},{"name":"Days","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"monday","args":[],"outputType":{"type":"Monday","kind":"object","isRequired":true,"isList":false}},{"name":"tuesday","args":[],"outputType":{"type":"Tuesday","kind":"object","isRequired":true,"isList":false}},{"name":"wednesday","args":[],"outputType":{"type":"Wednesday","kind":"object","isRequired":true,"isList":false}},{"name":"thursday","args":[],"outputType":{"type":"Thursday","kind":"object","isRequired":true,"isList":false}},{"name":"friday","args":[],"outputType":{"type":"Friday","kind":"object","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"weeks","args":[{"name":"where","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"WeekOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":false,"isList":true}}]},{"name":"Week","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"days","args":[],"outputType":{"type":"Days","kind":"object","isRequired":true,"isList":false}},{"name":"anchor","args":[],"outputType":{"type":"String","kind":"scalar","isRequired":true,"isList":false}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"bookings","args":[],"outputType":{"type":"Bookings","kind":"object","isRequired":false,"isList":false}}]},{"name":"Bookings","fields":[{"name":"id","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}},{"name":"weeks","args":[{"name":"where","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"WeekOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":false,"isList":true}},{"name":"createdAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}},{"name":"updatedAt","args":[],"outputType":{"type":"DateTime","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateBookings","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateWeek","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateDays","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateMonday","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateTuesday","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateWednesday","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateThursday","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"AggregateFriday","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"Query","fields":[{"name":"findManyBookings","args":[{"name":"where","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"BookingsOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Bookings","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateBookings","args":[],"outputType":{"type":"AggregateBookings","kind":"object","isRequired":true,"isList":false}},{"name":"findOneBookings","args":[{"name":"where","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Bookings","kind":"object","isRequired":false,"isList":false}},{"name":"findManyWeek","args":[{"name":"where","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"WeekOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateWeek","args":[],"outputType":{"type":"AggregateWeek","kind":"object","isRequired":true,"isList":false}},{"name":"findOneWeek","args":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":false,"isList":false}},{"name":"findManyDays","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"DaysOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateDays","args":[],"outputType":{"type":"AggregateDays","kind":"object","isRequired":true,"isList":false}},{"name":"findOneDays","args":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":false}},{"name":"findManyMonday","args":[{"name":"where","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"MondayOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Monday","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateMonday","args":[],"outputType":{"type":"AggregateMonday","kind":"object","isRequired":true,"isList":false}},{"name":"findOneMonday","args":[{"name":"where","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Monday","kind":"object","isRequired":false,"isList":false}},{"name":"findManyTuesday","args":[{"name":"where","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"TuesdayOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Tuesday","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateTuesday","args":[],"outputType":{"type":"AggregateTuesday","kind":"object","isRequired":true,"isList":false}},{"name":"findOneTuesday","args":[{"name":"where","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Tuesday","kind":"object","isRequired":false,"isList":false}},{"name":"findManyWednesday","args":[{"name":"where","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"WednesdayOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Wednesday","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateWednesday","args":[],"outputType":{"type":"AggregateWednesday","kind":"object","isRequired":true,"isList":false}},{"name":"findOneWednesday","args":[{"name":"where","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Wednesday","kind":"object","isRequired":false,"isList":false}},{"name":"findManyThursday","args":[{"name":"where","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"ThursdayOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Thursday","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateThursday","args":[],"outputType":{"type":"AggregateThursday","kind":"object","isRequired":true,"isList":false}},{"name":"findOneThursday","args":[{"name":"where","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Thursday","kind":"object","isRequired":false,"isList":false}},{"name":"findManyFriday","args":[{"name":"where","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":false}]},{"name":"orderBy","inputType":[{"isList":false,"isRequired":false,"type":"FridayOrderByInput","kind":"object"}]},{"name":"skip","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"after","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"before","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"first","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"last","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Friday","kind":"object","isRequired":true,"isList":true}},{"name":"aggregateFriday","args":[],"outputType":{"type":"AggregateFriday","kind":"object","isRequired":true,"isList":false}},{"name":"findOneFriday","args":[{"name":"where","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Friday","kind":"object","isRequired":false,"isList":false}}]},{"name":"BatchPayload","fields":[{"name":"count","args":[],"outputType":{"type":"Int","kind":"scalar","isRequired":true,"isList":false}}]},{"name":"Mutation","fields":[{"name":"createOneBookings","args":[{"name":"data","inputType":[{"type":"BookingsCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Bookings","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneBookings","args":[{"name":"where","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Bookings","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneBookings","args":[{"name":"data","inputType":[{"type":"BookingsUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Bookings","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneBookings","args":[{"name":"where","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"BookingsCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"BookingsUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Bookings","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyBookings","args":[{"name":"data","inputType":[{"type":"BookingsUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyBookings","args":[{"name":"where","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneWeek","args":[{"name":"data","inputType":[{"type":"WeekCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneWeek","args":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneWeek","args":[{"name":"data","inputType":[{"type":"WeekUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneWeek","args":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"WeekCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"WeekUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Week","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyWeek","args":[{"name":"data","inputType":[{"type":"WeekUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyWeek","args":[{"name":"where","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneDays","args":[{"name":"data","inputType":[{"type":"DaysCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneDays","args":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneDays","args":[{"name":"data","inputType":[{"type":"DaysUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneDays","args":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Days","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyDays","args":[{"name":"data","inputType":[{"type":"DaysUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyDays","args":[{"name":"where","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneMonday","args":[{"name":"data","inputType":[{"type":"MondayCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Monday","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneMonday","args":[{"name":"where","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Monday","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneMonday","args":[{"name":"data","inputType":[{"type":"MondayUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Monday","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneMonday","args":[{"name":"where","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"MondayCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"MondayUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Monday","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyMonday","args":[{"name":"data","inputType":[{"type":"MondayUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyMonday","args":[{"name":"where","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneTuesday","args":[{"name":"data","inputType":[{"type":"TuesdayCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Tuesday","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneTuesday","args":[{"name":"where","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Tuesday","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneTuesday","args":[{"name":"data","inputType":[{"type":"TuesdayUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Tuesday","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneTuesday","args":[{"name":"where","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"TuesdayCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"TuesdayUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Tuesday","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyTuesday","args":[{"name":"data","inputType":[{"type":"TuesdayUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyTuesday","args":[{"name":"where","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneWednesday","args":[{"name":"data","inputType":[{"type":"WednesdayCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Wednesday","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneWednesday","args":[{"name":"where","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Wednesday","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneWednesday","args":[{"name":"data","inputType":[{"type":"WednesdayUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Wednesday","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneWednesday","args":[{"name":"where","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"WednesdayCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"WednesdayUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Wednesday","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyWednesday","args":[{"name":"data","inputType":[{"type":"WednesdayUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyWednesday","args":[{"name":"where","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneThursday","args":[{"name":"data","inputType":[{"type":"ThursdayCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Thursday","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneThursday","args":[{"name":"where","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Thursday","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneThursday","args":[{"name":"data","inputType":[{"type":"ThursdayUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Thursday","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneThursday","args":[{"name":"where","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"ThursdayCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"ThursdayUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Thursday","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyThursday","args":[{"name":"data","inputType":[{"type":"ThursdayUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyThursday","args":[{"name":"where","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"createOneFriday","args":[{"name":"data","inputType":[{"type":"FridayCreateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Friday","kind":"object","isRequired":true,"isList":false}},{"name":"deleteOneFriday","args":[{"name":"where","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Friday","kind":"object","isRequired":false,"isList":false}},{"name":"updateOneFriday","args":[{"name":"data","inputType":[{"type":"FridayUpdateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Friday","kind":"object","isRequired":false,"isList":false}},{"name":"upsertOneFriday","args":[{"name":"where","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"FridayCreateInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"FridayUpdateInput","kind":"object","isRequired":true,"isList":false}]}],"outputType":{"type":"Friday","kind":"object","isRequired":true,"isList":false}},{"name":"updateManyFriday","args":[{"name":"data","inputType":[{"type":"FridayUpdateManyMutationInput","kind":"object","isRequired":true,"isList":false}]},{"name":"where","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"deleteManyFriday","args":[{"name":"where","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":false}]}],"outputType":{"type":"BatchPayload","kind":"object","isRequired":true,"isList":false}},{"name":"executeRaw","args":[{"name":"query","inputType":[{"type":"String","kind":"scalar","isRequired":true,"isList":false}]},{"name":"parameters","inputType":[{"type":"Json","kind":"scalar","isRequired":false,"isList":false}]}],"outputType":{"type":"Json","kind":"scalar","isRequired":true,"isList":false}}]}],"inputTypes":[{"name":"MondayWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"dayses","inputType":[{"type":"DaysFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"TuesdayWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"dayses","inputType":[{"type":"DaysFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"WednesdayWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"dayses","inputType":[{"type":"DaysFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"ThursdayWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"dayses","inputType":[{"type":"DaysFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"FridayWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"type":"BooleanFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"dayses","inputType":[{"type":"DaysFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"DaysWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"weeks","inputType":[{"type":"WeekFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"monday","inputType":[{"type":"MondayWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true},{"name":"tuesday","inputType":[{"type":"TuesdayWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true},{"name":"wednesday","inputType":[{"type":"WednesdayWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true},{"name":"thursday","inputType":[{"type":"ThursdayWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true},{"name":"friday","inputType":[{"type":"FridayWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"WeekWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"anchor","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"},{"type":"StringFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"AND","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"WeekWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"days","inputType":[{"type":"DaysWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true},{"name":"bookings","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":false}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"BookingsWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"weeks","inputType":[{"type":"WeekFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"AND","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"BookingsWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"IdCompoundUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":true,"isList":false}]}]},{"name":"BookingsWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"WeekWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"DaysWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"MondayWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"TuesdayWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"WednesdayWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"ThursdayWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"FridayWhereUniqueInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]}],"atLeastOne":true},{"name":"MondayCreateWithoutDaysesInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"MondayCreateOneWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"MondayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"TuesdayCreateWithoutDaysesInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"TuesdayCreateOneWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"TuesdayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WednesdayCreateWithoutDaysesInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"WednesdayCreateOneWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"WednesdayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"ThursdayCreateWithoutDaysesInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"ThursdayCreateOneWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"ThursdayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"FridayCreateWithoutDaysesInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"FridayCreateOneWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"FridayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysCreateWithoutWeeksInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysCreateOneWithoutWeeksInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekCreateWithoutBookingsInput","fields":[{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":true,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"days","inputType":[{"type":"DaysCreateOneWithoutWeeksInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WeekCreateManyWithoutBookingsInput","fields":[{"name":"create","inputType":[{"type":"WeekCreateWithoutBookingsInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"BookingsCreateInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutBookingsInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"MondayUpdateWithoutDaysesDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"MondayUpsertWithoutDaysesInput","fields":[{"name":"update","inputType":[{"type":"MondayUpdateWithoutDaysesDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"MondayCreateWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"MondayUpdateOneRequiredWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"MondayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"MondayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"MondayUpdateWithoutDaysesDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"MondayUpsertWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"TuesdayUpdateWithoutDaysesDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"TuesdayUpsertWithoutDaysesInput","fields":[{"name":"update","inputType":[{"type":"TuesdayUpdateWithoutDaysesDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"TuesdayCreateWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"TuesdayUpdateOneRequiredWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"TuesdayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"TuesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"TuesdayUpdateWithoutDaysesDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"TuesdayUpsertWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WednesdayUpdateWithoutDaysesDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"WednesdayUpsertWithoutDaysesInput","fields":[{"name":"update","inputType":[{"type":"WednesdayUpdateWithoutDaysesDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"WednesdayCreateWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WednesdayUpdateOneRequiredWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"WednesdayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"WednesdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"WednesdayUpdateWithoutDaysesDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"WednesdayUpsertWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"ThursdayUpdateWithoutDaysesDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"ThursdayUpsertWithoutDaysesInput","fields":[{"name":"update","inputType":[{"type":"ThursdayUpdateWithoutDaysesDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"ThursdayCreateWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"ThursdayUpdateOneRequiredWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"ThursdayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"ThursdayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"ThursdayUpdateWithoutDaysesDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"ThursdayUpsertWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"FridayUpdateWithoutDaysesDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"FridayUpsertWithoutDaysesInput","fields":[{"name":"update","inputType":[{"type":"FridayUpdateWithoutDaysesDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"FridayCreateWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"FridayUpdateOneRequiredWithoutDaysesInput","fields":[{"name":"create","inputType":[{"type":"FridayCreateWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"FridayWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"FridayUpdateWithoutDaysesDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"FridayUpsertWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithoutWeeksDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpsertWithoutWeeksInput","fields":[{"name":"update","inputType":[{"type":"DaysUpdateWithoutWeeksDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateWithoutWeeksInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpdateOneRequiredWithoutWeeksInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateWithoutWeeksDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"DaysUpsertWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateWithoutBookingsDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"days","inputType":[{"type":"DaysUpdateOneRequiredWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateWithWhereUniqueWithoutBookingsInput","fields":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"WeekUpdateWithoutBookingsDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WeekScalarWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"anchor","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"},{"type":"StringFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"AND","inputType":[{"type":"WeekScalarWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"WeekScalarWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"WeekScalarWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"WeekUpdateManyDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateManyWithWhereNestedInput","fields":[{"name":"where","inputType":[{"type":"WeekScalarWhereInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"WeekUpdateManyDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WeekUpsertWithWhereUniqueWithoutBookingsInput","fields":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"WeekUpdateWithoutBookingsDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"WeekCreateWithoutBookingsInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WeekUpdateManyWithoutBookingsInput","fields":[{"name":"create","inputType":[{"type":"WeekCreateWithoutBookingsInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"WeekUpdateWithWhereUniqueWithoutBookingsInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"WeekUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"WeekScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"WeekUpsertWithWhereUniqueWithoutBookingsInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"BookingsUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutBookingsInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"BookingsUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"BookingsCreateWithoutWeeksInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"BookingsCreateOneWithoutWeeksInput","fields":[{"name":"create","inputType":[{"type":"BookingsCreateWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekCreateInput","fields":[{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":true,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"days","inputType":[{"type":"DaysCreateOneWithoutWeeksInput","kind":"object","isRequired":true,"isList":false}]},{"name":"bookings","inputType":[{"type":"BookingsCreateOneWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"BookingsUpdateWithoutWeeksDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"BookingsUpsertWithoutWeeksInput","fields":[{"name":"update","inputType":[{"type":"BookingsUpdateWithoutWeeksDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"BookingsCreateWithoutWeeksInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"BookingsUpdateOneWithoutWeeksInput","fields":[{"name":"create","inputType":[{"type":"BookingsCreateWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]},{"name":"connect","inputType":[{"type":"BookingsWhereUniqueInput","kind":"object","isRequired":false,"isList":false}]},{"name":"disconnect","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"delete","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"update","inputType":[{"type":"BookingsUpdateWithoutWeeksDataInput","kind":"object","isRequired":false,"isList":false}]},{"name":"upsert","inputType":[{"type":"BookingsUpsertWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"days","inputType":[{"type":"DaysUpdateOneRequiredWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]},{"name":"bookings","inputType":[{"type":"BookingsUpdateOneWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"WeekCreateWithoutDaysInput","fields":[{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":true,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"bookings","inputType":[{"type":"BookingsCreateOneWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekCreateManyWithoutDaysInput","fields":[{"name":"create","inputType":[{"type":"WeekCreateWithoutDaysInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"DaysCreateInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateWithoutDaysDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"anchor","inputType":[{"type":"String","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"bookings","inputType":[{"type":"BookingsUpdateOneWithoutWeeksInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WeekUpdateWithWhereUniqueWithoutDaysInput","fields":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"WeekUpdateWithoutDaysDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WeekUpsertWithWhereUniqueWithoutDaysInput","fields":[{"name":"where","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"WeekUpdateWithoutDaysDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"WeekCreateWithoutDaysInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"WeekUpdateManyWithoutDaysInput","fields":[{"name":"create","inputType":[{"type":"WeekCreateWithoutDaysInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"WeekWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"WeekUpdateWithWhereUniqueWithoutDaysInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"WeekUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"WeekScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"WeekUpsertWithWhereUniqueWithoutDaysInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"DaysUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"DaysCreateWithoutMondayInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysCreateManyWithoutMondayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutMondayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"MondayCreateInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysCreateManyWithoutMondayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithoutMondayDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithWhereUniqueWithoutMondayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"DaysUpdateWithoutMondayDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysScalarWhereInput","fields":[{"name":"id","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"type":"IntFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"type":"DateTimeFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false},{"name":"weeks","inputType":[{"type":"WeekFilter","isList":false,"isRequired":false,"kind":"object"}],"isRelationFilter":false,"nullEqualsUndefined":true},{"name":"AND","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"OR","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true},{"name":"NOT","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}],"isRelationFilter":true}],"isWhereType":true,"atLeastOne":false},{"name":"DaysUpdateManyDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateManyWithWhereNestedInput","fields":[{"name":"where","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"DaysUpdateManyDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpsertWithWhereUniqueWithoutMondayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateWithoutMondayDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateWithoutMondayInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpdateManyWithoutMondayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutMondayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"DaysUpdateWithWhereUniqueWithoutMondayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"DaysUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"DaysUpsertWithWhereUniqueWithoutMondayInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"MondayUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysUpdateManyWithoutMondayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"MondayUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"DaysCreateWithoutTuesdayInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysCreateManyWithoutTuesdayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutTuesdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"TuesdayCreateInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysCreateManyWithoutTuesdayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithoutTuesdayDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithWhereUniqueWithoutTuesdayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"DaysUpdateWithoutTuesdayDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpsertWithWhereUniqueWithoutTuesdayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateWithoutTuesdayDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateWithoutTuesdayInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpdateManyWithoutTuesdayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutTuesdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"DaysUpdateWithWhereUniqueWithoutTuesdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"DaysUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"DaysUpsertWithWhereUniqueWithoutTuesdayInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"TuesdayUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysUpdateManyWithoutTuesdayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"TuesdayUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"DaysCreateWithoutWednesdayInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysCreateManyWithoutWednesdayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutWednesdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"WednesdayCreateInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysCreateManyWithoutWednesdayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithoutWednesdayDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithWhereUniqueWithoutWednesdayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"DaysUpdateWithoutWednesdayDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpsertWithWhereUniqueWithoutWednesdayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateWithoutWednesdayDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateWithoutWednesdayInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpdateManyWithoutWednesdayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutWednesdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"DaysUpdateWithWhereUniqueWithoutWednesdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"DaysUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"DaysUpsertWithWhereUniqueWithoutWednesdayInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"WednesdayUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysUpdateManyWithoutWednesdayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"WednesdayUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"DaysCreateWithoutThursdayInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysCreateManyWithoutThursdayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutThursdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"ThursdayCreateInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysCreateManyWithoutThursdayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithoutThursdayDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"friday","inputType":[{"type":"FridayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithWhereUniqueWithoutThursdayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"DaysUpdateWithoutThursdayDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpsertWithWhereUniqueWithoutThursdayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateWithoutThursdayDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateWithoutThursdayInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpdateManyWithoutThursdayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutThursdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"DaysUpdateWithWhereUniqueWithoutThursdayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"DaysUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"DaysUpsertWithWhereUniqueWithoutThursdayInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"ThursdayUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysUpdateManyWithoutThursdayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"ThursdayUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"DaysCreateWithoutFridayInput","fields":[{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayCreateOneWithoutDaysesInput","kind":"object","isRequired":true,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekCreateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysCreateManyWithoutFridayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutFridayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"FridayCreateInput","fields":[{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysCreateManyWithoutFridayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithoutFridayDataInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"monday","inputType":[{"type":"MondayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"tuesday","inputType":[{"type":"TuesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"wednesday","inputType":[{"type":"WednesdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"thursday","inputType":[{"type":"ThursdayUpdateOneRequiredWithoutDaysesInput","kind":"object","isRequired":false,"isList":false}]},{"name":"weeks","inputType":[{"type":"WeekUpdateManyWithoutDaysInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"DaysUpdateWithWhereUniqueWithoutFridayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"data","inputType":[{"type":"DaysUpdateWithoutFridayDataInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpsertWithWhereUniqueWithoutFridayInput","fields":[{"name":"where","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":true,"isList":false}]},{"name":"update","inputType":[{"type":"DaysUpdateWithoutFridayDataInput","kind":"object","isRequired":true,"isList":false}]},{"name":"create","inputType":[{"type":"DaysCreateWithoutFridayInput","kind":"object","isRequired":true,"isList":false}]}]},{"name":"DaysUpdateManyWithoutFridayInput","fields":[{"name":"create","inputType":[{"type":"DaysCreateWithoutFridayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"connect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"set","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"disconnect","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"delete","inputType":[{"type":"DaysWhereUniqueInput","kind":"object","isRequired":false,"isList":true}]},{"name":"update","inputType":[{"type":"DaysUpdateWithWhereUniqueWithoutFridayInput","kind":"object","isRequired":false,"isList":true}]},{"name":"updateMany","inputType":[{"type":"DaysUpdateManyWithWhereNestedInput","kind":"object","isRequired":false,"isList":true}]},{"name":"deleteMany","inputType":[{"type":"DaysScalarWhereInput","kind":"object","isRequired":false,"isList":true}]},{"name":"upsert","inputType":[{"type":"DaysUpsertWithWhereUniqueWithoutFridayInput","kind":"object","isRequired":false,"isList":true}]}]},{"name":"FridayUpdateInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"dayses","inputType":[{"type":"DaysUpdateManyWithoutFridayInput","kind":"object","isRequired":false,"isList":false}]}]},{"name":"FridayUpdateManyMutationInput","fields":[{"name":"id","inputType":[{"type":"Int","kind":"scalar","isRequired":false,"isList":false}]},{"name":"eighttoten","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"tentotwelve","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twelvetotwo","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"twotofour","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"fourtosix","inputType":[{"type":"Boolean","kind":"scalar","isRequired":false,"isList":false}]},{"name":"createdAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]},{"name":"updatedAt","inputType":[{"type":"DateTime","kind":"scalar","isRequired":false,"isList":false}]}]},{"name":"IntFilter","fields":[{"name":"equals","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"}]},{"name":"not","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"},{"isList":false,"isRequired":false,"kind":"scalar","type":"IntFilter"}]},{"name":"in","isRelationFilter":false,"inputType":[{"isList":true,"isRequired":false,"kind":"scalar","type":"Int"}]},{"name":"notIn","isRelationFilter":false,"inputType":[{"isList":true,"isRequired":false,"kind":"scalar","type":"Int"}]},{"name":"lt","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"}]},{"name":"lte","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"}]},{"name":"gt","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"}]},{"name":"gte","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Int"}]}],"atLeastOne":false},{"name":"BooleanFilter","fields":[{"name":"equals","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"}]},{"name":"not","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"Boolean"},{"isList":false,"isRequired":false,"kind":"scalar","type":"BooleanFilter"}]}],"atLeastOne":false},{"name":"DateTimeFilter","fields":[{"name":"equals","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"}]},{"name":"not","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"},{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTimeFilter"}]},{"name":"in","isRelationFilter":false,"inputType":[{"isList":true,"isRequired":false,"kind":"scalar","type":"DateTime"}]},{"name":"notIn","isRelationFilter":false,"inputType":[{"isList":true,"isRequired":false,"kind":"scalar","type":"DateTime"}]},{"name":"lt","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"}]},{"name":"lte","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"}]},{"name":"gt","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"}]},{"name":"gte","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"DateTime"}]}],"atLeastOne":false},{"name":"DaysFilter","fields":[{"name":"every","isRelationFilter":true,"inputType":[{"isList":false,"isRequired":false,"kind":"object","type":"DaysWhereInput"}]},{"name":"some","isRelationFilter":true,"inputType":[{"isList":false,"isRequired":false,"kind":"object","type":"DaysWhereInput"}]},{"name":"none","isRelationFilter":true,"inputType":[{"isList":false,"isRequired":false,"kind":"object","type":"DaysWhereInput"}]}],"atLeastOne":false},{"name":"WeekFilter","fields":[{"name":"every","isRelationFilter":true,"inputType":[{"isList":false,"isRequired":false,"kind":"object","type":"WeekWhereInput"}]},{"name":"some","isRelationFilter":true,"inputType":[{"isList":false,"isRequired":false,"kind":"object","type":"WeekWhereInput"}]},{"name":"none","isRelationFilter":true,"inputType":[{"isList":false,"isRequired":false,"kind":"object","type":"WeekWhereInput"}]}],"atLeastOne":false},{"name":"StringFilter","fields":[{"name":"equals","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"not","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"},{"isList":false,"isRequired":false,"kind":"scalar","type":"StringFilter"}]},{"name":"in","isRelationFilter":false,"inputType":[{"isList":true,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"notIn","isRelationFilter":false,"inputType":[{"isList":true,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"lt","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"lte","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"gt","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"gte","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"contains","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"startsWith","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]},{"name":"endsWith","isRelationFilter":false,"inputType":[{"isList":false,"isRequired":false,"kind":"scalar","type":"String"}]}],"atLeastOne":false},{"name":"BookingsOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"WeekOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"anchor","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"DaysOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"MondayOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"TuesdayOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"WednesdayOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"ThursdayOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]},{"name":"FridayOrderByInput","atLeastOne":true,"atMostOne":true,"isOrderType":true,"fields":[{"name":"id","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"eighttoten","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"tentotwelve","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twelvetotwo","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"twotofour","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"fourtosix","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"createdAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false},{"name":"updatedAt","inputType":[{"type":"OrderByArg","isList":false,"isRequired":false,"kind":"enum"}],"isRelationFilter":false}]}]}}'

// We are parsing 2 times, as we want independent objects, because
// DMMFClass introduces circular references in the dmmf object
const dmmf = JSON.parse(dmmfString)
exports.dmmf = JSON.parse(dmmfString)
    