
import speedtest from '../../src';

var EventEmitter = require('events').EventEmitter
var speedTestDownloadCorrectionFactor = 1.135
  , speedTestUploadCorrectionFactor   = 1.139;
var self = new EventEmitter();

describe('test network', () => {


  it('download', (done) => {
    try {

      var downloadUrls = ['http://tpdb.speed2.hinet.net/test_100m.zip'];
      speedtest.downloadSpeed.call(self, downloadUrls, 10000, function(err, speed) {
        var fixed = speed * speedTestDownloadCorrectionFactor / 125000;
        console.log("Download: " + fixed);
        done();
      });

    } catch (e) {
      done(e);
    }

  });
  it('upload', (done) => {
    try {
      var uploadUrl = 'http://spt.oms.fcu.edu.tw/minisp/speedtest/upload.php';

      var sizes     = []
        , sizesizes = [
            Math.round(0.25 * 1000 * 1000),
            Math.round(0.5 * 1000 * 1000),
            Math.round(1 * 1000 * 1000),
            Math.round(2 * 1000 * 1000),
            Math.round(4 * 1000 * 1000),
            Math.round(8 * 1000 * 1000),
            Math.round(16 * 1000 * 1000),
            Math.round(32 * 1000 * 1000)
          ]
        , sizesize
        , n
        , i
        ;

      for (n = 0; n < sizesizes.length; n++) {
        sizesize = sizesizes[n];
        for (i = 0; i < 25; i++) {
          sizes.push(sizesize);
        }
      }

      speedtest.uploadSpeed.call(self, uploadUrl, sizes, 10000, function(err, speed) {
        var fixed = speed * speedTestUploadCorrectionFactor / 125000;
        console.log("Upload: " + fixed);
        done()
      });

    } catch (e) {
      done(e);
    }

  });



});
