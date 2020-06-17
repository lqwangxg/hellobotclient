'use strict';

require("dotenv").config();

const request = require('request');
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const URL_BASE = `http://www.omdbapi.com/?apikey=${MOVIE_API_KEY}`;
Promise = require('bluebird');
Promise.promisifyAll(request);

module.exports = async function getMovieDetail(movieTitle){
    const requestParam = {
        url: encodeURI(URL_BASE + "&t="+ movieTitle),
        headers: {"Content-Type": "application/json"},
        json: true
    };

    let response = await request.getAsync(requestParam);
    
    if (response.statusCode != 200){
        return new Error("MovieService.getDetail() failed.");
    }
    return response.body;
}

