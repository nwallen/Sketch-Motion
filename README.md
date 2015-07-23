#Sketch Motion Plugin
Plugin to quickly create, preview, and export animations ... in Sketch. 

**Warning**
Early proof-of-concept version tested in sketch 3.3.3 -- use at your own risk

## Installation
1. **[Download](https://github.com/nwallen/Sketch-Motion/archive/master.zip)** and unzip
2. Open Sketch and select `Plugins ▸ Reveal Plugins Folder...` from the menu bar
3. Copy the `Sketch Motion` directory into the plugins folder
4. Locate the `GIFX` file and double-click (if prompted, give GIFX permission to run)

## Usage

**Define Animation Keyframes**
 - Animations are referenced with "tags". A tag is any word wrapped in curly braces e.g. and animation called "loader" would use the tag `{loader}`
 - Tag the names of the artboards to include them as keyframes in an animation: e.g. artboards named `{loader} frame 1`, `{loader} frame 2` would compose a "loader" animation.
 - Tagged artboards play in alphabetical order based on their names
 - You may freely add and remove tagged artboards -- the plugin will adjust

**Create Transitions**
- Animation transitions are automatically created by comparing groups **with the same name** between tagged artboards
- Differences in these properties are animated :`position` `size` `rotation` `opacity`
- The name of the group does not matter -- just that it is identical on all tagged artboards
- Multiple groups with the same name on the same artboard are automatically given a unique name

**Add a Player & Preview Animations**
- Animations are played via "players". Create a player by tagging a group with the name of the animation you would like to play: e.g. renaming `myGroup ▸ myGroup {loader}` creates a player for the "loader" animation
- To play the animation select the artboard containing the tagged group by clicking its name. Then select `Plugins ▸ Motion ▸ Animate` from the Sketch toolbar or use the keyboard shortcut `control` + `⌘ command` + `a` 
- The animation will play. Two additional artboards will be added to your document (the "Timeline" and the "Legend") which you may use to adjust the animation
- You can add multiple players to an artboard -- for the same or different animations

**Adjust Timing with the Timeline**
- Each block on the timeline represents a transition between tagged artboards
- Edit the width of a block to change the duration of the transition `1 pixel = 1 millisecond`
- Adding spacing between blocks will add delay between animations `1 pixel = 1 millisecond` of delay
- The sequence of the animations cannot be changed on the timeline 

**Adjust Curves with the Legend**
- The legend lists all detected transitions in a single animation 
- To change the easing of an animation `⌘ command` + click the box showing the easing curve. Drag to the left or right. On previewing the animation, the new easing curve will be applied.

**Export a GIF**
- To export a GIF of an animation select an artboard containing a player(s) by clicking its name. Then select `Plugins ▸ Motion ▸ Export GIF` from the Sketch toolbar or use the keyboard shortcut `control` + `⌘ command` + `e` 
- Follow the prompts

## Release Notes

**0.1.0**
- [x] Animate position, size, opacity, and rotation of layer groups
- [x] Adjust animation delay and duration
- [x] Adjust animation easing curve
- [x] Preview animations in Sketch
- [x] Export GIFs of animations


## Feedback
Please add an issue to this repository to report problems or make suggestions for the development of this plugin. You can also find me on Twitter [@nawt](https://twitter.com/nawt)

## Props
- GIF Generation - Nathan Rutzky https://github.com/nathco/Generate-GIF
- Tweens - https://github.com/tweenjs/tween.js/
