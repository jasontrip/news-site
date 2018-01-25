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
function formatDateForNewsApi(date) {
	let dd = date.getDate();
	let mm = date.getMonth() + 1;
	const yyyy = date.getFullYear();

	if (dd < 10) {
	    dd = '0' + dd;
	} 
	if (mm < 10) {
	    mm = '0' + mm;
	} 
	
	return yyyy + '-' + mm + '-' + dd;
}

function assembleNewsApiUrl(baseUrl, department) {
	console.log(encodeURI(baseUrl +
			'q=' + department.searchTerms.map(term => `"${term}"`).join(' OR ') +
			'from=' + formatDateForNewsApi(new Date()) + '&' +
	        'sortBy=popularity&' +
	        `apiKey=${process.env.NEWS_API_KEY}`));

	return encodeURI(baseUrl +
			'q=' + department.searchTerms.map(term => `"${term}"`).join(' OR ') +
			'from=' + formatDateForNewsApi(new Date()) + '&' +
	        'sortBy=popularity&' +
	        `apiKey=${process.env.NEWS_API_KEY}`);
}

function getNewsItems(departments, promises) {

	// for (let i = 0; i < departments.length; i++) {
	// 	promises.push(
	// 		new Promise((resolve, reject) => {
 // 				request(assembleNewsApiUrl(NEWS_API_URL, departments[i]), function (error, response, body) {
	// 				departments[i].newsResults = JSON.parse(body);
	// 				resolve();
	// 			});
	// 		})
	// 	)
	// }

	for (let i = 0; i < departments.length; i++) {
		newsapi.v2.everything({
			q: departments[i].searchTerms,
			language: 'en'
		})
		.then(function(response) {
			departments[i].newsResults = response;
		})
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

app.get('/summarize', (req, res) => {
	
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

app.listen(8080, err => {
	console.log('app is listening on 8080');
});