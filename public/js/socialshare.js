//-----FACEBOOK SDK-----
window.fbAsyncInit = function() {
  FB.init({
    //you will need to create an appId for PlateRate at https://developers.facebook.com/ and replace the appId with it
    appId      : '1555790451406695',
    xfbml      : true,
    version    : 'v2.5'
  });
};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  //you will need to create an app id for PlateRate at https://developers.facebook.com/ and replace the appId with it
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId=1555790451406695";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//-----TWITTER-----
window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };

  return t;
}(document, "script", "twitter-wjs"));

//-----LINKEDIN SDK-----
// Setup an event listener to make an API call once auth is complete
function onLinkedInLoad() {
  IN.Event.on(IN, "auth", shareContent);
}
// Handle the successful return from the API call
function onSuccess(data) {
  console.log(data);
}
// Handle an error response from the API call
function onError(error) {
  console.log(error);
}
// Use the API call wrapper to share content on LinkedIn
function shareContent() {
  // Build the JSON payload containing the content to be shared
  var payload = {
    "comment": "@platerate is a great app to help you find food you love - Find the highest rated menu items - wherever you are!",
    "visibility": {
      "code": "anyone"
    }
  };
  IN.API.Raw("/people/~/shares?format=json")
    .method("POST")
    .body(JSON.stringify(payload))
    .result(onSuccess)
    .error(onError);
}
//------GOOGLE+-----
window.___gcfg = {
      lang: 'en-US',
      parsetags: 'onload'
};
