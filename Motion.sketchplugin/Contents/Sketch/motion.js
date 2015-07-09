@import 'common.js'
@import 'Tween.js'

var doc;
var selection;
var animations = {};


var onStart = function(context){
    //TODO: resolve bug -- running script multiple times crashes Sketch
    [[COScript currentCOScript] setShouldKeepAround:true]
    doc = context.document;
    selection = context.selection;
    // For each animation: 
    // Find animation artboards (keyframes)
    initAnimations();
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
    return layerName.match(/\{(\S+)\}/g);
}

var compareLayerProperties = function(inFrameLayer, outFrameLayer){
    var states = {
        in: {},
        out:{}
    };
    // Frame position properties
    inRect = inFrameLayer.rect();
    outRect = outFrameLayer.rect();
    //x
    if(inRect.origin.x != outRect.origin.x){
        states.in.x = inRect.origin.x;
        states.out.x = outRect.origin.x;
    }
    //y
    if(inRect.origin.y != outRect.origin.y){
        states.in.y = inRect.origin.y;
        states.out.y = outRect.origin.y;   
    }
    return states;
}

var compareKeyframes = function(inFrame, outFrame){
    //loop through each layer group in inFrame
    //search for same layer in outFrame
    //if layer is found compare properties
    //if properties are different save
    //return object of in and out properties
    var transitions = [];
    var inFrameLayers = inFrame.children();
    var outFrameLayers = outFrame.children();
    for(var l=0; l < [inFrameLayers count]; l++){
        var inFrameLayer = inFrameLayers.objectAtIndex(l);
        var inFrameLayerName = inFrameLayer.name();
        if(inFrameLayer.isMemberOfClass(MSLayerGroup)){
            for(var o=0; o < [outFrameLayers count]; o++){
                var outFrameLayer = outFrameLayers.objectAtIndex(o);
                var outFrameLayerName = outFrameLayer.name();
                // layers match
                if(inFrameLayerName == outFrameLayerName && outFrameLayer.isMemberOfClass(MSLayerGroup)){  
                    var states =  compareLayerProperties(inFrameLayer, outFrameLayer);
                    // var tween = new TWEEN.Tween( states.in )
                    //     .to( states.out, 2000)
                    //     .easing( TWEEN.Easing.Elastic.InOut );
                    var transition = {
                        target: inFrameLayer,
                        states: states
                    }
                    transitions.push(transition);
                }
            }
        }
    }
    return transitions;
}

var calculateTransitions = function() {
    for(var animationConfig in animations){
        if(animations.hasOwnProperty(animationConfig)){
            var config = animations[animationConfig];
            var keyframeCount = config.keyframes.length;
            var transitionCount = keyframeCount - 1;
            if(transitionCount === 0) continue;
            config.transitions = [];
            for(var t=0; t < transitionCount; t++){
                var inFrame = config.keyframes[t];
                var outFrame = config.keyframes[t+1];
                config.transitions = compareKeyframes(inFrame, outFrame);
                //log(inFrame + " inFrame to" + outFrame + " outFrame");
            }
            // Create pairs of artboard keyframes for transitions
            // Detect differences in supported properties between layers with the same name in each transition pair
        } 
    }
}

var initAnimations = function(){
    // look at artboards on all document pages
    var pages = doc.pages();
    for(var p=0; p < [pages count]; p++){
        var page = pages.objectAtIndex(p);
        var layers = page.children();
        for(var l=0; l < [layers count]; l++){
            var layer = layers.objectAtIndex(l);
            if(layer.isMemberOfClass(MSArtboardGroup)){
                var animationName = checkForAnimationReference(layer.name())
                if(animationName){
                    animations[animationName] = animations[animationName] || {};
                    animations[animationName].keyframes = animations[animationName].keyframes || [];
                    animations[animationName].keyframes.push(layer);
                    animations[animationName].keyframes.sort(function(a,b){
                        if(a.name() < b.name()) return -1;
                        if(a.name() > b.name()) return 1;
                        return 0;
                    })
                }
            }
        }
    }
    calculateTransitions();
}

var playAnimation = function(name, containerLayer){
    var targetAnimation = animations[name];
    // Clear target group(s) on selected artboard 
    var children = [containerLayer children]
    for(var c=0; c < [children count]; c++){
        var child = children.objectAtIndex(c);
        if(child != containerLayer){
             [child removeFromParent];
        } 
    }
    // Copy all top-level layers from first keyframe artboard into containerlayer
    var layers = targetAnimation.keyframes[0].layers();
    for(var t=0; t < [layers count]; t++){
        var layer = layers.objectAtIndex(t);
        var layerCopy = [layer copy];
        containerLayer.addLayers([layerCopy]);
    }
    // create tweens for correct layers
    //log(name + " animation play")
    // [coscript scheduleWithRepeatingInterval:0.01666666 jsFunction:function(cinterval) {
    //    TWEEN.update(Date.now()); 
    // }];
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
                    playAnimation(animationName, child);
                }
            }
        }
    }
    // When target artboard is initialized:
    // Add tweens to update layers in selected artboard
    // Start animation loop to run tweens
    // On complete of last tween kill loop 
}


