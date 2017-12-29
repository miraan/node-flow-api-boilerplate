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
one already exists with an associated Facebook User ID.

Once this log in process completes, the server generates a random hex string,
stores it in Redis with the User ID, and returns it as a token to the client to
use on future requests.

Future client requests can be authenticated if the client passes this token in the
`Authorization` header, e.g.

`Authorization: Bearer xxxxx`

Stack used: Node.JS, Express, Flow, Babel + ES Preset, Gulp,
Passport (Bearer Token Strategy), Facebook Node SDK (fb), Redis

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
