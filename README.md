# companion-module-hdtv-wolfpackgreen

See [HELP.md](./HELP.md) and [LICENSE](./LICENSE)

## Example Configuration

You can download an example configuration that is setup for all of the commands at [this link](https://raw.githubusercontent.com/bitfocus/companion-module-hdtv-wolfpackgreen/tree/main/companion/examples/HDTV) Companion Example Configuration.companionconfig and then right-click and Save As.

The pages in the configuration are 95-99. The first button on pages 96-99 will take the action on the button on press and release but if you long press the button it will navigate to page 95. For page 99, there is a long press for buttons 1-3 to navigate to page 95, apply the selected outputs and clear the selected outputs.

Note: You will need to enable Companion OSC Listener in the Settings for the navigation buttons to work at they use generic OSC commands /press/bank/X Page/X button

## Recent Patches

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
