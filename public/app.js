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
        		${department.newsResults.totalResults !== 0 ? department.newsPageNumber * 5 - 4 : 0 } -
        		${department.newsPageNumber * 5 > department.newsResults.totalResults
        			? department.newsResults.totalResults : department.newsPageNumber * 5}
        		of ${department.newsResults.totalResults < 100 ? department.newsResults.totalResults : 100}
        	</div>
        	<button class="next-page"
        		data-department-index=${index}
        		${department.newsPageNumber * 5 >= department.newsResults.totalResults ||
        			department.newsPageNumber * 5 >= 100 ? 'disabled' : ''}>
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
     							<img 
     								src="${article.urlToImage ? article.urlToImage : IMG_ERROR_URL}"
     								onerror="imgError(this);" 
     								alt="${article.title}"
     							/>
     						</div>

     						<div class="title-container">
	     						<a class="title" target="_blank" href="${article.url}">${article.title}</a>
	     						<br />
	     						<span class="news-source">
	     							${article.source.name} | ${article.publishedAt}
	     						</span>
	     						<br />
	     						<button class="get-sentiment"
	     								data-url="${article.url}">
	     							Sentiment
	     						</buton>
	     						<button class="summarize"
	     								data-url="${article.url}"
	     								data-title="${article.title}"
	     								data-urltoimage="${article.urlToImage ? article.urlToImage : 'none'}">
	     							Summary
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

function generateNavItemString(department, index) {
	return `
		<li>
			<img
				class="nav-department-seal"
				src="${department.seal}"
				alt="${department.name}" />
			<div class="nav-department-name">
				<a href="#${index}" onclick="hamburgerClick(document.getElementById('hamburger'))">
					${department.name}
				</a>
			</div>
		</li>
	`;
}
function hamburgerClick(button) {
	$(button).toggleClass("change");

    const navList = $("#nav-list");
    
    navList.css('display') === 'none'
    	? navList.css('display', 'block')
    	: navList.css('display', 'none');
}

function generateNavString(departments) {
	return `
		<nav role="nav">
			<div class="hamburger" id="hamburger" onclick="hamburgerClick(this)">
				<div class="bar1"></div>
				<div class="bar2"></div>
				<div class="bar3"></div>
			</div>
			<header>United States Cabinet News</header>
			<div class="nav-list" id="nav-list">
				<ul>
					${ departments.map( (department, index) => { return generateNavItemString(department, index) }).join('') }
				</ul>
			</div>
		</nav>
	`;
}

function generateDepartmentString(departments) {

	return generateNavString(departments) + departments.map( (department, index) => {
		return `
		<section class="department" id="${index}">
				
				<div class="department-header">
					<div class="department-title">
						<img class="department-seal" src="${department.seal}" alt="${department.name}"/>
						<div class="department-name">
							<a href="${department.website}" target="_blank">${department.name}</a>
						</div>
					</div>
				</div>

				<section class="department-news">
					<div class="department-news-container">
						${generateNewsString(department, index)}
					</div>
					<div class="department-tweets-container">
						${generateTwitterTimelineString(department.twitterUsername)}
					</div>
				</section>

			</div>
		</section>`
	})
	.concat(`<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`);
}

function generateSummaryString(summary, urlToImage, title) {
	return `
		<img
			src="${urlToImage}"
			alt="${title}"
			onerror="imgError(this);"
			class="summary-img" />
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
function renderSummary(summary, urlToImage, title) {
	$('.summary').html(generateSummaryString(summary, urlToImage, title));
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
			    })
			    .catch(function(error) {
			    	console.log('error: ' , error);
			    });
}

function summarizeArticle(url, urlToImage, title) {

	const req = new Request(`/summarize/?url=${url}`);

	return fetch(req)
			    .then(function(response) {
			    	if (response.status === 400) {
			    		console.log('error occurred');
			    		throw new Error(response.statusText);
			    	}
			        return response.json();
			    })
			    .then(function(summary) {
			    	renderSummary(summary, urlToImage, title);
			    })
			    .catch(function(error) {
			    	console.log('error: ' , error);
			    });
}

function handleSummaryClick() {

	$('main').on('click', '.summarize', function(event) {
		const {url, title, urltoimage} = $(this).data();
		$('.summary-title').html(`<a target="_blank" href="${url}">${title}</a>`);
		$('.summary').html('summarizing...');
		$('.summary-window').show();

		summarizeArticle(url, urltoimage, title);
	});
}

function handleCloseSummaryClick() {
	$('.summary-window').on('click', '.close-summary', function(event) {
		$('.summary-window').hide();
	});
}
function handleCloseIntroClick() {
	$('.app-intro').on('click', '.close-intro', function(event) {
		$('.app-intro').hide();
		$('main').show();
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
		$(this).html('<div class="emoji-text">processing...</div>');
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
	         renderDepartments(state);
	    });
}

function handleEvents() {

    getDepartments(state);
    handleCloseIntroClick();
    handleSummaryClick();
    handleCloseSummaryClick();
    handleNextPageClick();
    handlePreviousPageClick();
    handleGetSentimentClick();

}

$(handleEvents());