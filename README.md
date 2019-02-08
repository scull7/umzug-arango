# umzug-arango

ArangoDB custom storage backend for umzug

## Usage

```javascript
const umzug = new Umzug({
  storage: '@buckeye/umzug-arango',
  storageOptions: {
    // Set your storage options here.
  },
});
```

## Configuration

The following items can be passed to the storage options object.

* `url` <string> - Base URL of the ArangoDB server or list of server URLs.
* `isAbsolute` <boolean> - If this option is explicityly set to `true`, the 
        `url` will be treated as the abolute database path and arangojs will
        not append the database path to it.
* `arangoVersion` <int> -> Numeric representation of the ArangoDB version
        the driver should expect.
* `agent` <https.Agent> - An http Agent instance to use for connections.
* `loadBalancingStrategy` <string> - Determines the behavior when multiple
        URLs are provided.
* `maxRetries` <int> - Determines the behavior when a request fails because
        the underlying connection to the server could not be opened.
* `username` <string> - Database username to use for the connection.
* `password` <string> - Database password to use for the connection.
* `bearerToken` <string> - Authorization token header value to send to the
        the database for authentication.  If this is set, then `username` and
        `password` will be ignored.

* `database` <string> - Name of the database we wish to connect to.
* `collectionName` <string> -> Name of the collection where we want to
        store the migration history.

### Defaults

The following JavaScript object contains all the default settings:
```javascript
{
  url: 'http://localhost:8529',
  isAbsolute: false,
  arangoVersion: 30000,
  agent: null,
  loadBalancingStrategy: "NONE",
  maxRetries: 0,
  username: "root",
  password: "",
  database: "umzug",
  bearerToken: null,
  collectionName: "umzug_migrations"
}
```
