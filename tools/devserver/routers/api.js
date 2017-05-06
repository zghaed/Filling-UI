/**
 * Sample express.router() code
 *
 * uri base: /sample
 *
 * @author Tim Lauv
 * @created 2014.04.18
 */
var _ = require('underscore'),
  path = require('path'),
  fs = require('fs-extra'),
  less = require('less');

module.exports = function(server){

  var profile = server.get('profile');
  var router = server.mount(this);
  server.secure(router);

  router.post('/test', function(req, res){
    var root = path.join(__dirname, '..', '..', '..', 'implementation', 'themes', req.body.theme);
    var lessFile = '@import (reference) "main.less";' + req.body.less;
    console.log('lessfile is',lessFile);
    less.render(lessFile,
      {
        paths: [path.join(root, 'less'), path.join(root), path.join(root, '..'), path.join(root, '..', '..', 'bower_components')],
        plugins: [require('less-plugin-glob')]
      },
      function(error, output){
        //if error, print error and return
        if(error){
          console.log('LESS compile error\n', error);
          return;
        }

          console.log(output.css);
          return res.status(200).json({msg: output.css});
      });


  });

  //c. throw error
  router.get('/error', function(req, res, next){
    next(new Error('error!'));
  });

};
