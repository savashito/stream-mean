/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// svar login = require('./login,js'); 
var client_id = '6e7afe2d6a28410e9fd2a6d9e74b8fd4'; // Your client id 03ffe0cac0a0401aa6673c3cf6d02ced
var client_secret = '5d8f4e7ca4914646aea8c0144a8a0a6b'; // Your client secret a57c43efb9644574a96d6623fb8bfbc2
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
//
var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.use(logger());
app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

/*
app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  // query the
   var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});
*/
// request access to access shit
app.get('/login', function(req, res) {
    var scopes = 'user-read-private user-read-email playlist-read-private user-library-read';
    res.redirect('https://accounts.spotify.com/authorize' + 
      '?response_type=code' +
      '&client_id=' + client_id +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent('http://localhost:8888/callback'));
});

/*
app.get('/miau', function(req, res) {
  console.log('miauu');
  var options = {
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.get(options, function(error, response, tracks) {
    console.log('tracks are : ');
    console.log (tracks);
  });
})
*/

var getListSong = function(access_token){

  var options = {
    url: 'https://api.spotify.com/v1/me/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.get(options, function(error, response, tracks) {
    console.log('tracks are : ');
    items = tracks.items;
    var preview;
    for (var i = items.length - 1; i >= 0; i--) {
      console.log(items[i])
      track = items[i].track;
      preview = track.preview_url;
      // track.play();
      console.log('Playing: %s - %s',  track.name,track.preview_url);
      preview = track.preview_url;
    };
    try {
      // console.log()
      // response.download(preview);
     /* fs.readFile(preview, function (err, data) {
        // res.end(data);
        console.log(err);
        console.log('data',data);
      });*/
      // preview = 'https://dl-web.dropbox.com/get/Saves/04%2520Juelz%2520Santana%2520Ft%2520Skull%2520Gang-Skull%2520Gang%2520Got%2520Money.mp3?_subject_uid=10785399&w=AAAfL6Nr7TbBGxEZHvnOaZEgThRLUO9HDD0cglCx2sR-hg'
      stream = request(preview);
      stream.pipe(new lame.Decoder).pipe(new Speaker);
      /*
      stream = fs.createReadStream( preview);// './miau.mp3');
      stream.pipe(new lame.Decoder).pipe(new Speaker);
      stream.on('error', function (error) {console.log("Caught", error);});
      */
      // var $stream = fs.createReadStream(preview).pipe(new lame.Decoder).pipe(new Speaker);
    }catch(e){
      console.log('miauu');
      console.log(e)
    }
    // $stream.end();
  });

  /*
  var options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };


  request.get(options, function(error, response, user) {
    console.log('id is : ' +user.id);
    var options = {
      url: 'https://api.spotify.com/v1/users/'+user.id+'/playlists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };
  
    request.get(options,
      function(error, response, list) {
        console.log(error);
        console.log(list);
        }
    );
  });

  /*

  options.url = 'https://api.spotify.com/v1/me/tracks';
  request.get(options, function(error, response, tracks) {
    console.log('tracks are : ');
    console.log (tracks);

  })
  */
  

}



app.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    console.log('doing stuff');

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        getListSong(access_token);

        var t = querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        });
        res.redirect('/#' +t);
      }else {
        res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
      }
    });


   // logIn(req,res);
          // query the list songs
          // console.log(user);
    //    });
        // console.log('t is ',t);
  }
});


app.get('/refresh_token', function(req, res) {
/*
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  console.log('refrecame esta :)');
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
*/
});

console.log('Listening on 8888');
app.listen(8888);
