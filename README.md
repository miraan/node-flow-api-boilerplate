# node-flow-crud-api-passport-fb-bearer-token-authentication

This branch contains a Node.JS Express Server with Flow type-checking
exposing a RESTful API with CRUD examples and user authentication.

The CRUD examples are of Users and Produce.

User authentication is via the Facebook Graph API and Passport.

Log in is via `GET /api/v1/login/facebook?facebookAccessToken=xxx`

The client is responsible for getting a `facebookAccessToken` using a Facebook
Client SDK.

The server extends this token to a long lived token, gets the associated Facebook
profile and creates a User object with this data or updates the User object if
one already exists with the retrieved Facebook profile user ID.

Once this login process completes, the server generates a random hex string,
stores it in Redis with the User ID, and returns it as a token to the client to
use on future requests.

Future client requests can be authenticated if the client passes this token in the
`Authorization` header, e.g.

`Authorization: Bearer xxxxx`

Each user has an associated `level` which governs their permissions to perform
certain actions.

Level 1 users can only view and change their own records.

Level 2 users can view all records, but only change records of level 1 users.

Level 3 users can view and change all records.

Stack used: Node.JS, Express, Flow, Babel + ES Preset, Gulp,
Passport (Bearer Token Strategy), Facebook Node SDK (fb), Redis

## All routes

`GET /api/v1/login/facebook?facebookAccessToken=xxxxx`: Authenticates and returns a token.

`GET /api/v1/user/me`: Returns own profile.

`GET /api/v1/user/`: Returns all users.

`GET /api/v1/user/xxx`: Returns user with ID `xxx`

`POST /api/v1/user/`: Creates a user with JSON data in request body. All user fields
must be present.

`PUT /api/v1/user/xxx`: Updates user with ID `xxx` with JSON data in request body

`DELETE /api/v1/user/xxx`: Deletes a user with ID `xxx`

## Prerequisites

1. `npm install -g gulp-cli`
2. `npm install -g flow-typed`

## Usage

Clone the repository

1. `npm install`
2. `flow-typed install`
3. `gulp` to watch files and automatically rebuild / flow type check
4. `npm start` to start the server
5. Develop and remember to run `flow-typed install` after adding a new
dependency with `npm install --save xxx`
