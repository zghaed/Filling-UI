;(function(app) {
  app.view('Test', {
    template: [

'<div region="string">',
    '<div id="TestA-region12-0-string-id" style="position: absolute; top: 72%; left: 81%; border-bottom: 2px dotted black;"> <span class="btn btn-md circle btn-default"><i class="glyphicon glyphicon-cloud"></i></span> <span class="btn btn-md circle btn-success"><i class="glyphicon glyphicon-music"></i></span> <span class="btn btn-md circle btn-warning"><i class="glyphicon glyphicon-fire"></i></span>',
    '</div>',
'</div>',
'<div region="group" style="flex-direction: row;">',
    '<div id="TestA-region12-0-id" style="flex: 0 1 58%;">',
        '<div class="wrapper-full">',
            '<div class="panel panel-primary">',
                '<div class="panel-heading">',
                    '<h3 class="panel-title">Panel primary</h3> </div>',
                '<div class="panel-body"> Panel content </div>',
            '</div>',
          '  <div class="panel panel-success">',
                '<div class="panel-heading">',
                    '<h3 class="panel-title">Panel success</h3> </div>',
                '<div class="panel-body"> Panel content </div>',
          '  </div>',
          '  <div class="panel panel-warning">',
              '  <div class="panel-heading">',
                    '<h3 class="panel-title">Panel warning</h3> </div>',
              '  <div class="panel-body"> Panel content </div>',
            '</div>',
        '</div>',
    '</div>',
'</div>'
          ],
  });
})(Application);
