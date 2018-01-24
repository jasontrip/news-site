'use strict';

require('dotenv').config();
const express = require('express');
const request = require('request');
const AYLIENTextAPI = require('aylien_textapi');

const app = express();
const textapi = new AYLIENTextAPI({
	application_id: process.env.AYLIEN_APP_ID,
	application_key: process.env.AYLIEN_TEXT_API_KEY
});

const DEPARTMENTS = require('./departments');
const NEWS_API_URL = 'https://newsapi.org/v2/everything?';

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});


function getTwitterTimelines(departments, promises) {

	for (let i=0; i < departments.length; i++) {
		promises.push(
			new Promise((resolve, reject) => {
 				request(assembleNewsApiUrl(NEWS_API_URL, departments[i]), function (error, response, body) {
					departments[i].twitterTimeline = JSON.parse(body).articles;
					resolve();
				});
			})
		)
	}

}

function assembleNewsApiUrl(baseUrl, department) {
	return encodeURI(baseUrl +
			'q=' + department.searchTerms.map(term => `"${term}"`).join(' OR ') +
			'from=2018-01-20&' +
	        'sortBy=popularity&' +
	        `apiKey=${process.env.NEWS_API_KEY}`);
}

function getNewsItems(departments, promises) {

	for (let i=0; i < departments.length; i++) {
		promises.push(
			new Promise((resolve, reject) => {
 				request(assembleNewsApiUrl(NEWS_API_URL, departments[i]), function (error, response, body) {
					departments[i].newsResults = JSON.parse(body);
					resolve();
				});
			})
		)
	}

}
app.get('/departments', (req, res) => {
	const promises = [];
	
	getNewsItems(DEPARTMENTS, promises);
	getTwitterTimelines(DEPARTMENTS, promises);

	Promise.all(promises)
		.then( () => {
			res.json(DEPARTMENTS);
		});

});

function getArticleSummary(url, numberOfSentences) {
	console.log("summarizing url: " + url);

	return new Promise( (resolve, reject) => {
		textapi.summarize({
			url: url,
			sentences_number: numberOfSentences
		}, function(error, response) {
			if (error === null) {
		    	resolve(response);
		  	} else {
		  		console.log('text api error: ' + error);
		  	};
		});

	});

}
app.get('/summarize', (req, res) => {
	const {url} = req.query;
	
	getArticleSummary(url, 5)

	.then(function(response) {
		res.send(response);
	})
	.catch(function() {
		res.send('failed');
	});
	
});

app.listen(8080, err => {
	console.log('app is listening on 8080');
});