const express = require('express');
const hbs = require('hbs');
var app = express();
const Twitter = require('twitter');
var request = require('request');

app.set('view engine', 'hbs');
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('map.hbs', {
    pageTitle: 'Assignment'
  });
});

app.listen(port, () => {
  console.log('Server is up on port '+port);
});

// PROXY SERVERS ---->

//embed information for infowindow
app.get('/embed/:screen_name&:id_str',(req,res)=>{
  let eurl = encodeURIComponent(`https://twitter.com/${req.params.screen_name}/status/${req.params.id_str}`);
  request(`https://publish.twitter.com/oembed?url=${eurl}&maxwidth=200&theme=dark`, function (error, response, body) {
      res.send(body);
    });
})

//gets tweets acc to lat/lng
app.get('/data/:lat&:lng',(req,res)=>{
  let consumer_key = encodeURIComponent(process.env.CONKEY);
  let consumer_sec = encodeURIComponent(process.env.SECKEY);
  const client = new Twitter({
    consumer_key: `${consumer_key}`,
    consumer_secret:`${consumer_sec}`,
      bearer_token: `${process.env.BEARER}`
  });
  client.get('search/tweets', {'q':'the','geocode':`${req.params.lat},${req.params.lng},2mi`,'count':'100','result_type':'recent'}, function(error, tweets, response) {
    if((tweets)&&(tweets.statuses)){
      data = [];
      tweets.statuses.map(x=>{
        obj = {};
        if(x.coordinates)
        {
          obj=Object.assign({id:x.id},obj);
          if(x.user.profile_image_url){
            let im_url = "https" + x.user.profile_image_url.substring(4);
            obj=Object.assign({img:im_url},obj);

         }
          obj=Object.assign({screen_name:x.user.screen_name},obj);
          obj=Object.assign({id_str:x.id_str},obj);
          obj=Object.assign({coords: x.coordinates.coordinates},obj);
          data.push(obj);
        }
      });
      f(data);
    }
    else{
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({'failed':'true'}));
    }
  });
  const f = (data)=>{
  let result = Object.assign({failed:'false', tweets:data},null);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
  }
});
