# Tweetmap

## What is this?
Tweetmap is exactly what it sounds like. 
It plots out recent tweets within a 2-mile radius of you on a map. 
Due to search API limitations, only tweets from the past 7 days are considered and only tweets with geolocation information explicitly specified by the user are plotted.

## See it in action
[Live Demo](https://lit-gorge-44309.herokuapp.com)

## Running the code

The app is made primarily using nodejs, express and handlebars (templating engine) - running this shiuld be realtively simple.
Download the files, navigate to the root directory in your command line.
``` npm i --save```
but before we can run 'node server.js',
You will need your own keys for accessing the twitter APIs and the google maps API.
From twitter you will need a consumer key, secret key and a bearer token.

[Get them here](https://developer.twitter.com/en/docs/basics/authentication/overview)

For the google maps key, head on over [here](https://developers.google.com/maps/documentation/javascript/get-api-key)

Once you have the keys, replace the process.env variables in server.js with the appropriate twitter keys. The google maps key can be replaced at line 5, in the src, in maps.hbs which is in the views directory.

You should now be clear to start the app locally by running ```node server.js``` on the command line at the root of the directory.
It will run at http://localhost:3000.

## Working with code
The client side code is in the public and views directory and the server side code is limited to server.js. The client-side code polls the proxy servers set up by express to get the required JSON data. Server.js fetches data from twitter APIs when it receives an appropriate get request.
