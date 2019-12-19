const requestLib = require('request');
const dummyData = require('./data.js');
const bluebird = require('bluebird').Promise;
const request = bluebird.promisifyAll(requestLib);

const URL = process.env.URL || 'http://localhost:3000';

(async () => {

  for (const entry of dummyData) {

    const resp = await request.postAsync({
      url: `${URL}${entry.path}`,
      json:true,
      body: entry.data
    });
    console.log(resp.body);
  }

})();


