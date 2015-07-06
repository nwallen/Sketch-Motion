 @import 'common.js'
 @import 'Tween.js'

 var testMotion = function(context) {
    context.document.showMessage("running motion test");
    var target = context.selection[0];

    //TODO: resolve bug -- running script multiple times crashes Sketch
    [[COScript currentCOScript] setShouldKeepAround:true]

    var animationComplete = false;
    var frame = [target rect];
    var tween = new TWEEN.Tween( { x: frame.origin.x, y: frame.origin.y } )
        .to( { x: frame.origin.x + 100, y: frame.origin.y + 100 }, 2000 )
        .easing( TWEEN.Easing.Elastic.InOut )
        .onUpdate( function(){
            frame.origin.x = this.x;
            frame.origin.y = this.y;
            [target setRect:frame]
            var view = context.document.currentView;
            view().refresh();
        })
        .onComplete( function(){
            context.document.showMessage("done!");
            animationComplete = true;
        })
        .start();

    [coscript scheduleWithRepeatingInterval:0.01666666 jsFunction:function(cinterval) {
       TWEEN.update(Date.now()); 
       if(animationComplete == true){
          [cinterval cancel]
       }
    }];

 }

