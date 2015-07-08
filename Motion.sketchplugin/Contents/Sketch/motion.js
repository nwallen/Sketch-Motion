@import 'common.js'
@import 'Tween.js'

var doc;
var selection;

var onStart = function(context){
    //TODO: resolve bug -- running script multiple times crashes Sketch
    [[COScript currentCOScript] setShouldKeepAround:true]
    doc = context.document;
    selection = context.selection;
}

// quick proof of concept test
var testMotion = function(context) {
    onStart(context);
    doc.showMessage("running motion test");
    
    var target = context.selection[0];
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
            doc.showMessage("done!");
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

var checkForAnimationReference = function(layerName) {
    return layerName.match(/\{(\S+)\}/g)
}

var playAnimations = function(context){
    onStart(context);
    
    var artboards = [];
    for(var s=0; s < [selection count]; s++){
        if(selection[s].isMemberOfClass(MSArtboardGroup)){
            artboards.push(selection[s])
        }
    }
    // requires user to select a single artboard
    if (artboards.length !== 1){
        doc.showMessage("please select one artboard")
        return;
    }
    else {
        doc.showMessage("animating...")
         // Find animation(s) referenced in selected artboard
        var artboardChildren = artboards[0].children();
        for(var l=0; l < [artboardChildren count]; l++){
             var child = artboardChildren.objectAtIndex(l);
             var childName = child.name();
             if(child.isMemberOfClass(MSLayerGroup)){
                  var animationName = checkForAnimationReference(childName);
                  if(animationName){
                      log(animationName);
                      // For each animation: 
                      // Find related artboards (keyframes)
                      // Order artboard keyframes
                      
                      // For each pair of artboard keyframes:
                      // Detect differences in supported properties between layers with the same name
                      // Save layer name and with all required tweens parameters to dictionary
                      // Clear target group on selected artboard 
                      // Copy in layers from initial artboard keyframe
                  }
             }
        }
    }
   
    
    // When target artboard is initialized:
    // Add tweens to update layers in selected artboard
    // Start animation loop to run tweens
    // On complete of last tween kill loop 
}


