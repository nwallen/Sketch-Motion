// Manage timeline UI element
var highlightedLegends = {};
var highlightedSegments = {};

var createTimelineSegment = function(x, y, width, height, index, transitionName, timelineArtboard){
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
    var rectangleFill = rectangle.style().fills().addNewStylePart();
    rectangleFill.color = MSColor.colorWithSVGString('#FAFAFA');
    var rectangleBorder = rectangle.style().borders().addNewStylePart();
    rectangleBorder.color = MSColor.colorWithSVGString('#A6A6A6');
    rectangleFrame = rectangle.rect();
    rectangleFrame.size = group.rect().size;
    rectangle.setRect(rectangleFrame);
    // title text
    var text = group.addLayerOfType('text');
    text.setName('timelineSegmentTitle');
    text.stringValue =  index + "";
    text.fontPostscriptName = "HelveticaNeue-Bold";
    text.fontSize = 45;
    text.textColor = MSColor.colorWithSVGString('#A6A6A6');
    text.textAlignment = 2;
    textFrame = text.rect();
    textFrame.size = group.rect().size;
    text.setRect(textFrame);

    return group;
}

var initTimelineArtboard = function(animationName, timelineArtboardName){
    var animationKeyframes = animations[animationName].keyframes;
    var firstKeyframe = animationKeyframes[0].layer;
    var keyframeFrame = firstKeyframe.rect();
    // setup timeline artboard 
    var timelineArtboard = [MSArtboardGroup new];
    timelineArtboard.setName(timelineArtboardName);   
    var artboardFrame = timelineArtboard.rect();
    //artboardFrame.size.width = animationKeyframes.length * 500;
    artboardFrame.size.height = TIMELINEHEIGHT;
    artboardFrame.origin.x = keyframeFrame.origin.x;
    artboardFrame.origin.y = keyframeFrame.origin.y + keyframeFrame.size.height + 120; 
    timelineArtboard.setRect(artboardFrame);
    timelineArtboard.frame().setConstrainProportions(0);
    // save reference to artboards in animation config object
    animations[animationName].timelineArtboard = timelineArtboard;
    // add artboard to page
    doc.currentPage().addLayers([timelineArtboard]);
    // add segments and details
    updateTimeline(animationName);        
}

var initTimelineLegendArtboard = function(animationName, timelineArtboardName){
    var animationKeyframes = animations[animationName].keyframes;
    var firstKeyframe = animationKeyframes[0].layer;
    var keyframeFrame = firstKeyframe.rect();
    // setup timeline legend
    var timelineLegendArtboard = [MSArtboardGroup new];
    var timelineLegendArtboardName = getLegendName(animationName);
    timelineLegendArtboard.setName(timelineLegendArtboardName);
    var timelineLegendArtboardFrame = timelineLegendArtboard.rect();
    timelineLegendArtboardFrame.size.width = LEGENDLAYOUT.rowWidth + (LEGENDLAYOUT.margin * 3);
    timelineLegendArtboardFrame.size.height = LEGENDLAYOUT.margin;
    timelineLegendArtboardFrame.origin.x = keyframeFrame.origin.x;
    timelineLegendArtboardFrame.origin.y = keyframeFrame.origin.y + keyframeFrame.size.height + 300;
    timelineLegendArtboard.setRect(timelineLegendArtboardFrame);
    timelineLegendArtboard.frame().setConstrainProportions(0);
    // save reference to artboards in animation config object
    animations[animationName].timelineLegendArtboard = timelineLegendArtboard;
    // add artboard to page
    doc.currentPage().addLayers([timelineLegendArtboard]);
    // add segments and details
    updateTimelineLegend(animationName);        
}

var updateTimelineLegend = function(animationName){
     //log(pluginPath + RESOURCESPATH + ANIMATIONCURVEFILENAME);
    var animationKeyframes = animations[animationName].keyframes;
    var details = animations[animationName].timelineLegendArtboard.layers();
    var prevGroup = null;

    // check for extra details
    if(details.count() > (animationKeyframes.length-1)){
        // more details than transitions -- delete extra
        var delta =  details.count() - (animationKeyframes.length-1);
        for(var d=0; d < delta; d++){
            var detailToDelete = details.objectAtIndex(details.count() - 1);
            [detailToDelete removeFromParent];
            animations[animationName].timelineLegendArtboard.frame().setConstrainProportions(0);
            animations[animationName].timelineLegendArtboard.frame().subtractHeight(LEGENDLAYOUT.easeTileHeight + LEGENDLAYOUT.margin);
        }
    }
    for( var k=1;k < animationKeyframes.length; k++){
        var keyframe = animationKeyframes[k];
        var timing = keyframe.timing;
        var transitionName = getTransitionName(animationName, k-1, k);
        // update details
        if((k-1) > (details.count() - 1)){
            // no details -- add new detail set
            var group = animations[animationName].timelineLegendArtboard.addLayerOfType('group');
            updateFrame({
                x : LEGENDLAYOUT.margin,
                y : ((k-1) * (LEGENDLAYOUT.easeTileHeight + LEGENDLAYOUT.margin)) + LEGENDLAYOUT.margin,
                width : LEGENDLAYOUT.rowWidth,
                height : LEGENDLAYOUT.easeTileHeight
            }, group);
            group.setName (transitionName);

            var detail = group.addLayerOfType('text');
            detail.setName(transitionName);
            detail.stringValue =  k + ": " + transitionName + "\ndelay " + timing.delay + "ms / duration " + timing.duration + "ms";
            updateTextStyle({
                font: "HelveticaNeue-Bold",
                size: 30
            }, detail)
            updateFrame({
                x : LEGENDLAYOUT.easeTileWidth + LEGENDLAYOUT.margin,
                y : LEGENDLAYOUT.easeTileHeight * .25,
                width : LEGENDLAYOUT.rowWidth - LEGENDLAYOUT.easeTileWidth - (LEGENDLAYOUT.margin * 3)
            }, detail);

            var curve = group.addLayerOfType('group');
            curve.setName('curve');

            var curveMask = curve.addLayerOfType('rectangle');
            curveMask.setName('curveMask');
            updateFrame({
               width : LEGENDLAYOUT.easeTileWidth,
               height : LEGENDLAYOUT.easeTileHeight
            }, curveMask);
            curveMask.setHasClippingMask(true);

            var imagePath = pluginPath + RESOURCESPATH + ANIMATIONCURVEFILENAME;
            var image = addImage(imagePath, curve, "curve");

            animations[animationName].timelineLegendArtboard.frame().setConstrainProportions(0);
            animations[animationName].timelineLegendArtboard.frame().addHeight(LEGENDLAYOUT.easeTileHeight + LEGENDLAYOUT.margin)

        }
        else {
            var detailToUpdate = details.objectAtIndex(k - 1);
            detailToUpdate.setName(transitionName);
            var textToUpdate = findTextWithName(transitionName, detailToUpdate);
            textToUpdate[0].stringValue =  k + ": " + transitionName + "\ndelay " + timing.delay + "ms / duration " + timing.duration + "ms";
        }
    }
}

var addTimelinePlayhead = function(animationName, segments){
    var artboard = animations[animationName].timelineArtboard;
    var rectangle = findShapeWithName('playhead', artboard)[0];
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
    animations[animationName].timelineTween = new TWEEN.Tween({x:0})
            .to({x:timelineEndX} , (timelineEndX * MSPERPIXEL))
            .onUpdate(function(){
                rectangle.frame().setX(this.x);
            })
            .onComplete(function(){
                rectangle.frame().setX(0);
            });
}

var startPlayhead = function(animationName){
    animations[animationName].timelineTween.start();
}

var updateTimeline = function(animationName) {
    var animationKeyframes = animations[animationName].keyframes;
    var segments = animations[animationName].timelineArtboard.layers();
    segments = filterLayersByName('timelineSegment', segments);
    var prevSegment = null;
    // check for extra segments
    if(segments.length > (animationKeyframes.length-1)){
        // more segments than transitions -- delete extra
        var delta =  segments.length - (animationKeyframes.length-1);
        for(var d=0; d < delta; d++){
            var segmentToDelete = segments[segments.length - 1];
            [segmentToDelete removeFromParent];
            animations[animationName].timelineArtboard.frame().setConstrainProportions(0);
            animations[animationName].timelineArtboard.frame().subtractWidth(500);
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
            var y = 0;
            var width = timing.duration / MSPERPIXEL;
            var height = TIMELINEHEIGHT; 
            if(prevSegment){
                var prevSegmentFrame = prevSegment.rect();
                x = prevSegmentFrame.origin.x + prevSegmentFrame.size.width + (timing.delay / 10);

            }
            animations[animationName].timelineArtboard.frame().setConstrainProportions(0);
            animations[animationName].timelineArtboard.frame().addWidth(width + 100);
            prevSegment = createTimelineSegment(x, y, width, height, k, transitionName, animations[animationName].timelineArtboard);
        }
        else{
            // segment exists -- update animation config based on segment position
            var segment = segments[k-1]; // segment indexes are offset by 1
            var newTiming = extractAnimationValues(prevSegment, segment);
            timing.delay = newTiming.delay;
            timing.duration = newTiming.duration;
            segment.setName(transitionName); 
            prevSegment = segment;

            var text = findTextWithName('timelineSegmentTitle', segment);
            text[0].stringValue = k + "";
            text[0].setFontSize(45);
            
        }
    }
    if(segments.length > 0){
           addTimelinePlayhead(animationName, segments);
    }
}

var extractAnimationValues = function(prev, current){
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
    return returnObj; 
}

var getAnimationValuesFromTimelineArtboard = function(animationName, timelineArtboardName){
    // find the relevant artboards
    var timelineArtboard = getArtboardsWithNameInDocument(timelineArtboardName);
    var timelineLegendArtboard = getArtboardsWithNameInDocument(getLegendName(animationName));
    // save in animation config object
    animations[animationName].timelineArtboard = timelineArtboard[0];
    animations[animationName].timelineLegendArtboard = timelineLegendArtboard[0];
    updateTimeline(animationName);
    updateTimelineLegend(animationName);
}

var highlightTimelineFrame = function(transitionName, animationName){
    if(!highlightedSegments[transitionName]){
        var artboard = animations[animationName].timelineArtboard;
        var layers = findLayerGroupsWithName(transitionName, artboard);
        var shapes = findShapeWithName('timelineSegment', layers[0]);
        if(shapes[0]){
             updateShapeStyle({color:'#76F6B3'}, shapes[0]);
             highlightedSegments[transitionName] = true;
        }
    }
}

var unHighlightTimelineFrame = function(transitionName, animationName){
    if(highlightedSegments[transitionName]){
        var artboard = animations[animationName].timelineArtboard;
        var layers = findLayerGroupsWithName(transitionName, artboard);
        var shapes = findShapeWithName('timelineSegment', layers[0]);
        if(shapes[0]){
             updateShapeStyle({color:'#FAFAFA'}, shapes[0]);
             highlightedSegments[transitionName] = false;
        }
    }
}

var highlightLegendName = function(transitionName, animationName){
    if(!highlightedLegends[transitionName]){
        var artboard = animations[animationName].timelineLegendArtboard;
        var layers = findTextWithName(transitionName, artboard);
        if(layers[0]){
             updateTextStyle({color:'#76F6B3'}, layers[0]);
             highlightedLegends[transitionName] = true;
        }
    }
}

var unHighlightLegendName = function(transitionName, animationName){
    if(highlightedLegends[transitionName]){
        var artboard = animations[animationName].timelineLegendArtboard;
        var layers = findTextWithName(transitionName, artboard);
        if(layers[0]){
             updateTextStyle({color:'#000000'}, layers[0]);
             highlightedLegends[transitionName] = null;
        }
    }
}

var refreshAnimationTimeline = function(animationName){
    var timelineArtboardName = animationTimelineName(animationName);
    var timelineLegendArtboardName = getLegendName(animationName);
    //check for existing timeline artboard
    if(!artboardWithNameExistsInDocument(timelineArtboardName)){
        initTimelineArtboard(animationName, timelineArtboardName);
    }
    if(!artboardWithNameExistsInDocument(timelineLegendArtboardName)){
        initTimelineLegendArtboard(animationName, timelineLegendArtboardName);   
    }
    getAnimationValuesFromTimelineArtboard(animationName, timelineArtboardName);
}

var refreshAnimationTimelines = function(){
    for(var animationName in animations){
        if(animations.hasOwnProperty(animationName)){
            refreshAnimationTimeline(animationName);
        }
    }
}
