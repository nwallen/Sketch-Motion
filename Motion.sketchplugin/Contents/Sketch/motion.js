var SM = SM || {}; // global to namespace plugin

@import 'common.js'
@import 'libs/Tween.js'
@import 'libs/rebound.js'
@import 'constants.js'
@import 'helpers.js'
@import 'timeline.js'
@import 'gif.js'
@import 'flatten.js'

var doc;
var selection;
var pluginPath;

SM.animations = SM.animations || {};

SM.onStart = function(context){
    //TODO: resolve bug -- calling script multiple times in quick succession crashes Sketch
    [[COScript currentCOScript] setShouldKeepAround:true]
    doc = context.document;
    selection = context.selection;
    SM.pluginStartTime = Date.now(); // used to sync all animations
    var scriptPath = context.scriptPath;
    var pluginFolder = scriptPath.match(/Plugins\/([\w -])*/)[0] + "/";
    var basePath = scriptPath.split("Plugins")[0];
    pluginPath = basePath + pluginFolder
    
    // create spring system -- we'll update it manually with tweens in the animation loop
    SM.springSystem  = new window.rebound.SpringSystem();
    SM.springSystem.setLooper(new window.rebound.SteppingSimulationLooper());

    // Find animation artboards (keyframes)
    SM.initAnimations();
}

SM.compareLayerProperties = function(inFrameLayer, outFrameLayer){
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
   
    if(countObjectKeys(states.in) == 0){
        return null
    }
    
    return states
}

SM.compareKeyframes = function(inFrame, outFrame){
    var transitions = [];
    deDupeGroupNames(inFrame);
    deDupeGroupNames(outFrame);
    var inFrameLayers = inFrame.children();
    var outFrameLayers = outFrame.children();
    for(var l=0; l < [inFrameLayers count]; l++){
        var inFrameLayer = inFrameLayers.objectAtIndex(l);
        var inFrameLayerName = inFrameLayer.name();
        //loop through each group in inFrame artboard
        if(inFrameLayer.isMemberOfClass(MSLayerGroup)){
            for(var o=0; o < [outFrameLayers count]; o++){
                var outFrameLayer = outFrameLayers.objectAtIndex(o);
                var outFrameLayerName = outFrameLayer.name();
                //search for same group in the outFrame artboard
                if(inFrameLayerName == outFrameLayerName && outFrameLayer.isMemberOfClass(MSLayerGroup)){  
                    //if properties are different save states
                    var states =  SM.compareLayerProperties(inFrameLayer, outFrameLayer);
                    if(states != null){
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
    }
    return transitions;
}

SM.calculateTransitions = function(){
    for(var animationName in SM.animations){
        if(SM.animations.hasOwnProperty(animationName)){
            var animation = SM.animations[animationName];
            var keyframeCount = animation.keyframes.length;
            var transitionCount = keyframeCount - 1; // always one less transition than keyframes
            if(transitionCount === 0) continue;
            animation.transitions = {};
            // compare keyframes for all transitions
            for(var t=0; t < transitionCount; t++){
                var inFrame = animation.keyframes[t].layer; // starting artboard
                var outFrame = animation.keyframes[t+1].layer; // ending artboard
                var transitions = SM.compareKeyframes(inFrame, outFrame); // compare groups on artboards
                for(var i=0; i < transitions.length; i++){
                    var transition = transitions[i];
                    transition.keyframeIndex = t + 1; // corresponding keyframe is outFrame
                    animation.transitions[transition.target.name()] = animation.transitions[transition.target.name()] || [];
                    animation.transitions[transition.target.name()].push(transition);
                }
            }
        } 
    }
   
}


SM.initAnimations = function(){
    // Detect and save all tagged animations in document
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
                    SM.animations[animationName] = SM.animations[animationName] || {};
                    SM.animations[animationName].name = animationName[0];
                    SM.animations[animationName].keyframes = SM.animations[animationName].keyframes || [];
                    var keyframe = {
                        layer: layer,
                        timing: {
                            duration: 500,
                            delay: 0,
                            easingIndex: 0,
                            easing: TWEEN.Easing.Linear.None
                        }
                    }
                    SM.animations[animationName].keyframes.push(keyframe);
                    SM.animations[animationName].keyframes.sort(function(a,b){
                        var aMixed = normalizeMixedDataValue( a.layer.name() );
                        var bMixed = normalizeMixedDataValue( b.layer.name() );
                        return( aMixed < bMixed ? -1 : 1 );
                    })
                }
            }
        }
    }
    SM.calculateTransitions();
}

SM.mappedLayerPropertiesFromSpring = function(springVal, inState, outState){
    var mappedValues = {};
    if(inState.x != undefined){
        mappedValues.x = window.rebound.MathUtil.mapValueInRange(springVal, 0, 1, inState.x, outState.x);
    }
    if(inState.y != undefined){
        mappedValues.y = window.rebound.MathUtil.mapValueInRange(springVal, 0, 1, inState.y, outState.y);
    }
    if(inState.height != undefined){
        mappedValues.height = window.rebound.MathUtil.mapValueInRange(springVal, 0, 1, inState.height, outState.height);
    }
    if(inState.width != undefined){
        mappedValues.width = window.rebound.MathUtil.mapValueInRange(springVal, 0, 1, inState.width, outState.width);
    }
    if(inState.opacity != undefined){
        mappedValues.opacity = window.rebound.MathUtil.mapValueInRange(springVal, 0, 1, inState.opacity, outState.opacity);
    }
    if(inState.rotation != undefined){
        mappedValues.rotation = window.rebound.MathUtil.mapValueInRange(springVal, 0, 1, inState.rotation, outState.rotation);
    }
    return mappedValues
}


SM.createTween = function(states, targetLayer, containerLayer, timing, animationName, transitionName) {
    var layers = findLayerGroupsWithName(targetLayer.name(), containerLayer);
    var layer = layers[0];
    var spring;
    var tween = new TWEEN.Tween(states.in)
            .to(states.out, timing.duration )
            .delay( timing.delay )
            .onStart(function(){
                //log('animation start ' + targetLayer.name() + " ---- ")
                if(animationName && transitionName){
                    SM.highlightTimelineFrame(transitionName, animationName);
                    SM.highlightLegendName(transitionName, animationName);
                }
                // if spring easing is selected create a rebound spring to handle animation
                if(timing.popSpring){
                    log(timing.popSpring);
                    spring = SM.springSystem.createSpringWithBouncinessAndSpeed(timing.popSpring.bounciness, timing.popSpring.speed);
                    spring.setRestSpeedThreshold = 0.5;
                    spring.setRestDisplacementThreshold = 0.5;
                    spring.addListener({
                          onSpringUpdate: function(spring) {
                            var properties = SM.mappedLayerPropertiesFromSpring(spring.getCurrentValue(), states.in, states.out);
                            updateLayerProperties(properties, layer);  
                          }
                    });
                    spring.setEndValue(1);
                }
            })
            .onComplete(function(){
                //log('animation stop ' + targetLayer.name()) 
                if(animationName && transitionName){
                    SM.unHighlightTimelineFrame(transitionName, animationName);
                    SM.unHighlightLegendName(transitionName, animationName);
                }
            })
            .onUpdate(function(){ 
                // update unless a spring is handling this animation
                if(!spring){
                    updateLayerProperties(this, layer);     
                }
            });
    if(timing.easing) tween.easing( timing.easing ); // apply easing
    return tween;
}

SM.initTweens = function(animation, containerLayer){
    var transitions = animation.transitions;
    // iterate keyframe transitions
    for(var transition in transitions){
        if(transitions.hasOwnProperty(transition)){
            var layerTransitions = transitions[transition];
            // iterate individual layer transitions
            var tweens = [];
            for(var t=0; t < layerTransitions.length; t++){
                var layerTransition = layerTransitions[t];
                var index = layerTransition.keyframeIndex;
                var timing = animation.keyframes[index].timing;
                var animationName = animation.name;
                var transitionName = getTransitionName(animationName, index - 1, index);
                var tween = SM.createTween(layerTransition.states, layerTransition.target, containerLayer, timing, animationName, transitionName);
                tweens[t] = tween;

                var keyframeStartTime = parseInt(timing.startTime);
                var keyframeDelay = parseInt(timing.delay);
                var startTime = SM.pluginStartTime + (keyframeStartTime - keyframeDelay);
                tweens[t].start(startTime);
            }
            SM.startPlayhead(animation.name);
        }
    }
}

SM.animate = function() {
    var fps = 60;
    var animationStartTime;
    var lastRuntime = 0;
    // main animation loop
    [coscript scheduleWithRepeatingInterval:(1/fps) jsFunction:function(cinterval){
        if(animationStartTime == undefined){
            animationStartTime = Date.now(); //note time of first animation loop
        }
        // update tweens
        var runTime = Date.now() - animationStartTime; // how long animation has run
        TWEEN.update(SM.pluginStartTime + runTime); // move tweens to match runtime
        // update spring system
        var stepTime = runTime - lastRuntime; // interval since last loop 
        SM.springSystem.looper.step(stepTime);
        // refresh to show animation
        doc.currentView().refresh();
        lastRuntime = runTime;
        // kill loop when tweens and springs are done
        if(TWEEN.getAll().length == 0 && SM.springSystem.getIsIdle()){
            [cinterval cancel]
            doc.showMessage("animation done")
        } 
    }];
}

SM.animateAndSaveGIF = function() {
    var animationTime = SM.pluginStartTime; //  time when plugin was launched
    var exportOptions = SM.exportOptionsDialog();
    var fps = exportOptions.fps || 30;
    var loops = exportOptions.loops;
    SM.initGIFexport();
    [coscript scheduleWithRepeatingInterval:(1/fps) jsFunction:function(cinterval){
        TWEEN.update(animationTime);
        SM.springSystem.looper.step(1000/fps);
        doc.currentView().refresh();
        SM.exportArtboardToGIFset(SM.selectedArtboard)
        animationTime += 1000/fps; // 1000/fps = ms/frame -- manually increment to not drop frames
        // kill loop when tweens and springs are done
        if(TWEEN.getAll().length == 0 && SM.springSystem.getIsIdle()){
            [cinterval cancel]
            SM.createGIF(fps, loops);
        } 
    }];
}

SM.playAnimation = function(name, containerLayer){
    var targetAnimation = SM.animations[name];
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
    // update timing and easing UI for animation
    SM.refreshAnimationTimeline(targetAnimation.name);
    // Copy all top-level layer groups from first keyframe to containerlayer
    var layers = targetAnimation.keyframes[0].layer.layers();
    for(var t=0; t < [layers count]; t++){
        var layer = layers.objectAtIndex(t);
        var layerCopy = [layer copy];
        containerLayer.addLayers([layerCopy]);
    }
    // flatten artwork for better performance
    SM.flattenArtwork(containerLayer);
    // create tweens
    SM.initTweens(targetAnimation, containerLayer);
}

SM.playAnimations = function(context, playAndExport){
    SM.onStart(context); // init animations and globals
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
        SM.selectedArtboard = artboards[0];
        // Find animation(s) referenced in selected artboard
        var artboardChildren = artboards[0].children();
        for(var l=0; l < [artboardChildren count]; l++){
            var child = artboardChildren.objectAtIndex(l);
            var childName = child.name();
            if(child.isMemberOfClass(MSLayerGroup)){
                var animationName = checkForAnimationReference(childName);
                if(animationName){
                     SM.playAnimation(animationName, child);
                }
            }
        }
        if(playAndExport){
            SM.animateAndSaveGIF();
        }
        else {
            SM.animate();
        }
    }
}

SM.exportGIF = function(context){
    SM.playAnimations(context, true);
}

// non-namespaced methods provided for sketch plugin commands
var playAnimations = SM.playAnimations;
var exportGIF = SM.exportGIF;
