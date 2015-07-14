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
    timelineLegendArtboard.setName(stripTagSymbols(animationName) + " transitions")
    var timelineLegendArtboardFrame = timelineLegendArtboard.rect();
    timelineLegendArtboardFrame.size.width = 500;
    timelineLegendArtboardFrame.size.height = animationKeyframes.length * 100;
    timelineLegendArtboardFrame.origin.x = artboardFrame.origin.x;
    timelineLegendArtboardFrame.origin.y = artboardFrame.origin.y + 160;
    timelineLegendArtboard.setRect(timelineLegendArtboardFrame);
    // add rectangle and text
    // ignores first keyframe
    var prevGroup = null;
    for( var k=1;k < animationKeyframes.length; k++){
        var keyframe = animationKeyframes[k];
        var timing = keyframe.timing;
        var transitionName = stripTagSymbols(animationKeyframes[k-1].layer.name()) + " > " + stripTagSymbols(animationKeyframes[k].layer.name());
        // group
        var group = timelineArtboard.addLayerOfType('group');
        group.setName(transitionName);
        // size & position
        var groupFrame = group.rect();
        if(prevGroup){
            var prevgroupFrame = prevGroup.rect();
            groupFrame.origin.x = prevgroupFrame.origin.x + prevgroupFrame.size.width + (timing.delay / 10);

        }
        else {
            groupFrame.origin.x = timing.delay / 10;
        }
        groupFrame.origin.y = 0;
        groupFrame.size.width = timing.duration / 10;
        groupFrame.size.height = 60;
        group.setRect(groupFrame)
        // keep reference for subsequent calculations
        prevGroup = group;
        // rectangle
        var rectangle = group.addLayerOfType('rectangle');
        var rectangleFill = rectangle.style().fills().addNewStylePart();
        rectangleFill.color = MSColor.colorWithSVGString('#CCCCCC')
        var rectangleBorder = rectangle.style().borders().addNewStylePart();
        rectangleBorder.color = MSColor.colorWithSVGString('#000000')
        rectangleFrame = rectangle.rect();
        rectangleFrame.size = group.rect().size;
        rectangle.setRect(rectangleFrame);
        // title text
        var text = group.addLayerOfType('text');
        text.stringValue =  k + "";
        text.fontSize = 40;
        text.textAlignment = 2;
        textFrame = text.rect();
        textFrame.size = group.rect().size;
        text.setRect(textFrame);
        //detail text
        var detail = timelineLegendArtboard.addLayerOfType('text');
        detail.stringValue =  k + ". ' " + transitionName + " ' \n delay " + timing.delay + "ms / duration " + timing.duration + "ms";
        detail.fontSize = 24;
        detailFrame = text.rect();
        detailFrame.origin.x = 20;
        detailFrame.origin.y = ((k-1) * 100) + 30;
        detailFrame.size.width = 480;
        detailFrame.size.height = 100;
        detail.setRect(detailFrame);
        
    }
    // add artboard to page
    doc.currentPage().addLayers([timelineArtboard, timelineLegendArtboard]);


}

var refreshAnimationTimeline = function(animationName) {
    var timelineArtboardName = animationTimelineName(animationName);
    //check for existing timeline artboard
    var timelineArtboard = null;
    var pages = doc.pages();
    for(var p=0; p < [pages count]; p++){
        var page = pages.objectAtIndex(p);
        var layers = page.children();
        for(var l=0; l < [layers count]; l++){
            var layer = layers.objectAtIndex(l);
            if(layer.isMemberOfClass(MSArtboardGroup) && layer.name() == timelineArtboardName){
                timelineArtboard = layer;
            }
        }
    }
    log(timelineArtboard);
    if(timelineArtboard){

    }
    else{
        initTimelineArtboard(animationName, timelineArtboardName);
    }

    //create a timeline
}

var refreshAnimationTimelines = function(){
    for(var animationConfig in animations){
        if(animations.hasOwnProperty(animationConfig)){
            refreshAnimationTimeline(animationConfig);
        }
    }
}