require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const axios = require('axios');

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});

console.log(`CONKEY: ${process.env.CONKEY}`);

const config = {
  headers:{
    apikey: process.env.CONKEY,
  }
};

app.get('/shipLoc', function (req, res) {
  axios
    .get('https://sg-mdh-api.mpa.gov.sg/v1/vessel/positions/snapshot', {
      headers: {
        apikey: process.env.CONKEY,
      }
    })
    .then((response) => {
      //console.log(response.data.url);
      // console.log(response.data.explanation);
      //console.log(response.data);
      res.send(response.data)
    })
    .catch((error) => {
      console.log(error);
    });
});




