const fs = require('fs')
const path = require('path')
const render = require('./render')
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;

const url = process.env.url
const dbName = process.env.dbName;
const client = new MongoClient(url, { useUnifiedTopology: true });

exports.main_handler = async (event, context, callback) => {


  let data = await find();

  let xAxis = [];
  let series = []

  data.forEach(({ duration, time, name }) => {
    time = time + 8 * 60 * 60 * 1000;
    xAxis.push(moment(new Date(time)).format('DD日HH时mm分ss秒'));
    series.push(duration);
  })

  let html = fs.readFileSync(path.resolve(__dirname, './demo.html'), {
    encoding: 'utf-8'
  })
  console.log({
    xAxis: JSON.stringify(xAxis),
    series: JSON.stringify(series)
  })
  html = render(html, {
    xAxis: JSON.stringify(xAxis),
    series: JSON.stringify(series)
  })
  return {
    isBase64Encoded: false,
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: html
  }
}

function find() {
  return new Promise((resolve, reject) => {
    client.connect(function (err) {
      if (err) {
        reject(err);
      }
      console.log("Connected successfully to server");

      const db = client.db(dbName);

      db.collection('crawler-home').find({}).toArray(function (err, docs) {
        if (err) {
          reject(err);
        }
        resolve(docs);
        // client.close();
      });
    })
  })
}