'use strict';

require('dotenv').config();
const express = require('express');
const request = require('request');
const AYLIENTextAPI = require('aylien_textapi');
const NewsAPI = require('newsapi');

const app = express();
const textapi = new AYLIENTextAPI({
	application_id: process.env.AYLIEN_APP_ID,
	application_key: process.env.AYLIEN_TEXT_API_KEY
});
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
const NEWS_API_URL = 'https://newsapi.org/v2/everything?';

const DEPARTMENTS = require('./departments');
const utility = require('./utility');

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/departments', (req, res) => {

	for (let i = 0; i < DEPARTMENTS.length; i++) {
		newsapi.v2.everything({
			q: DEPARTMENTS[i].searchTerms.join(" OR "),
			language: 'en',
			from: utility.formatDateForNewsApi(new Date()),
			pageSize: 100
		})
		.then(function(response) {
			DEPARTMENTS[i].newsResults = response;
		})
	}

	res.json(DEPARTMENTS);

});

app.get('/sentiment', (req, res) => {
	const {url} = req.query;
	console.log('getting sentiment for ' + url);

	textapi.sentiment({
		url: url,
		mode: 'document',
		language: 'en'
	}, function(error, response) {
		if (error === null) {
	    	res.send(response);
	  	} else {
	  		console.log('text api error: ' , error );
	  		res.status(400).send(error);
	  	};
	});

})

app.get('/summarize', (req, res) => {
	
	console.log('summarize was called');
	
	const {url} = req.query;
	console.log("summarizing url: " + url);

	textapi.summarize({
		url: url,
		sentences_number: 5
	}, function(error, response) {
		if (error === null) {
	    	res.send(response);
	  	} else {
	  		console.log('text api error: ' , error );
	  		res.status(400).send(error);
	  	};
	});
	
});

app.listen(process.env.PORT || 8080, err => {
	console.log(`app is listening on port ${process.env.PORT || 8080}`);
});