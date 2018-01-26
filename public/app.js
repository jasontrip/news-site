'use strict';

const state = {
	departments: []
};

function generateTwitterTimeline(username) {
	return `
		<a class="twitter-timeline"
		  href="https://twitter.com/${username}"
		  data-width="200"
		  data-height="250"
		  data-chrome="nofooter noheader noborder" >
		  Tweets by @${username}
		</a>`;

}
function generateNewsItems(newsResults, pageNumber) {

	return `
		<div class="news-results-header">
        	${newsResults.totalResults} results
     	</div>` +
     	`
     	<div class="articles">
     		${newsResults.articles.slice(pageNumber - 1, pageNumber + 4).map( article => {
     			return `<div class="article">
     						<div class="image-container">
     							<img src="${article.urlToImage ? article.urlToImage : 'https://vignette.wikia.nocookie.net/citrus/images/6/60/No_Image_Available.png/revision/latest?cb=20170129011325'}" />
     						</div>

     						<div class="title-container">
	     						<a class="title" href="${article.url}">
	     							${article.title} - ${article.source.name}
	     						</a><br />
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

function generateDepartmentString(departments) {
	return departments.map( (department, index) => {
		return `
		<div class="department">
				
				<div class="department-header">
					<img class="department-seal" src="${department.seal}" />
					<div class="department-name">${department.name}</div>
				</div>

				<div class="department-news">
					<div class="department-news-container">${generateNewsItems(department.newsResults, department.newsPageNumber)}</div>
					<div class="department-tweets-container">
						${generateTwitterTimeline(department.twitterUsername)}
					</div>
				</div>

			</div>
		</div>`
	})
	.concat(`<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`);
}

function generateSentencesString(sentences) {
	return sentences.map( sentence => {
		return `
			<li class="summary-sentence">${sentence}</li>
		`
	}).join('');
}
function generateSummaryString(summary, urlToImage) {
	return `
		<img src="${urlToImage}" class="summary-img" />
		<div class="summary-sentences">
			<ul>${generateSentencesString(summary.sentences)}</ul>
		</div>
	`
}
function renderSummary(summary, urlToImage) {
	console.log(summary.sentences);

	$('.summary').html(generateSummaryString(summary, urlToImage));
	$('.summary-window').show();
	
}

function summarizeArticle(url, urlToImage) {
	console.log('urlToImage' + urlToImage);

	const req = new Request(`/summarize/?url=${url}`);

	return fetch(req)
	    .then(function(response) {
	    	console.log(response);
	    	if (response.status === 400) {
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
    // summarizeArticle('https://www.wired.com/story/free-money-the-surprising-effects-of-a-basic-income-supplied-by-government/')
    // 	.then(function(summary) {
    // 		console.log(summary);
    // 	});

}

// is this a JQuery function?
$(handleEvents());