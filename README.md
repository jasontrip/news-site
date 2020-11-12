Cabinet News Site
-----------------
Thanks for checking out my repo. Live app view is no longer supported...I built this in 2018 and I stopped paying to keep it up.

## Summary
This app enables the user to see news articles for all of the departments in the United States executive branch. In order to see the cabinet news at a quick glance, the user can retrieve the sentiment and a summary of the article without actually going to the news article. This app also places the departments twitter timeline alongside the news articles so the user can see the opinions of the department in their own words.

## Technology
Javascript, HTML, CSS, jQuery, Node and Express.

## API
/departments
	- GET - retrieve an array of departments in the United States Cabinet along with the most recent news (from NewsAPI.org)

/sentiment
	- GET - send the url of a news article, and receive the sentiment. Uses Alyien Natural Language Processing.

/summary
	- GET - send the url of a news article, and receive a 5 sentence summary. Uses Alyien Natural Language Processing.

## Screenshot
<img src="app_screen_shot.png" width="400px" alt="alt Cabinet News Screenshot" />
