var http = require('http');
var internalIp = require('internal-ip');
var grabOpts = require('../utils/grab-opts');
var debug = require('debug')('castnow:desktop');
var port = 4103;
var spawn = require('child_process').spawn;

var desktop = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (ctx.options.playlist[0].path !== 'desktop') return next();

  var ip = ctx.options.myip || internalIp();
  ctx.options.playlist[0] = {
    path: 'http://' + ip + ':' + port,
    type: 'video/mp4'
  };
  ctx.options.disableTimeline = true;
  ctx.options.disableSeek = true;

  http.createServer(function(req, res) {
    debug('incoming request for streaming desktop');
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*'
    });
    var streamFlags = ['-f', 'x11grab',
                       '-s', '1920x1080',
                       '-r', '30',
                       '-i', ':0.0',
                       '-an',
                       '-pix_fmt', 'yuv420p',
                       '-f', 'mp4',
                       '-vcodec', 'h264',
                       '-movflags', 'frag_keyframe+faststart',
                       '-strict',
                       'experimental',
                       '-'];

    var child = spawn('ffmpeg', streamFlags);

    debug('spawning ffmpeg %s', streamFlags.join(' '));

    child.stdout.pipe(res);
  }).listen(port);
  debug('started webserver on address %s using port %s', ip, port);
  next();
};

module.exports = desktop;
