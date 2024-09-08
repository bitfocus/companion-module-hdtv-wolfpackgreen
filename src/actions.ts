import {
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
} from '@companion-module/base'
import { HdtvMatrixConfig } from './config.js'
import { FeedbackId, GetFeedbacks } from './feedback.js'
import { GetPresetList } from './presets.js'
import { arrayAddIfNotExist, arrayAddRemove, arrayRemove, HdtvVersion, InstanceBaseExt } from './utils.js'

export enum ActionId {
	setOutput = 'set_Output',
	selectInput = 'select_Input',
	selectOutput = 'select_Output',
	applyOutputs = 'apply_Outputs',
	clearSelected = 'clear_Selected',
	sendCommand = 'send_Command',
	unsetOutput = 'unselect_Output',
	unsetAll = 'unselect_All',
	save = 'save',
	recall = 'recall',
	refreshLabels = 'refresh_Labels',
	refreshRoutes = 'refresh_routes',
}

/**
 * Main function to create the actions
 * @param instance Give the instance so we can extract data
 * @returns CompanionActions
 */
export function GetActions(instance: InstanceBaseExt<HdtvMatrixConfig>): CompanionActionDefinitions {
	const INPUT_CHOICES = []
	const CHOICES_INPUT_DEFAULT = '1'
	const OUTPUT_CHOICES = []
	const SAVE_CHOICES = []
	const RECALL_CHOICES = []

	for (let index = 1; index < 17; index++) {
		OUTPUT_CHOICES.push({ id: index.toString(), label: `${instance.ExistingOutputLabels[index - 1]}` })
		INPUT_CHOICES.push({ id: index.toString(), label: `${instance.ExistingInputLabels[index - 1]}` })
		SAVE_CHOICES.push({ id: index.toString(), label: `Save ${instance.ExistingRecallSaveLabels[index - 1]}` })
		RECALL_CHOICES.push({ id: index.toString(), label: `Recall ${instance.ExistingRecallSaveLabels[index - 1]}` })
	}

	const CHOICES_END = [
		{ id: '', label: 'None' },
		{ id: '.', label: 'Period' },
		{ id: '\n', label: 'LF - \\n (Common UNIX/Mac)' },
		{ id: '\r\n', label: 'CRLF - \\r\\n (Common Windows)' },
		{ id: '\r', label: 'CR - \\r (Old MacOS)' },
		{ id: '\x00', label: 'NULL - \\x00 (Can happen)' },
		{ id: '\n\r', label: 'LFCR - \\n\\r (Just stupid)' },
	]

	const inputOption: CompanionInputFieldDropdown = {
		type: 'dropdown',
		label: 'Input',
		id: 'input',
		default: CHOICES_INPUT_DEFAULT,
		choices: INPUT_CHOICES,
	}

	const outputOption: CompanionInputFieldDropdown = {
		type: 'dropdown',
		label: 'Output',
		id: 'output',
		choices: OUTPUT_CHOICES,
		default: '1',
	}

	const outputOptions: CompanionInputFieldMultiDropdown = {
		type: 'multidropdown',
		label: 'Output',
		id: 'output',
		choices: OUTPUT_CHOICES,
		minChoicesForSearch: 0,
		default: [],
	}

	/**
	 * Run the TCP command to set the inputs to outputs
	 *
	 * @param {string} command - the command to run
	 */
	const sendActionCommand = (command: string): void => {
		if (command !== '') {
			/*
			 * create a binary buffer pre-encoded 'latin1' (8bit no change bytes)
			 * sending a string assumes 'utf8' encoding
			 * which then escapes character values over 0x7F
			 * and destroys the 'binary' content
			 */
			const sendBuf = Buffer.from(command, 'latin1')
			instance.log('info', `send command ${command} to ${instance.config.host}: ${sendBuf.toString()}`)

			if (instance.socket !== undefined && instance.socket.isConnected) {
				instance.socket.send(sendBuf)
			} else {
				instance.log('error', 'sendActionCommand: Socket not connected :(')
			}
		}
	}

	/**
	 * Format the TCP command for the HDTV version
	 *
	 * @param {string} input - the single input to set the outputs to
	 * @param {string[]} output - the list of outputs to set the input to
	 * @returns {string} - the command to run to set the input to the outputs
	 */
	const formatCommand = (input: string, outputs: string[]): string => {
		const inputValue = `${input}x`
		let command = ''
		if (outputs.length !== 0) {
			switch (instance.config.model) {
				case HdtvVersion.HDTVFIX1600AE as number: {
					// format: 1x1.1x2.1x3. to set input 1 to output 1,2,3
					outputs.forEach((output: string) => {
						command += `${inputValue}${output}.`
					})

					break
				}
				case HdtvVersion.HDTVFIX1600E as number: {
					// format: 1x1&2&3. to set input 1 to output 1,2,3
					command = `${inputValue}${outputs.join('&')}.`
					break
				}
				default:
					break
			}
		}

		return command
	}

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.setOutput]: {
			name: 'Set Output',
			options: [inputOption, outputOptions],
			callback: async (action) => {
				const input = `${action.options.input as string}x`
				const output = action.options.output as Array<string>
				const command = formatCommand(input, output)
				if (command !== '') {
					sendActionCommand(command)
					await instance.refreshMatrixRoutes()
					// TODO: Update in-memory variables instead of getting selection
				}
			},
		},
		[ActionId.selectInput]: {
			name: 'Select Input',
			options: [inputOption],
			callback: async (action) => {
				const inputNumber: string = action.options.input as string
				if (Object.prototype.hasOwnProperty.call(instance.InputOutput, inputNumber) === false) {
					instance.LastInput = inputNumber
					instance.InputOutput[inputNumber] = {
						input: inputNumber,
						output: [],
					}
				} else {
					instance.LastInput = inputNumber
				}

				instance.checkFeedbacks(FeedbackId.input, FeedbackId.output)
			},
		},
		[ActionId.selectOutput]: {
			name: 'Select Output for Input',
			options: [outputOption],
			callback: async (action) => {
				const inputNumber: string = instance.LastInput
				const outputNumber: string = action.options.output as string
				// REMOVE output for another input
				const outputInInput = Object.keys(instance.InputOutput).find(
					(k) => k !== inputNumber && instance.InputOutput[k].output.indexOf(outputNumber) > -1,
				)
				if (outputInInput !== undefined) {
					instance.InputOutput[outputInInput].output = arrayRemove(
						instance.InputOutput[outputInInput].output,
						outputNumber,
					)
				}

				if (Object.prototype.hasOwnProperty.call(instance.InputOutput, inputNumber)) {
					instance.InputOutput[inputNumber].output = arrayAddRemove(
						instance.InputOutput[inputNumber].output,
						outputNumber,
					)

					if (instance.InputOutput[inputNumber].output.indexOf(outputNumber) === -1) {
						instance.SelectedOutputs = arrayRemove(instance.SelectedOutputs, outputNumber)
					} else {
						instance.SelectedOutputs = arrayAddIfNotExist(instance.SelectedOutputs, outputNumber)
					}

					instance.checkFeedbacks(FeedbackId.output)
				}
			},
		},
		[ActionId.applyOutputs]: {
			name: 'Apply All Selections',
			options: [],
			callback: async () => {
				let command = ''
				for (const key in instance.InputOutput) {
					const input = instance.InputOutput[key]
					command += formatCommand(input.input, input.output)
				}

				if (command !== '') {
					sendActionCommand(command)
					await instance.clearSelections()
					await instance.refreshMatrixRoutesXTimes(3)
					// TODO: update instance instead of getting it from matrix since there is a delay with the matrix
				}
			},
		},
		[ActionId.clearSelected]: {
			name: 'Clear Selected',
			options: [],
			callback: async () => {
				await instance.clearSelections()
			},
		},
		[ActionId.sendCommand]: {
			name: 'Send Command',
			options: [
				{
					type: 'textinput',
					id: 'id_send',
					label: 'Command:',
					default: '',
					useVariables: true,
				},
				{
					type: 'dropdown',
					id: 'id_end',
					label: 'Command End Character:',
					default: '.',
					choices: CHOICES_END,
				},
			],
			callback: async (action) => {
				const command = await instance.parseVariablesInString(action.options.id_send as string)
				if (command !== '') {
					sendActionCommand(command)
					await instance.getMatrixSelections()
				}
			},
		},
		[ActionId.unsetOutput]: {
			name: 'Unset Output (Instant Action)',
			options: [outputOption],
			callback: async (action) => {
				const outputNumber: string = action.options.output as string
				const command = `0x${outputNumber}.`
				sendActionCommand(command)
				await instance.clearSelections()
				await instance.refreshMatrixRoutesXTimes(3)
				// TODO: update in-memory variables instead of calling get selections
			},
		},
		[ActionId.unsetAll]: {
			name: 'Unset All Output (Instant Action)',
			options: [],
			callback: async () => {
				const command = `0all.`
				sendActionCommand(command)
				await instance.clearSelections()
				await instance.refreshMatrixRoutesXTimes(3)
				// TODO: update in memory selection
			},
		},
		[ActionId.save]: {
			name: 'Save Layout',
			options: [
				{
					type: 'dropdown',
					label: 'Save Layout',
					id: 'saveLayout',
					default: CHOICES_INPUT_DEFAULT,
					choices: SAVE_CHOICES,
				},
			],
			callback: async (action) => {
				const saveLayout: string = action.options.saveLayout as string
				const command = `Save${saveLayout}.`
				sendActionCommand(command)
			},
		},
		[ActionId.recall]: {
			name: 'Load Saved Layout',
			options: [
				{
					type: 'dropdown',
					label: 'Recall Layout',
					id: 'recallLayout',
					default: CHOICES_INPUT_DEFAULT,
					choices: RECALL_CHOICES,
				},
			],
			callback: async (action) => {
				const recallLayout: string = action.options.recallLayout as string
				const command = `Recall${recallLayout}.`
				sendActionCommand(command)
				await instance.clearSelections()
				await instance.refreshMatrixRoutesXTimes(3)
			},
		},
		[ActionId.refreshLabels]: {
			name: 'Refresh Matrix Labels',
			options: [],
			callback: async () => {
				await instance.refreshMatrixLabels()
				instance.setActionDefinitions(GetActions(instance))
				instance.setPresetDefinitions(GetPresetList())
				instance.setFeedbackDefinitions(GetFeedbacks(instance))
			},
		},
		[ActionId.refreshRoutes]: {
			name: 'Refresh Matrix Routes',
			options: [],
			callback: async () => {
				await instance.refreshMatrixRoutes()
			},
		},
	}

	return actions
}
