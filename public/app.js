'use strict';

const state = {
	departments: []
};

function generateTwitterTimeline(username) {
	return `
		<a class="twitter-timeline"
		  href="https://twitter.com/${username}"
		  data-width="300"
		  data-height="400">
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
     						${article.title}
     					</div>
     			`
     		})}
     	</div>
     	`;
}

function generateDepartmentString(departments) {
	return departments.map( (department, index) => {
		return `
		<div class="department">
			<div class="department-news">
				<div class="department-news-content">
					<div class="department-header">
						<img class="department-seal" src="${department.seal}" />
						<div class="department-name">${department.name}</div>

						<div class="department-administrator">
							<img class="department-administrator-img" src="${department.administrator.imgUrl}" />
							<span class="department-administrator-title">${department.administrator.title}</span>
							<span class="department-administrator-name">${department.administrator.name}</span>
						</div>
					</div>

					<div class="department-news-feed">${generateNewsItems(department.newsResults, department.newsPageNumber)}</div>

				</div>
			</div>

			<div class="department-tweets">${generateTwitterTimeline(department.twitterUsername)}</div>

			<div class="department-administrator-tweets">${generateTwitterTimeline(department.administrator.twitterUsername)}</div>
		</div>`
	})
	.concat(`<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`);
}

function renderDepartments(state) {
 	const req = new Request('/departments');

	fetch(req)
    .then(function(response) {
        return response.json();
    })

    .then(function(response) {
         state.departments = response;
    })

 	.then(function() {
 		console.log(state.departments);
 		$('main').html(generateDepartmentString(state.departments));
	});
}

function handleEvents() {

    renderDepartments(state);

}

// is this a JQuery function?
$(handleEvents());