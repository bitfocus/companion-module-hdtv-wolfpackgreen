# companion-module-hdtv-wolfpackgreen

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Example Configuration

You can download an example configuration that is setup for all of the commands at [this link](https://raw.githubusercontent.com/bitfocus/companion-module-hdtv-wolfpackgreen/main/examples/HDTV%20Companion%20Example%20Configuration.companionconfig) and then right-click and Save As.

The pages in the configuration are 95-99. The first button on pages 96-99 will take the action on the button on press and release but if you long press the button it will navigate to page 95. For page 99, there is a long press for buttons 1-3 to navigate to page 95, apply the selected outputs and clear the selected outputs.

Note: You will need to enable Companion OSC Listener in the Settings for the navigation buttons to work at they use generic OSC commands /press/bank/X Page/X button

## Color Explanation

When using the presets for the Select Input or Select Output, you will see several colors that they do have meaning.

Input Background Colors:

- Blue - currently has an output routed to it in the matrix. Click on it to see the output mapped to it.
- Red - new output is set to be applied to Matrix when you run the apply selections command
- Green - currently selected input

Output Background Colors:

- Light Blue - currently mapped to an input
- Red - will be mapped to a new output when you run the apply selections command
- Green - currently a selected output for the currently selected input
- Grayish Green - currently routes in the matrix to the selected input

## Recent Patches

## v1.0.2

- fixed label refresh

## v1.0.1

- fixed infinite loop in the refresh of routes

## v1.0.0

- Added new commands:
  - Refresh Matrix Routes
- Added Recall/Save Layout Matrix labels to Companion variables
- Added preset for Refresh Matrix Routes
- Added refresh pf routes from Matrix as needed for commands: unset, set input/output, send command, recall layout, and apply selections.
- Replaced ability to auto refresh matrix routes with a manual refresh. Auto refresh was unneeded network traffic if you are controlling matrix through Companion.
- Updated preset buttons to use the Matrix Label Variables. Button start with Unset Out, Select In, Select Out, Save Layout, and Recall Layout
- Updated input, output, and feedback dropdown selections for input or output to use the labels from the Matrix
- Updated example configuration with the new preset buttons. Note that you will see on Page 95 second row 3 buttons (Save Layout, Unset Out, and Select In) that are triggers by the 1st button on their respective pages when short pressed.

## v0.4.0

- Added new commands:
  - Refresh Matrix Labels
- Added Get Matrix Current Selections and Refresh Them Every X Seconds
- Added Get Matrix Labels and make them variables
- Added preset for Refresh Matrix Labels

## v0.3.0

- Added new commands:
  - Save Layout
  - Recall Layout
  - Unset Output
  - Unset All Output
- Added presets for new commands
- Added example configuration in the Examples folder
- Added new commands to help document
- Added example configuration info to help document

## v0.2.0

- Added feedback to show selected inputs and outputs
- Added feedback to show selected output for input
- Allow de-selecting of output for input
- When clicking already selected output remove it from the previous input
- Add SendCommand to allow you to send a command directly to the matrix
- Changed module name from hdtv-hdmimatrix to hdtv-wolfpackgreen

### V0.1.0

- initial revision
- includes Set Outputs, Select Input, Select Output, and Apply Outputs
- support for HDTVFIX1600AE for TCP commands in format of 1x1.1x2.1x3. to set input 1 to output 2,3,4
