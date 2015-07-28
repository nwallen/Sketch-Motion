// GIF Export
// Adapted from github.com/nathco/Generate-GIF

var gifFileManager;

SM.initGIFexport = function() {
    SM.gifx = pluginPath + "GIFX";
    SM.gifPath = SM.savePath();
    var tempPath = NSTemporaryDirectory();
    var string = [[NSProcessInfo processInfo] globallyUniqueString];
    SM.gifsetPath = [tempPath stringByAppendingPathComponent: string + @".gifset"];

    gifFileManager = [NSFileManager defaultManager]
    [gifFileManager createDirectoryAtPath:SM.gifsetPath withIntermediateDirectories:true attributes:nil error:nil]

    SM.gifSetIndex = 1;
}

SM.exportArtboardToGIFset = function(artboard){
    var artboardName = artboard.name();
    var gifFileComponent = numberPad(SM.gifSetIndex, 8) + ".png";
    var fileName = SM.gifsetPath.stringByAppendingPathComponent(gifFileComponent);
    [doc saveArtboardOrSlice:artboard toFile:fileName]
    SM.gifSetIndex ++;
}

SM.createGIF = function(fps, loops) {
    var loop = "-l";
    if(loops > 1 ) loop += (loops - 1)
    if(loops == 1 ) loop = "" 
    var delay = Math.round((1000/fps) / 10)
    var convertTask = [[NSTask alloc] init]
    var createsTask = [[NSTask alloc] init]
    var convertGIF = "find \"" + SM.gifsetPath + "\" -name '*.png' -exec sips -s format gif -o {}.gif {} \\;"
    var option = "find \"" + SM.gifsetPath + "\" -name '*.png.gif' -execdir bash -c '\"" + SM.gifx + "\" " + loop + " -d " +  delay + " '*.png.gif' -o \"" + SM.gifPath + "\"' \\;"

    [doc showMessage:@"Saving GIF..."]

    [convertTask setLaunchPath:@"/bin/bash"]
    [convertTask setArguments:["-c", convertGIF]]
    [convertTask launch]
    [convertTask waitUntilExit]
    [createsTask setLaunchPath:@"/bin/bash"]
    [createsTask setArguments:["-c", option]]
    [createsTask launch]
    [createsTask waitUntilExit]

    if ([createsTask terminationStatus] == 0) {
        
        [doc showMessage:@"Export Complete..."]
        
    } else {
        
        var error = [[NSTask alloc] init]
        
        [error setLaunchPath:@"/bin/bash"]
        [error setArguments:["-c", "afplay /System/Library/Sounds/Basso.aiff"]]
        [error launch]
        [doc showMessage:@"Export Failed..."]
    } 
 
    [gifFileManager removeItemAtPath:SM.gifsetPath error:nil]  
}

SM.exportOptionsDialog = function(){
    var alert = COSAlertWindow.new();
    alert.setMessageText("GIF export options");
    // FPS
    alert.addTextLabelWithValue("Framerate (FPS)");
    alert.addTextFieldWithValue("30");
    alert.addTextLabelWithValue("higher is smoother, but exports a larger file");
    alert.addTextLabelWithValue("");
    // Loops
    alert.addTextLabelWithValue("Number of Loops");
    alert.addTextFieldWithValue("0");
    alert.addTextLabelWithValue("enter 0 to loop FOREVER");
    alert.addTextLabelWithValue("");

    alert.runModal();

    return { fps: parseInt(alert.viewAtIndex(1).stringValue()), loops: parseInt(alert.viewAtIndex(5).stringValue()) }
}

SM.savePath =  function() {
    var filePath = [doc fileURL] ? [[[doc fileURL] path] stringByDeletingLastPathComponent] : @"~"
    var fileName = [[doc displayName] stringByDeletingPathExtension]
    var savePanel = [NSSavePanel savePanel]
    
    [savePanel setTitle:@"Export Animated GIF"]
    [savePanel setNameFieldLabel:@"Export To:"]
    [savePanel setPrompt:@"Export"]
    [savePanel setAllowedFileTypes: [NSArray arrayWithObject:@"gif"]]
    [savePanel setAllowsOtherFileTypes:false]
    [savePanel setCanCreateDirectories:true]
    [savePanel setDirectoryURL:[NSURL fileURLWithPath:filePath]]
    [savePanel setNameFieldStringValue:fileName]

    if ([savePanel runModal] != NSOKButton) {
        exit
    } 
    
    return [[savePanel URL] path]
}