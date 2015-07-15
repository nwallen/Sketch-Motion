var MSPERPIXEL = 1; // number of ms that each pixel on the timeline represents
var TIMELINEHEIGHT = 60;

var createTimelineSegment = function(x, y, width, height, index, transitionName, timelineArtboard){
        // group
        var group = timelineArtboard.addLayerOfType('group');
        group.setName(transitionName);
        // size & position
        var groupFrame = group.rect();
        groupFrame.origin.x = x;
        groupFrame.origin.y = y;
        groupFrame.size.width = width;
        groupFrame.size.height = height;
        group.setRect(groupFrame)
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
    timelineLegendArtboardFrame.size.width = 1000;
    //timelineLegendArtboardFrame.size.height = animationKeyframes.length * 100;
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

var updateTimelineLegend = function(animationName) {
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
            animations[animationName].timelineLegendArtboard.frame().subtractHeight(100);
        }
    }
    for( var k=1;k < animationKeyframes.length; k++){
        var keyframe = animationKeyframes[k];
        var timing = keyframe.timing;
        var transitionName = getTransitionName(animationName, k-1, k);
        // update details
        if((k-1) > (details.count() - 1)){
            // no details -- add new detail set
            var detail = animations[animationName].timelineLegendArtboard.addLayerOfType('text');
            detail.stringValue =  k + ": " + transitionName + " / delay " + timing.delay + "ms / duration " + timing.duration + "ms";
            detail.fontSize = 30;
            detail.fontPostscriptName = "HelveticaNeue-Thin";
            detailFrame = detail.rect();
            detailFrame.origin.x = 20;
            detailFrame.origin.y = ((k-1) * 60) + 30;
            detailFrame.size.width = 950;
            detailFrame.size.height = 50;
            detail.setRect(detailFrame);
            animations[animationName].timelineLegendArtboard.frame().setConstrainProportions(0);
            animations[animationName].timelineLegendArtboard.frame().addHeight(70);
        }
        else {
            var detailToUpdate = details.objectAtIndex(k - 1);
            detailToUpdate.stringValue = k + ": " + transitionName + " / delay " + timing.delay + "ms / duration " + timing.duration + "ms";
        }
    }
}

var updateTimeline = function(animationName) {
    var animationKeyframes = animations[animationName].keyframes;
    var segments = animations[animationName].timelineArtboard.layers();
    var prevSegment = null;
    // check for extra segments
    if(segments.count() > (animationKeyframes.length-1)){
        // more segments than transitions -- delete extra
        var delta =  segments.count() - (animationKeyframes.length-1);
        for(var d=0; d < delta; d++){
            var segmentToDelete = segments.objectAtIndex(segments.count() - 1);
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
        if((k-1) > (segments.count() - 1)){
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
            var segment = segments.objectAtIndex(k-1); // segment indexes are offset by 1
            var newTiming = extractAnimationValues(prevSegment, segment);
            timing.delay = newTiming.delay;
            timing.duration = newTiming.duration;
            prevSegment = segment;

            var text = findTextWithName('timelineSegmentTitle', segment);
            text[0].setFontSize(45);
            
        }
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

var getAnimationValuesFromTimelineArtboard = function(animationName, timelineArtboardName) {
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
    var artboard = animations[animationName].timelineArtboard;
    var layers = findLayerGroupsWithName(transitionName, artboard);
    if(layers[0]){
         updateShapeFill('#76F6B3', 'timelineSegment', layers[0]);
    }
}

var unHighlightTimelineFrame = function(transitionName, animationName){
    var artboard = animations[animationName].timelineArtboard;
    var layers = findLayerGroupsWithName(transitionName, artboard);
    if(layers[0]){
        updateShapeFill('#FAFAFA', 'timelineSegment', layers[0]);
    }
}

var refreshAnimationTimeline = function(animationName) {
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
    for(var animationConfig in animations){
        if(animations.hasOwnProperty(animationConfig)){
            refreshAnimationTimeline(animationConfig);
        }
    }
}