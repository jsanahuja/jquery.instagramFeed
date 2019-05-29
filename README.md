# jquery.instagramFeed
Instagram Feed without using the instagram API

[Full documentation and examples here](https://www.sowecms.com/demos/jquery.instagramFeed/index.html "documentation")

## [May 29, 2019] Working again WITHOUT proxy
Looks like Instagram reverted their CORS Policy change so now we can again GET the data directly. For this we made some changes but left the possibility of using a proxy. You'll find more in the CORS section of the documentation.

## [Feb 15, 2019] Instagram changed their CORS policy.
Instagram disallowed other domains so our Library stopped working. The reason it stopped working is HTTP Requests were made client-side (JS) and browsers, according to their new CORS policy, block them.
The way we solved this is using the [live implementation](https://cors-anywhere.herokuapp.com/) of the [cors-anywhere project](https://github.com/Rob--W/cors-anywhere), a nodejs proxy to bypass cors. You can use other proxies or your own implementation using the 'cors_proxy' param. You will find more info in the documentation.