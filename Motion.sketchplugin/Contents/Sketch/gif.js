// GIF Export
// Adapted from github.com/nathco/Generate-GIF

var gifx, gifPath, tempPath, string, gifsetPath;
var gifSetIndex;
var gifFileManager;
//var exportDebugPath;

var initGIFexport = function() {
    gifx = pluginPath + "GIFX";
    gifPath = savePath();
    tempPath = NSTemporaryDirectory();
    var string = [[NSProcessInfo processInfo] globallyUniqueString];
    gifsetPath = [tempPath stringByAppendingPathComponent: string + @".gifset"];

    gifFileManager = [NSFileManager defaultManager]
    [gifFileManager createDirectoryAtPath:gifsetPath withIntermediateDirectories:true attributes:nil error:nil]

    gifSetIndex = 1;
}

var exportArtboardToGIFset = function(artboard){
    var artboardName = artboard.name();
    var gifFileComponent = numberPad(gifSetIndex, 8) + ".png";
    var fileName = [gifsetPath stringByAppendingPathComponent: gifFileComponent]
    [doc saveArtboardOrSlice:artboard toFile:fileName]
    gifSetIndex ++;
}

var createGIF = function(fps, loops) {
    var loop = "-l";
    if(loops > 1 ) loop += (loops - 1)
    if(loops == 1 ) loop = "" 
    var delay = Math.round((1000/fps) / 10)
    var convertTask = [[NSTask alloc] init]
    var createsTask = [[NSTask alloc] init]
    var convertGIF = "find \"" + gifsetPath + "\" -name '*.png' -exec sips -s format gif -o {}.gif {} \\;"
    var option = "find \"" + gifsetPath + "\" -name '*.png.gif' -execdir bash -c '\"" + gifx + "\" " + loop + " -d " +  delay + " '*.png.gif' -o \"" + gifPath + "\"' \\;"

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
 
    [gifFileManager removeItemAtPath:gifsetPath error:nil]  
}

var exportOptionsDialog = function(){
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

var savePath =  function() {
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