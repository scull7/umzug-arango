const Bluebird = require('bluebird')
const redefine = require('redefine')
const arangojs = require('arangojs')

const defaults = {
  url: 'http://localhost:8529',
  isAbsolute: false,
  arangoVersion: 30000,
  agent: null, // http.Agent
  loadBalancingStrategy: "NONE",
  maxRetries: 0,
  username: "root",
  password: "",
  database: "umzug",
  bearerToken: null, // string
  collectionName: "umzug_migrations"
};

/**
 * @class ArangoDBStorage
 */
module.exports = redefine.Class({
  /**
   * Construct an ArangoDB document collection storage.
   *
   * @param {Object} [options]
   *
   * @param {String} [options.url] - ArangoDB connection URL.
   * @param {bool} [options.isAbsolute]
   * @param {int} [options.arangoVersion]
   * @param {http.Agent} [options.agent]
   * @param {String} [options.loadBalancingStrategy]
   * @param {int} [options.maxRetries]
   * @param {String} [options.username] - defaults to "root"
   * @param {String} [options.password] - defaults to ""
   * @param {String} [options.database] - defaults to "umzug"
   * @param {String} [options.bearerToken] - defaults to <null>, If a
   *   `bbearerToken` is provided `username` and `password ` will be ignored.
   */
  constructor: function makeArangoStorage(options) {
    const config = Object.assign({}, defaults, options);

    const db = new arangojs.Database({
      url: config.url,
      isAbsolute: config.isAbsolute,
      arangoVersion: config.arangoVersion,
      agent: config.agent, // http.Agent
      loadBalancingStrategy: config.loadBalancingStrategy,
      maxRetries: config.maxRetries,
    })

    if (config.bearerToken == null) {
      db.useBasicAuth(config.username, config.password);

    } else {
      db.useBearerAuth(config.bearerToken);
    }

    db.useDatabase(config.database);

    this.db = db;
    this.collection = db.collection(config.collectionName)
  },

  /**
   * Logs migration to be considered as executed.
   *
   * @param {String} migrationName - Name of the migration to be logged.
   * @returns {Promise}
   */
  logMigration: function logMigration(migrationName) {
    const log = {
      '_key': migrationName,
      'run_at': new Date().getTime()
    };
    return this.collection.save(log, { waitForSync: true })
      .then(Bluebird.resolve);
  },

  /**
   * Unlogs a migration to be considered as pending.
   *
   * @param {String} migrationName - Name of the migration to be unlogged.
   * @returns {Promise}
   */
  unlogMigration: function unlogMigration(migrationName) {

    return this.collection.remove(migrationName, { waitForSync: true })
      .then(Bluebird.resolve);
  },

  /**
   * Gets list of executed migrations.
   *
   * @return {Promise.<String[]>}
   */
  executed: function getExecuted() {
    return this.collection.all()
      .then(cursor => cursor.map(x => x._key))
      .then(arr => arr.sort())
      .then(Bluebird.resolve)
  }
});
