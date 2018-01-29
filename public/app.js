'use strict';
const IMG_ERROR_URL = '/img/img_not_available.png';
const state = {
	departments: []
};

function imgError(image) {
    image.onerror = "";
    image.src = IMG_ERROR_URL;
    return true;
}

function generateTwitterTimelineString(username) {
	return `
		<a class="twitter-timeline"
		  href="https://twitter.com/${username}"
		  data-width="250"
		  data-height="350"
		  data-chrome="nofooter noheader" >
		  Tweets by @${username}
		</a>`;

}
function generateNewsHeaderString(department, index) {
	return `
		<div class="news-results-header">
			<button class="previous-page"
        		data-department-index=${index}
        		${department.newsPageNumber === 1 ? 'disabled' : ''}>
        				<
        	</button>
        	<div class="result-count">
        		${department.newsPageNumber * 5 - 4} -
        		${department.newsPageNumber * 5 > department.newsResults.totalResults
        			? department.newsResults.totalResults : department.newsPageNumber * 5}
        		of ${department.newsResults.totalResults}
        	</div>
        	<button class="next-page"
        		data-department-index=${index}
        		${department.newsPageNumber * 5 >= department.newsResults.totalResults ? 'disabled' : ''}>
        		>
        	</button>
     	</div>
     `;
}
function generateNewsItems(newsResults, pageNumber) {

	return `
     	<div class="articles">
     		${newsResults.articles.slice(pageNumber * 5 - 5, pageNumber * 5).map( article => {
     			return `<div class="article">
     						<div class="image-container">
     							<img src="${article.urlToImage ? article.urlToImage : IMG_ERROR_URL}" onerror="imgError(this);" />
     						</div>

     						<div class="title-container">
	     						<a class="title" href="${article.url}" onErr>${article.title}</a>
	     						<span class="news-source"> - ${article.source.name}</span>
	     						<br />
	     						<button class="get-sentiment"
	     								data-url="${article.url}">
	     							Sentiment
	     						</buton>
	     						<button class="summarize"
	     								data-url="${article.url}"
	     								data-title="${article.title}"
	     								data-urltoimage="${article.urlToImage ? article.urlToImage : 'none'}">
	     							Summarize
	     						</button>
	     					</div>
     					</div>
     			`
     		}).join('')}
     	</div>
     	`;
}
function generateNewsString(department, index) {
	return generateNewsHeaderString(department, index) +
		   generateNewsItems(department.newsResults, department.newsPageNumber);
}

function generateDepartmentString(departments) {
	return departments.map( (department, index) => {
		return `
		<div class="department" id="${index}">
				
				<div class="department-header">
					<div class="department-title">
						<img class="department-seal" src="${department.seal}" />
						<div class="department-name">${department.name}</div>
					</div>
				</div>

				<div class="department-news">
					<div class="department-news-container">
						${generateNewsString(department, index)}
					</div>
					<div class="department-tweets-container">
						${generateTwitterTimelineString(department.twitterUsername)}
					</div>
				</div>

			</div>
		</div>`
	})
	.concat(`<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`);
}

function generateSummaryString(summary, urlToImage) {
	return `
		<img src="${urlToImage}" onerror="imgError(this);" class="summary-img" />
		<div class="summary-sentences">
			<ul>${summary.sentences
					.map( sentence => {
					return `<li class="summary-sentence">${sentence}</li>`
					})
					.join('')
				}
			</ul>
		</div>
	`
}
function renderSummary(summary, urlToImage) {
	console.log(summary.sentences);

	$('.summary').html(generateSummaryString(summary, urlToImage));
	$('.summary-window').show();
	
}

function getArticleSentiment(url, button) {

	const req = new Request(`/sentiment/?url=${url}`);

	return fetch(req)
			    .then(function(response) {
			    	if (response.status === 400) {
			    		console.log('error occurred');
			    		throw new Error(response.statusText);
			    	}
			        return response.json();
			    })
			    .then(function(sentiment) {
			    	let sentimentEmoji = '';
			    	switch (sentiment.polarity) {
			    		case 'positive':
			    			sentimentEmoji = '/img/positive_emoji.png';
			    			break;
			    		case 'neutral': 
			    			sentimentEmoji = '/img/neutral_emoji.png';
			    			break;
			    		case 'negative':
			    			sentimentEmoji = '/img/negative_emoji.png';
			    			break;
			    	}

			    	$(button).html(`
						<img class="emoji"
				 		src="${sentimentEmoji}" />
						<div class="emoji-text">${sentiment.polarity}</div>
					`);
					$(button).disabled = true;
					// $(button).css({
					// 	padding: 0,
					// 	background: 'white',
					// 	color: 'black',
					// 	visibility: 'visible'
					// });
			    })
			    .catch(function(error) {
			    	console.log('error: ' , error);
			    });
}

function summarizeArticle(url, urlToImage) {

	const req = new Request(`/summarize/?url=${url}`);

	console.log('summarizing article');
	return fetch(req)
			    .then(function(response) {
			    	if (response.status === 400) {
			    		console.log('error occurred');
			    		throw new Error(response.statusText);
			    	}
			        return response.json();
			    })
			    .then(function(summary) {
			    	renderSummary(summary, urlToImage);
			    })
			    .catch(function(error) {
			    	console.log('error: ' , error);
			    });
}

function handleSummaryClick() {
	$('main').on('click', '.summarize', function(event) {
		console.log('summarize: ' + $(this).data('url'))
		$('.summary-title').html(`<a target="_blank" href="${$(this).data('url')}">${$(this).data('title')}</a>`);
		$('.summary').html('summarizing...');
		$('.summary-window').show();

		summarizeArticle($(this).data('url'), $(this).data('urltoimage'));
	});
}

function handleCloseSummaryClick() {
	$('.summary-window').on('click', '.close-summary', function(event) {
		$('.summary-window').hide();
	});
}

function handleNextPageClick() {
	$('main').on('click', 'button.next-page', function(event) {
		const departmentIndex = $(this).data('department-index');
		state.departments[departmentIndex].newsPageNumber++;

		$('.department#' + departmentIndex + ' .department-news-container')
			.html(generateNewsString(state.departments[departmentIndex], departmentIndex));

	});

}

function handlePreviousPageClick() {
	$('main').on('click', 'button.previous-page', function(event) {
		const departmentIndex = $(this).data('department-index');
		state.departments[departmentIndex].newsPageNumber--;

		$('.department#' + departmentIndex + ' .department-news-container')
			.html(generateNewsString(state.departments[departmentIndex], departmentIndex));
	});

}
function handleGetSentimentClick() {
	$('main').on('click', '.get-sentiment', function (event) {
		$(this).html('processing...');
		$(this).toggleClass('get-sentiment');
		$(this).toggleClass('got-sentiment');

		getArticleSentiment($(this).data('url'), this);

	})
}

function renderDepartments(state) {
	$('main').html(generateDepartmentString(state.departments));
}

function getDepartments(state) {
 	const req = new Request('/departments');

	fetch(req)
	    .then(function(response) {
	        return response.json();
	    })

	    .then(function(response) {
	         state.departments = response;
	         console.log(state.departments);
	         renderDepartments(state);
	    });
}

function handleEvents() {

    getDepartments(state);
    handleSummaryClick();
    handleCloseSummaryClick();
    handleNextPageClick();
    handlePreviousPageClick();
    handleGetSentimentClick();

}

$(handleEvents());