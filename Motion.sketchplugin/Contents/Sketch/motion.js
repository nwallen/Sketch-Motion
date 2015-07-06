 var testMotion = function(context) {
    context.document.showMessage("running motion test");

    [coscript setShouldKeepAround:true];

    var idx = 0;
    var target = context.selection[0];

    [coscript scheduleWithRepeatingInterval:0.0000001 jsFunction:function(cinterval) {
      print("hello again! (" + idx + ")");
      frame = [target rect];
      frame.origin.y = frame.origin.y + 1;
      [target setRect:frame]
      var view = context.document.currentView;
      view().refresh();
      idx++;
      if (idx > 500) {
          print("Canceling");
          [cinterval cancel];
      }
    
    }];


 }

