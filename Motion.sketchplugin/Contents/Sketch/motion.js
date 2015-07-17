@import 'common.js'
@import 'Tween.js'
@import 'helpers.js'
@import 'timeline.js'

var doc;
var selection;
var animations = {};

var onStart = function(context){
    //TODO: resolve bug -- calling script multiple times in quick succession crashes Sketch
    [[COScript currentCOScript] setShouldKeepAround:true]
    doc = context.document;
    selection = context.selection;
    // Find animation artboards (keyframes)
    initAnimations();
}

var compareLayerProperties = function(inFrameLayer, outFrameLayer){
    var states = {
        in: {},
        out:{}
    };
    // Frame properties
    inRect = inFrameLayer.rect();
    outRect = outFrameLayer.rect();
    //x
    if(inRect.origin.x != outRect.origin.x){
        states.in.x = parseFloat(inRect.origin.x);
        states.out.x = parseFloat(outRect.origin.x);
    }
    //y
    if(inRect.origin.y != outRect.origin.y){
        states.in.y = parseFloat(inRect.origin.y);
        states.out.y = parseFloat(outRect.origin.y);   
    }
    //width
    if(inRect.size.width != outRect.size.width){
        states.in.width = parseFloat(inRect.size.width);
        states.out.width = parseFloat(outRect.size.width);   
    }
    //height
     if(inRect.size.height != outRect.size.height){
        states.in.height = parseFloat(inRect.size.height);
        states.out.height = parseFloat(outRect.size.height);   
    }
    //rotation
    if(inFrameLayer.rotation() != outFrameLayer.rotation()){
        states.in.rotation = parseFloat(inFrameLayer.rotation());
        states.out.rotation = parseFloat(outFrameLayer.rotation()); 
    }    
    // Style properties
    inStyle = inFrameLayer.style();
    outStyle = outFrameLayer.style();
    // opacity
    if(inStyle.contextSettings().opacity() != outStyle.contextSettings().opacity()){
        states.in.opacity = parseFloat(inStyle.contextSettings().opacity());
        states.out.opacity = parseFloat(outStyle.contextSettings().opacity()); 
    }
    return states;
}

var compareKeyframes = function(inFrame, outFrame){
    var transitions = [];
    var inFrameLayers = inFrame.children();
    var outFrameLayers = outFrame.children();
    for(var l=0; l < [inFrameLayers count]; l++){
        var inFrameLayer = inFrameLayers.objectAtIndex(l);
        var inFrameLayerName = inFrameLayer.name();
        //loop through each layer group in inFrame
        if(inFrameLayer.isMemberOfClass(MSLayerGroup)){
            for(var o=0; o < [outFrameLayers count]; o++){
                var outFrameLayer = outFrameLayers.objectAtIndex(o);
                var outFrameLayerName = outFrameLayer.name();
                //search for same layer group in the outFrame
                if(inFrameLayerName == outFrameLayerName && outFrameLayer.isMemberOfClass(MSLayerGroup)){  
                    //if properties are different save states
                    var states =  compareLayerProperties(inFrameLayer, outFrameLayer);
                    var transition = {
                        target: inFrameLayer,
                        states: states
                    }
                    //return object containing in and out states for each target layer
                    transitions.push(transition);
                }
            }
        }
    }
    return transitions;
}

var calculateTransitions = function(){
    for(var animationName in animations){
        if(animations.hasOwnProperty(animationName)){
            var animation = animations[animationName];
            var keyframeCount = animation.keyframes.length;
            var transitionCount = keyframeCount - 1;
            if(transitionCount === 0) continue;
            animation.transitions = {};
            // compare keyframes for all transitions
            for(var t=0; t < transitionCount; t++){
                var inFrame = animation.keyframes[t].layer;
                var outFrame = animation.keyframes[t+1].layer;
                var transitions = compareKeyframes(inFrame, outFrame);
                for(var i=0; i < transitions.length; i++){
                    var transition = transitions[i];
                    animation.transitions[transition.target.name()] = animation.transitions[transition.target.name()] || [];
                    animation.transitions[transition.target.name()].push(transition);
                }
            }
        } 
    }
   
}


var initAnimations = function(){
    // Check artboards on all document pages
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
                    animations[animationName].name = animationName[0];
                    animations[animationName].keyframes = animations[animationName].keyframes || [];
                    var keyframe = {
                        layer: layer,
                        timing: {
                            duration: 500,
                            delay: 0,
                            easing: TWEEN.Easing.Elastic.Out 
                        }
                    }
                    animations[animationName].keyframes.push(keyframe);
                    animations[animationName].keyframes.sort(function(a,b){
                        if(a.layer.name() < b.layer.name()) return -1;
                        if(a.layer.name() > b.layer.name()) return 1;
                        return 0;
                    })
                }
            }
        }
    }
    refreshAnimationTimelines();
    calculateTransitions();
}


var createTween = function(states, targetLayer, containerLayer, timing, animationName, transitionName) {
    var layers = findLayerGroupsWithName(targetLayer.name(), containerLayer);
    var tween = new TWEEN.Tween(states.in)
            .to(states.out, timing.duration )
            .easing( timing.easing )
            .delay( timing.delay )
            .onStart(function(){
                if(animationName && transitionName){
                    highlightTimelineFrame(transitionName, animationName);
                    highlightLegendName(transitionName, animationName);
                }
            })
            .onComplete(function(){
                if(animationName && transitionName){
                    unHighlightTimelineFrame(transitionName, animationName);
                    unHighlightLegendName(transitionName, animationName);
                }
            })
            .onUpdate(function(){   
                for( var l=0; l < layers.length; l++){
                    var layer = layers[l];
                    var frame = layer.rect();
                    if(this.x){
                        frame.origin.x = this.x;
                    }
                    if(this.y){
                        frame.origin.y = this.y;
                    }
                    if(this.height){
                        frame.size.height = this.height;
                    }
                    if(this.width){
                        frame.size.width = this.width;
                    }
                    if(this.rotation){
                        layer.setRotation(this.rotation);
                    }
                    layer.setRect(frame);
                    var style = layer.style();
                    if(this.opacity){
                        style.contextSettings().opacity = this.opacity;
                    }
                    layer.setStyle(style);
                }
            });
    return tween;
}

var chainTweens = function(tweens){
    // chain transitions so they play in sequence
    for(var t=0; t < tweens.length; t++){
        if(t+1 < tweens.length){
            tweens[t].chain(tweens[t+1]);
        }
        if(t == 0){
            tweens[t].start();
        }
    }
}

var initTweens = function(animation, containerLayer){
    var transitions = animation.transitions;
    // iterate keyframe transitions
    for(var transition in transitions){
        if(transitions.hasOwnProperty(transition)){
            var layerTransitions = transitions[transition];
            // iterate individual layer transitions
            var tweens = [];
            for(var t=0; t < layerTransitions.length; t++){
                var layerTransition = layerTransitions[t];
                var timing = animation.keyframes[t+1].timing;
                var animationName = animation.name;
                var transitionName = getTransitionName(animationName, t, t+1);
                var tween = createTween(layerTransition.states, layerTransition.target, containerLayer, timing, animationName, transitionName);
                tweens[t] = tween;
            }
            chainTweens(tweens);
            startPlayhead(animation.name);
        }
    }
}

var animate = function() {
    // run animation loop
    [coscript scheduleWithRepeatingInterval:0.01666666 jsFunction:function(cinterval){
        TWEEN.update(Date.now());
        doc.currentView().refresh();
        // kill loop when tweens are done
        if(TWEEN.getAll().length == 0){
            [cinterval cancel]
        } 
    }];
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
    // resize containerlayer to match first keyframe artboard
    var keyframeFrame = targetAnimation.keyframes[0].layer.rect();
    var containerFrame = containerLayer.rect();
    containerFrame.size = keyframeFrame.size;
    containerLayer.setRect(containerFrame);
    // Copy all top-level layer groups from first keyframe to containerlayer
    var layers = targetAnimation.keyframes[0].layer.layers();
    for(var t=0; t < [layers count]; t++){
        var layer = layers.objectAtIndex(t);
        var layerCopy = [layer copy];
        containerLayer.addLayers([layerCopy]);
    }
    // create tweens
    initTweens(targetAnimation, containerLayer);
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
        doc.showMessage("please select a single artboard")
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
        animate();
    }
}


