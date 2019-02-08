import test from 'ava';
import log from 'ololog';
import { Database } from 'arangojs';
import Storage from '../index';

const TEST_DB = 'test-umzug';
const TEST_COLLECTION = 'test-umzug-arangodb';

const OPTIONS = {
  database: TEST_DB,
  collectionName: TEST_COLLECTION
};

if (process.env.TEST_ARANGO_URL != null) {
  OPTIONS.url = process.env.TEST_ARANGO_URL;
}

test.before('Initialize test database', t => {
  const mgr = new Database(OPTIONS);
  const tgt = new Database(OPTIONS);
  tgt.useDatabase(TEST_DB);

  return tgt.exists()
    .then((exists) => exists
      ? null
      : mgr.createDatabase(TEST_DB, [{ username: "root" }])
    )
    .then((info) => {
      const db = new Database(OPTIONS);
      db.useDatabase(TEST_DB);

      const collection = db.collection(TEST_COLLECTION);

      return collection.exists()
        .then((exists) => exists
          ? collection.truncate()
          : collection.create({ waitForSync: true })
        )
        .then(() => {
          t.context.db = db;
          t.context.collection = collection;

          return t;
        });
    });
});

test("Set bearerToken", t => {
  const storage = new Storage({ bearerToken: 'my-auth-token' });
  t.is('Bearer my-auth-token', storage.db._connection._headers.authorization);
});

test("logMigration", t => {
  const storage = new Storage(OPTIONS);
  t.plan(1);

  return storage.logMigration("1-logMigration")
    .then(() => storage.executed())
    .then(arr => arr.includes("1-logMigration"))
    .then(t.true);
});

test("unlogMigration", t => {
  const storage = new Storage(OPTIONS);
  t.plan(2);

  return storage.logMigration("2-unlogMigration")
    .then(() => storage.executed())
    .then(arr => arr.includes("2-unlogMigration"))
    .then(t.true)
    .then(() => storage.unlogMigration("2-unlogMigration"))
    .then(() => storage.executed())
    .then(arr => arr.includes("2-unlogMigration"))
    .then(t.false);
});

test("executed", t => {
  const storage = new Storage(OPTIONS);
  t.plan(3);

  return storage.logMigration("3-executed")
    .then(() => storage.logMigration("4-executed"))
    .then(() => storage.logMigration("5-executed"))
    .then(() => storage.executed())
    .then(arr => {
      t.true(arr.includes("3-executed"));
      t.true(arr.includes("4-executed"));
      t.true(arr.includes("5-executed"));
    });
});
