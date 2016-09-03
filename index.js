'use strict';

var url          = require('url')
  , EventEmitter = require('events').EventEmitter
  ;

// These numbers were obtained by measuring and averaging both using this module and the official speedtest.net
var speedTestDownloadCorrectionFactor = 1.135
  , speedTestUploadCorrectionFactor   = 1.139
  ;

function once(callback) {
  if (typeof callback !== "function") {
    callback = function() {};
  }
  return function() {
    if (callback) {
      callback.apply(this, arguments);
      callback = null;
    }
  }
}

function getHttp(theUrl, discard, callback) {

  if (!callback) {
    callback = discard;
    discard = false;
  }

  callback = once(callback);

  var options = theUrl;

  if (typeof options == "string") options = url.parse(options);

  var http = options.protocol == 'https:' ? require('https') : require('http');
  delete options.protocol;

  options.headers = options.headers || {};
  options.headers['user-agent'] = options.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.' + Math.trunc(Math.random()*400 + 2704) + '.' + Math.trunc(Math.random()*400 + 103) + ' Safari/537.36';

  http.get(options, function(res) {
    if ( res.statusCode === 302 ) {
      return getHttp(res.headers.location, discard, callback)
    }
    var data = ''
      , count = 0
      ;

    if (!discard) res.setEncoding('utf8');
    res.on('error', callback);
    res.on('data', function(newData) {
      count += newData.length;
      if (!discard) data += newData;
    });
    res.on('end', function() {
      if (discard) data = count;
      callback(null, data, res.statusCode);
    });
  }).on('error', callback);

}

function downloadSpeed(urls, maxTime, callback) {

  callback = once(callback);

  var concurrent = 2
    , running = 0
    , started = 0
    , done = 0
    , todo = urls.length
    , totalBytes = 0
    , emit
    , timeStart
    ;

  maxTime = (maxTime || 10000) / 1000;

  if (this.emit) {
    emit = this.emit.bind(this);
  } else {
    emit = function() {};
  }

  next();

  timeStart = process.hrtime();

  function next() {
    if (started >= todo) return; //all are started
    if (running >= concurrent) return;
    running++;

    var starting = started
      , url      = urls[starting]
      ;

    started++;

    getHttp(url, true, function(err, count) { //discard all data and return byte count
      var diff = process.hrtime(timeStart)
        , timePct
        , amtPct
        , speed
        , fixed
        ;

      diff = diff[0] + diff[1] * 1e-9; //seconds

      running--;
      totalBytes += count;
      done++;
      speed = totalBytes / diff;
      fixed = speed * speedTestDownloadCorrectionFactor / 125000;

      timePct = diff / maxTime * 100;
      // amtPct=done/todo*100;
      amtPct = 0; //time-only

      if (diff > maxTime) {
        done = todo;
      }
      if (done <= todo) {
        emit('downloadprogress', Math.round(Math.min(Math.max(timePct, amtPct), 100.0) * 10) / 10);
        emit('downloadspeedprogress', fixed)
      }
      if (done >= todo) {
        callback(null, speed); //bytes/sec
      } else {
        next();
      }
    });

    next(); //Try another
  }
}

var self = new EventEmitter();

var urls = ['http://tpdb.speed2.hinet.net/test_010m.zip'];

downloadSpeed.call(self, urls, 50000, function(err, speed) {
  var fixed = speed * speedTestDownloadCorrectionFactor / 125000;

  console.log(fixed);
});

//'http://tpdb.speed2.hinet.net/test_010m.zip'
