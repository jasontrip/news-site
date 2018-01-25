'use strict';

const state = {
	departments: []
};

function generateTwitterTimeline(username) {
	return `
		<a class="twitter-timeline"
		  href="https://twitter.com/${username}"
		  data-width="200"
		  data-height="200"
		  data-chrome="nofooter noheader" >
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
	     							${article.title}
	     						</a>
	     						- ${article.source.name}
	     						<button class="summarize">Summarize
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
						<div class="department-tweets">${generateTwitterTimeline(department.twitterUsername)}</div>
					</div>
				</div>

			</div>
		</div>`
	})
	.concat(`<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`);
}

function renderSummary(summary) {
	console.log(summary);
}

function summarizeArticle(url) {
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
	    	renderSummary(summary);
	    })
	    .catch(function(error) {
	    	console.log('error: ' , error);
	    });
}

function handleSummaryClick() {
	$('main').on('click', '.summarize', function(event) {
		console.log('summarize');
		summarizeArticle('not a good url');
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
    // summarizeArticle('https://www.wired.com/story/free-money-the-surprising-effects-of-a-basic-income-supplied-by-government/')
    // 	.then(function(summary) {
    // 		console.log(summary);
    // 	});

}

// is this a JQuery function?
$(handleEvents());