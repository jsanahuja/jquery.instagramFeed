# jquery.instagramFeed
Instagram Feed without using the instagram API

[Full documentation and examples here](https://www.sowecms.com/demos/jquery.instagramFeed/index.html "documentation")

## Instagram CORS issue is fixed with the last commit. 

The way we do this is using the [live implementation](https://cors-anywhere.herokuapp.com/) of the [cors-anywhere project](https://github.com/Rob--W/cors-anywhere), a nodejs proxy to bypass cors. You can use other proxies or your own implementation using the 'cors_proxy' param. You will find more info in the documentation.