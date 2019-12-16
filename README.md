## Cars API

Example API NodeJS Server. Implemented with Express and TypeScript.

Connects and stores data to a MySQL database and provides a REST API for basic CRUD operations (see [API.md](https://github.com/William-Olson/cars-api/blob/master/API.md)).

### Running Locally

**Requirements**

- Docker
- NodeJS (version 8.x.x or later)
- NPM (version 5.x.x or later)
- Make (for running the Makefile)

Simply run the `make` command from your terminal while in the repository's root directory.

```bash
make
```

This will start the database as a Docker container then build and run the API Server locally.
The server should be available at `http://localhost:3000` once started.


