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
        rectangleFill.color = MSColor.colorWithSVGString('#CCCCCC')
        var rectangleBorder = rectangle.style().borders().addNewStylePart();
        rectangleBorder.color = MSColor.colorWithSVGString('#000000')
        rectangleFrame = rectangle.rect();
        rectangleFrame.size = group.rect().size;
        rectangle.setRect(rectangleFrame);
        // title text
        var text = group.addLayerOfType('text');
        text.setName('timelineSegmentIndex');
        text.stringValue =  index + "";
        text.fontSize = 40;
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
    artboardFrame.size.width = animationKeyframes.length * 500;
    artboardFrame.size.height = 60;
    artboardFrame.origin.x = keyframeFrame.origin.x;
    artboardFrame.origin.y = keyframeFrame.origin.y + keyframeFrame.size.height + 120; 
    timelineArtboard.setRect(artboardFrame);
    // setup timeline legend
    var timelineLegendArtboard = [MSArtboardGroup new];
    var timelineLegendArtboardName = getLegendName(animationName);
    timelineLegendArtboard.setName(timelineLegendArtboardName);
    var timelineLegendArtboardFrame = timelineLegendArtboard.rect();
    timelineLegendArtboardFrame.size.width = 500;
    timelineLegendArtboardFrame.size.height = animationKeyframes.length * 100;
    timelineLegendArtboardFrame.origin.x = artboardFrame.origin.x;
    timelineLegendArtboardFrame.origin.y = artboardFrame.origin.y + 160;
    timelineLegendArtboard.setRect(timelineLegendArtboardFrame);
    // save reference to artboards in animation config object
    animations[animationName].timelineArtboard = timelineArtboard;
    animations[animationName].timelineLegendArtboard = timelineLegendArtboard;
    // add artboard to page
    doc.currentPage().addLayers([timelineArtboard, timelineLegendArtboard]);

    updateTimeline(animationName);
    //     // timeline detail
    //     var detail = timelineLegendArtboard.addLayerOfType('text');
    //     detail.stringValue =  k + ". ' " + transitionName + " ' \n delay " + timing.delay + "ms / duration " + timing.duration + "ms";
    //     detail.fontSize = 24;
    //     detailFrame = detail.rect();
    //     detailFrame.origin.x = 20;
    //     detailFrame.origin.y = ((k-1) * 100) + 30;
    //     detailFrame.size.width = 480;
    //     detailFrame.size.height = 100;
    //     detail.setRect(detailFrame);
        
}

var updateTimeline = function(animationName) {
    var animationKeyframes = animations[animationName].keyframes;
    var segments = animations[animationName].timelineArtboard.layers();
    var prevGroup = null;
    if(segments.count() > (animationKeyframes.length-1)){
        // more segments than transitions -- delete extra
        var delta =  segments.count() - (animationKeyframes.length-1);
        for(var d=0; d < delta; d++){
            var segmentToDelete = segments.objectAtIndex(segments.count() - 1);
            [segmentToDelete removeFromParent];
        }
    }
    for( var k=1;k < animationKeyframes.length; k++){
        var keyframe = animationKeyframes[k];
        var timing = keyframe.timing;
        var transitionName = getTransitionName(animationName, k-1, k);
        if((k-1) > (segments.count() - 1)){
            // no segment -- add new segment
            var x = timing.delay / 10;
            var y = 0;
            var width = timing.duration / 10;
            var height = 60; 
            if(prevGroup){
                var prevgroupFrame = prevGroup.rect();
                x = prevgroupFrame.origin.x + prevgroupFrame.size.width + (timing.delay / 10);

            }
            prevGroup = createTimelineSegment(x, y, width, height, k, transitionName, animations[animationName].timelineArtboard);
        }
        else{
            // segment exists -- update animation config
            var segment = segments.objectAtIndex(k-1); // segment indexes are offset by 1
            prevGroup = segment;
            
        }
        
    }
}

var getAnimationValuesFromTimelineArtboard = function(animationName, timelineArtboardName) {
    // find the relevant artboards
    var timelineArtboard = getArtboardsWithNameInDocument(timelineArtboardName);
    var timelineLegendArtboard = getArtboardsWithNameInDocument(getLegendName(animationName));
    // save in animation config object
    animations[animationName].timelineArtboard = timelineArtboard[0];
    animations[animationName].timelineLegendArtboard = timelineLegendArtboard[0];
    updateTimeline(animationName);
}

var highlightTimelineFrame = function(transitionName, animationName){
    var artboard = animations[animationName].timelineArtboard;
    var layers = findLayerGroupsWithName(transitionName, artboard);
    if(layers[0]){
         updateShapeFill('#50E3C2', 'timelineSegment', layers[0]);
    }
}

var unHighlightTimelineFrame = function(transitionName, animationName){
    var artboard = animations[animationName].timelineArtboard;
    var layers = findLayerGroupsWithName(transitionName, artboard);
    if(layers[0]){
        updateShapeFill('#CCCCCC', 'timelineSegment', layers[0]);
    }
}

var refreshAnimationTimeline = function(animationName) {
    var timelineArtboardName = animationTimelineName(animationName);
    //check for existing timeline artboard
    if(artboardWithNameExistsInDocument(timelineArtboardName)){
        getAnimationValuesFromTimelineArtboard(animationName, timelineArtboardName);
    }
    else{
        initTimelineArtboard(animationName, timelineArtboardName);   
    }
}

var refreshAnimationTimelines = function(){
    for(var animationConfig in animations){
        if(animations.hasOwnProperty(animationConfig)){
            refreshAnimationTimeline(animationConfig);
        }
    }
}