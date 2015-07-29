// Manage timeline UI elements
SM.highlightedLegends = {};
SM.highlightedSegments = {};

SM.createTimelineSegment = function(x, y, width, height, index, transitionName, timelineArtboard){
    // group
    var group = timelineArtboard.addLayerOfType('group');
    group.setName(transitionName);
    // size & position
    updateFrame({
        x : x,
        y : y,
        width : width,
        height : height
    }, group);
    // rectangle
    var rectangle = group.addLayerOfType('rectangle');
    rectangle.setName('timelineSegment');
    updateShapeStyle({
        fill: TIMELINECOLORS.block,
        border: {color: TIMELINECOLORS.blockBorder, thickness:1}
    }, rectangle)
    updateFrame({
        width: group.rect().size.width,
        height: group.rect().size.height
    }, rectangle)
    // title text
    var text = group.addLayerOfType('text');
    text.setName('timelineSegmentTitle');
    text.stringValue =  index + "";
    updateTextStyle({
        font: "HelveticaNeue-Bold",
        size: 55,
        color: TIMELINECOLORS.text
    },text)
    updateFrame({
        y: TIMELINELAYOUT.height * .2,
        width: group.rect().size.width,
        height: group.rect().size.height
    }, text)
    text.textAlignment = 2; // align center

    return group;
}

SM.createLegendDetail = function(k, transitionName, timing){
    var detail = [MSLayerGroup new]
    updateFrame({
        x : LEGENDLAYOUT.margin,
        y : ((k-1) * (LEGENDLAYOUT.easeTileHeight + LEGENDLAYOUT.margin)) + LEGENDLAYOUT.margin,
        width : LEGENDLAYOUT.rowWidth,
        height : LEGENDLAYOUT.easeTileHeight
    }, detail);
    detail.setName(transitionName);
    
    var index = detail.addLayerOfType('text');
    index.setName('animationIndex')
    index.stringValue = k + '';
    updateTextStyle({
        font: "HelveticaNeue-Bold",
        size: 35,
        color: LEGENDCOLORS.index
    }, index)
    updateFrame({
        x : LEGENDLAYOUT.easeTileWidth + LEGENDLAYOUT.margin,
        y : 0,
        width : LEGENDLAYOUT.rowWidth - LEGENDLAYOUT.easeTileWidth - (LEGENDLAYOUT.margin * 3)
    }, index);

    var info = detail.addLayerOfType('text');
    info.setName('animationInfo');
    info.stringValue = transitionName + "\ndelay " + timing.delay + "ms / duration " + timing.duration + "ms";
    updateTextStyle({
        font: "HelveticaNeue-Thin",
        size: 30,
        color: LEGENDCOLORS.info
    }, info)
    updateFrame({
        x : LEGENDLAYOUT.easeTileWidth + LEGENDLAYOUT.margin,
        y : LEGENDLAYOUT.easeTileHeight * .40,
        width : LEGENDLAYOUT.rowWidth - LEGENDLAYOUT.easeTileWidth - (LEGENDLAYOUT.margin * 3)
    }, info);

    var curve = detail.addLayerOfType('group');
    curve.setName('curve');

    var curveMask = curve.addLayerOfType('rectangle');
    curveMask.setName('curveMask');
    updateFrame({
       width : LEGENDLAYOUT.easeTileWidth,
       height : LEGENDLAYOUT.easeTileHeight
    }, curveMask);
    curveMask.setHasClippingMask(true);

    var imagePath = pluginPath + RESOURCESPATH + ANIMATIONCURVEFILENAME;
    var image = addImage(imagePath, curve, 'animationCurve');

    return detail
}

SM.popConfigValToCoords = function(config){
    var x = ((config.speed - 1) * POPCONFIGLAYOUT.cellSize) + POPCONFIGLAYOUT.margin;
    var maxY = (POPCONFIGLAYOUT.cellSize * 19) + POPCONFIGLAYOUT.margin;
    var y = ((config.bounciness - 1) * POPCONFIGLAYOUT.cellSize);
    y = maxY - y;
    return {x:x, y:y}
}

SM.coordsToPopConfigVal = function(coords){
    var speed = Math.round(((coords.x - POPCONFIGLAYOUT.margin)/POPCONFIGLAYOUT.cellSize)) + 1;
    var maxY = (POPCONFIGLAYOUT.cellSize * 19) + POPCONFIGLAYOUT.margin;
    var yFromBottom = maxY - coords.y;
    var bounciness =  Math.round(yFromBottom/POPCONFIGLAYOUT.cellSize) + 1; 
    return {speed:speed, bounciness:bounciness}
}

SM.getPopSpringConfig = function(springName, animationName){
    var defaultConfig = {speed:4, bounciness:10};
    var artboard = getArtboardsWithNameInDocument(springName)[0];
    if(artboard){
        // exists -- read and return config
        var marker = findShapeWithName("popValueMarker", artboard)[0];
        if(!marker) return defaultConfig
        var vals = SM.coordsToPopConfigVal({
            x: marker.rect().origin.x,
            y: marker.rect().origin.y
        })
        var snappedCoords = SM.popConfigValToCoords(vals);
        updateFrame({
            x: snappedCoords.x,
            y: snappedCoords.y
        }, marker)
        return vals
    }
    else{
        // doesn't exist -- create and return default config
         var relevantKeyframe = SM.animations[animationName].keyframes[0].layer;
        // init artboard
        artboard = [MSArtboardGroup new];
        artboard.setHasBackgroundColor(true);
        artboard.setBackgroundColor(MSColor.colorWithSVGString(POPCONFIGCOLORS.background));
        artboard.setName(springName);  
        updateFrame({
            x: relevantKeyframe.rect().origin.x - 550,
            y: relevantKeyframe.rect().origin.y,
            width: (POPCONFIGLAYOUT.cellSize * 20) + (POPCONFIGLAYOUT.margin * 2),
            height: (POPCONFIGLAYOUT.cellSize * 20) + (POPCONFIGLAYOUT.margin * 2)

        }, artboard)
        // add grid
        var grid = generateGrid({rows:20, columns:20, size:POPCONFIGLAYOUT.cellSize},{
            border: {color: POPCONFIGCOLORS.grid, thickness:1}
        });
        grid.setName("popGrid");
        grid.setIsLocked(true);
        updateFrame({
            x: POPCONFIGLAYOUT.margin,
            y: POPCONFIGLAYOUT.margin
        }, grid)
        artboard.addLayers([grid]);
        // add marker
        var markerCoords = SM.popConfigValToCoords(defaultConfig);
        var marker = createCircle({
            x:markerCoords.x,
            y:markerCoords.y,
            width: POPCONFIGLAYOUT.cellSize,
            height: POPCONFIGLAYOUT.cellSize
        },{fill:"#ffffff"});
        marker.setName("popValueMarker");
        artboard.addLayers([marker]);
        // add artboard
        doc.currentPage().addLayers([artboard]);
        return defaultConfig
    }

}

SM.initTimelineArtboard = function(animationName, timelineArtboardName){
    var animationKeyframes = SM.animations[animationName].keyframes;
    var firstKeyframe = animationKeyframes[0].layer;
    var keyframeFrame = firstKeyframe.rect();
    // setup timeline artboard 
    var timelineArtboard = [MSArtboardGroup new];
    timelineArtboard.setHasBackgroundColor(true);
    timelineArtboard.setBackgroundColor(MSColor.colorWithSVGString(TIMELINECOLORS.background));
    timelineArtboard.setName(timelineArtboardName);   
    updateFrame({
        x: keyframeFrame.origin.x + LEGENDLAYOUT.rowWidth + (LEGENDLAYOUT.margin * 3),
        y: keyframeFrame.origin.y + keyframeFrame.size.height + 120,
        height: TIMELINELAYOUT.height
    },timelineArtboard)
     // don't maintain proportions on resize
    timelineArtboard.frame().setConstrainProportions(0);
    // save reference to artboards in animation config object
    SM.animations[animationName].timelineArtboard = timelineArtboard;
    // add artboard to page
    doc.currentPage().addLayers([timelineArtboard]);
    // add segments and details
    SM.updateTimeline(animationName);        
}

SM.initTimelineLegendArtboard = function(animationName, timelineArtboardName){
    var animationKeyframes = SM.animations[animationName].keyframes;
    var firstKeyframe = animationKeyframes[0].layer;
    var keyframeFrame = firstKeyframe.rect();
    // setup timeline legend
    var timelineLegendArtboard = [MSArtboardGroup new];
    timelineLegendArtboard.setHasBackgroundColor(true);
    timelineLegendArtboard.setBackgroundColor(MSColor.colorWithSVGString(LEGENDCOLORS.background));
    var timelineLegendArtboardName = getLegendName(animationName);
    timelineLegendArtboard.setName(timelineLegendArtboardName);
    updateFrame({
        x: keyframeFrame.origin.x ,
        y: keyframeFrame.origin.y + keyframeFrame.size.height + 120,
        height: LEGENDLAYOUT.margin,
        width: LEGENDLAYOUT.rowWidth + (LEGENDLAYOUT.margin * 3) 
    }, timelineLegendArtboard)
    // don't maintain proportions on resize
    timelineLegendArtboard.frame().setConstrainProportions(0);
    // save reference to artboards in animation config object
    SM.animations[animationName].timelineLegendArtboard = timelineLegendArtboard;
    // add artboard to page
    doc.currentPage().addLayers([timelineLegendArtboard]);
    // add segments and details
    SM.updateTimelineLegend(animationName);        
}

SM.matchTimelineHeightToLegendHeight = function(animationName){
    if(SM.animations[animationName].timelineArtboard && SM.animations[animationName].timelineLegendArtboard){
        SM.animations[animationName].timelineArtboard.frame().setConstrainProportions(0);
        updateFrame({
            height: SM.animations[animationName].timelineLegendArtboard.rect().size.height
        }, SM.animations[animationName].timelineArtboard)
        SM.addTimelinePlayhead(animationName);
    }
}

SM.updateTimelineLegend = function(animationName){
    var animationKeyframes = SM.animations[animationName].keyframes;
    var details = SM.animations[animationName].timelineLegendArtboard.layers();
    var prevGroup = null;
    // check for extra details
    if(details.count() > (animationKeyframes.length-1)){
        // more details than transitions -- delete extra
        var delta =  details.count() - (animationKeyframes.length-1);
        for(var d=0; d < delta; d++){
            var detailToDelete = details.objectAtIndex(details.count() - 1);
            [detailToDelete removeFromParent];
            SM.animations[animationName].timelineLegendArtboard.frame().setConstrainProportions(0);
            SM.animations[animationName].timelineLegendArtboard.frame().subtractHeight(LEGENDLAYOUT.easeTileHeight + LEGENDLAYOUT.margin);
            SM.matchTimelineHeightToLegendHeight(animationName);
        }
    }
    for( var k=1;k < animationKeyframes.length; k++){
        var keyframe = animationKeyframes[k];
        var timing = keyframe.timing;
        var transitionName = getTransitionName(animationName, k-1, k);
        // update details
        if((k-1) > (details.count() - 1)){
            // no details -- add new detail set
            var detail =  SM.createLegendDetail(k, transitionName, timing);
            SM.animations[animationName].timelineLegendArtboard.addLayers([detail]);
            SM.animations[animationName].timelineLegendArtboard.frame().setConstrainProportions(0);
            SM.animations[animationName].timelineLegendArtboard.frame().addHeight(LEGENDLAYOUT.easeTileHeight + LEGENDLAYOUT.margin)
            SM.matchTimelineHeightToLegendHeight(animationName);
        }
        else {
            // details exist - update 
            var detailToUpdate = details.objectAtIndex(k - 1);
            detailToUpdate.setName(transitionName);
            var textToUpdate = findTextWithName('animationInfo', detailToUpdate)[0];

            if(textToUpdate){
                textToUpdate.stringValue = transitionName + "\ndelay " + timing.delay + "ms / duration " + timing.duration + "ms";   
            }
           
            var extractedEasing = SM.extractEasingCurve(transitionName, animationName);
            if(extractedEasing){
                timing.easing = extractedEasing.ease;
                timing.easingIndex = extractedEasing.easingIndex;
            }

            var imageToUpdate = findImageWithName('animationCurve', detailToUpdate)[0];
            if(imageToUpdate){
                updateFrame({
                    x: -(LEGENDLAYOUT.easeTileWidth * timing.easingIndex) + 1,
                    y:1
                }, imageToUpdate)
            }

        }
    }
}

SM.addTimelinePlayhead = function(animationName){
    var artboard = SM.animations[animationName].timelineArtboard;
    var rectangle = findShapeWithName('playhead', artboard)[0];
    var segments = filterLayersByName('timelineSegment', artboard.layers());
    // add playhead
    if(!rectangle){
        rectangle = artboard.addLayerOfType('rectangle');
        rectangle.frame().setWidth(2);
        rectangle.frame().setX(0);
        rectangle.setName('playhead');
        var rectangleFill = rectangle.style().fills().addNewStylePart();
        rectangleFill.color = MSColor.colorWithSVGString('#000000');
    }
    rectangle.frame().setHeight(artboard.frame().height());
    var lastSegment = segments[segments.length-1];
    var timelineEndX = lastSegment.frame().x() + lastSegment.frame().width();
    SM.animations[animationName].timelineTween = new TWEEN.Tween({x:0})
            .to({x:timelineEndX} , (timelineEndX * MSPERPIXEL))
            .onUpdate(function(){
                rectangle.frame().setX(this.x);
            })
            .onComplete(function(){
                rectangle.removeFromParent();
            });
}

SM.startPlayhead = function(animationName){
    SM.animations[animationName].timelineTween.start(SM.pluginStartTime);
}

SM.updateTimeline = function(animationName) {
    var animationKeyframes = SM.animations[animationName].keyframes;
    var segments = SM.animations[animationName].timelineArtboard.layers();
    segments = filterLayersByName('timelineSegment', segments);
    var prevSegment = null;
    // check for extra segments
    if(segments.length > (animationKeyframes.length-1)){
        // more segments than transitions -- delete extra
        var delta =  segments.length - (animationKeyframes.length-1);
        for(var d=0; d < delta; d++){
            var segmentToDelete = segments[segments.length - 1];
            [segmentToDelete removeFromParent];
            segments.pop();
            SM.animations[animationName].timelineArtboard.frame().setConstrainProportions(0);
            SM.animations[animationName].timelineArtboard.frame().subtractWidth(500);
        }
    }
    for( var k=1;k < animationKeyframes.length; k++){
        var keyframe = animationKeyframes[k];
        var timing = keyframe.timing;
        var transitionName = getTransitionName(animationName, k-1, k);
        // update segments
        if((k-1) > (segments.length - 1)){
            // no segment -- add new segment
            var x = timing.delay / MSPERPIXEL;
            var y = (k-1) * TIMELINELAYOUT.height + TIMELINELAYOUT.margin ;
            var width = timing.duration / MSPERPIXEL;
            var height = TIMELINELAYOUT.height; 
            if(prevSegment){
                var prevSegmentFrame = prevSegment.rect();
                x = prevSegmentFrame.origin.x + prevSegmentFrame.size.width + (timing.delay / 10);
                timing.startTime = x;

            }
            SM.animations[animationName].timelineArtboard.frame().setConstrainProportions(0);
            SM.animations[animationName].timelineArtboard.frame().addWidth(width + 100);
            prevSegment = SM.createTimelineSegment(x, y, width, height, k, transitionName, SM.animations[animationName].timelineArtboard);
        }
        else{
            // segment exists -- update animation config based on segment position
            var segment = segments[k-1]; // segment indexes are offset by 1
            var newTiming = SM.extractAnimationValues(prevSegment, segment);
            timing.delay = newTiming.delay;
            timing.duration = newTiming.duration;
            timing.startTime = newTiming.startTime;
            segment.setName(transitionName); 
            prevSegment = segment;

            // resizing timeline segments messes up text size
            var text = findTextWithName('timelineSegmentTitle', segment);
            text[0].stringValue = k + "";
            text[0].setFontSize(55);
            
        }
    }
    SM.matchTimelineHeightToLegendHeight(animationName);
    SM.addTimelinePlayhead(animationName);
}

SM.extractEasingCurve = function(transitionName, animationName){
    var artboard = SM.animations[animationName].timelineLegendArtboard;
    var group = findLayerGroupsWithName(transitionName, artboard)
    var imageLayers = findImageWithName('animationCurve', group[0]);
   
    if(imageLayers[0]){
        var selectorX =  imageLayers[0].frame().x();
        var selectorIndex = Math.abs(Math.round(selectorX/LEGENDLAYOUT.easeTileWidth));
        var curve = ANIMATIONCURVEOPTIONS[selectorIndex];
        if(curve.type == "popSpring"){
            var springConfig = SM.getPopSpringConfig(curve.name + " config", animationName);
            return { easingIndex: selectorIndex, ease:undefined, popSpring: springConfig }
        }
        else if (curve.type == "ease") {
            return { easingIndex: selectorIndex, ease:curve.ease, popSpring:undefined }
        }
        
    }
}

SM.extractAnimationValues = function(prev, current){
    var currentFrame = current.rect();
    var returnObj = {};

    if(prev){
        var prevFrame = prev.rect();
        returnObj.delay = Math.round((currentFrame.origin.x - (prevFrame.origin.x + prevFrame.size.width)) * MSPERPIXEL);
    }
    else {
        returnObj.delay = Math.round(currentFrame.origin.x * MSPERPIXEL);
    }
    returnObj.duration = Math.round(currentFrame.size.width * MSPERPIXEL);
    returnObj.startTime = Math.round(currentFrame.origin.x * MSPERPIXEL); 
    return returnObj; 
}

SM.getAnimationValuesFromTimelineArtboard = function(animationName, timelineArtboardName){
    // find the relevant artboards
    var timelineArtboard = getArtboardsWithNameInDocument(timelineArtboardName);
    var timelineLegendArtboard = getArtboardsWithNameInDocument(getLegendName(animationName));
    // save in animation config object
    SM.animations[animationName].timelineArtboard = timelineArtboard[0];
    SM.animations[animationName].timelineLegendArtboard = timelineLegendArtboard[0];
    SM.updateTimeline(animationName);
    SM.updateTimelineLegend(animationName);
}

SM.highlightTimelineFrame = function(transitionName, animationName){
    if(!SM.highlightedSegments[transitionName]){
        var artboard = SM.animations[animationName].timelineArtboard;
        var layers = findLayerGroupsWithName(transitionName, artboard);
        var shapes = findShapeWithName('timelineSegment', layers[0]);
        if(shapes[0]){
             updateShapeStyle({fill:TIMELINECOLORS.highlight}, shapes[0]);
             SM.highlightedSegments[transitionName] = true;
        }
    }
}

SM.unHighlightTimelineFrame = function(transitionName, animationName){
    if(SM.highlightedSegments[transitionName]){
        var artboard = SM.animations[animationName].timelineArtboard;
        var layers = findLayerGroupsWithName(transitionName, artboard);
        var shapes = findShapeWithName('timelineSegment', layers[0]);
        if(shapes[0]){
             updateShapeStyle({fill:TIMELINECOLORS.block}, shapes[0]);
             SM.highlightedSegments[transitionName] = false;
        }
    }
}

SM.highlightLegendName = function(transitionName, animationName){
    if(!SM.highlightedLegends[transitionName]){
        var artboard = SM.animations[animationName].timelineLegendArtboard;
        var layers = findLayerGroupsWithName(transitionName, artboard);
        var text = findTextWithName('animationInfo', layers[0]);
        if(text[0]){
             updateTextStyle({color:LEGENDCOLORS.highlight}, text[0]);
             SM.highlightedLegends[transitionName] = true;
        }
    }
}

SM.unHighlightLegendName = function(transitionName, animationName){
    if(SM.highlightedLegends[transitionName]){
        var artboard = SM.animations[animationName].timelineLegendArtboard;
        var layers = findLayerGroupsWithName(transitionName, artboard);
        var text = findTextWithName('animationInfo', layers[0]);
        if(text[0]){
             updateTextStyle({color:LEGENDCOLORS.info}, text[0]);
             SM.highlightedLegends[transitionName] = null;
        }
    }
}

SM.refreshAnimationTimeline = function(animationName){
    var timelineArtboardName = animationTimelineName(animationName);
    var timelineLegendArtboardName = getLegendName(animationName);
    //check for existing timeline artboard
    if(!artboardWithNameExistsInDocument(timelineArtboardName)){
        SM.initTimelineArtboard(animationName, timelineArtboardName);
    }
    if(!artboardWithNameExistsInDocument(timelineLegendArtboardName)){
        SM.initTimelineLegendArtboard(animationName, timelineLegendArtboardName);   
    }
    SM.getAnimationValuesFromTimelineArtboard(animationName, timelineArtboardName);
}

SM.refreshAnimationTimelines = function(){
    for(var animationName in SM.animations){
        if(SM.animations.hasOwnProperty(animationName)){
            SM.refreshAnimationTimeline(animationName);
        }
    }
}
