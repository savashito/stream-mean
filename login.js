// function called when logIn

exports = {
	login: function(){

	    // get the playlists 
	    request.post(authOptions, function(error, response, body) {
	      if (!error && response.statusCode === 200) {
	        var access_token = body.access_token,
	            refresh_token = body.refresh_token;
	        var options = {
	          url: 'https://api.spotify.com/v1/me',
	          headers: { 'Authorization': 'Bearer ' + access_token },
	          json: true
	        };
	        // use the access token to access the Spotify Web API
	        request.get(options, function(error, response, user) {
	          console.log('id is : ' +user.id);
	          var options = {
	            url: 'https://api.spotify.com/v1/users/'+user.id+'/playlists',
	            headers: { 'Authorization': 'Bearer ' + access_token },
	            json: true
	          };
	          request.get(options,
	            function(error, response, user) {
	              console.log('retirved playist '+user.id);
	              console.log(error);
	              console.log(user);
	          });
	}

}

/*
          var scopes = 'user-read-private user-read-email';
          console.log('miauu'+user.id);
          res.redirect('https://accounts.spotify.com/authorize' + 
            '?response_type=code' +
            '&client_id=' + user.id +
            (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
            '&redirect_uri=' + encodeURIComponent('/miau'));
*/