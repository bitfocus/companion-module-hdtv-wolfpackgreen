import {
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
} from '@companion-module/base'
import { HdtvMatrixConfig } from './config'
import { FeedbackId } from './feedback'
import { arrayAddIfNotExist, arrayAddRemove, arrayRemove, HdtvVersion, InstanceBaseExt } from './utils'

export enum ActionId {
	setOutput = 'set_Output',
	selectInput = 'select_Input',
	selectOutput = 'select_Output',
	applyOutputs = 'apply_Outputs',
	clearSelected = 'clear_Selected',
	sendCommand = 'send_Command',
}

/**
 * Main function to create the actions
 * @param instance Give the instance so we can extract data
 * @returns CompanionActions
 */
export function GetActions(instance: InstanceBaseExt<HdtvMatrixConfig>): CompanionActionDefinitions {
	const INPUT_CHOICES = []
	for (let index = 1; index < 17; index++) {
		INPUT_CHOICES.push({ id: index.toString(), label: `Input ${index}` })
	}

	const CHOICES_INPUT_DEFAULT = '1'
	const OUTPUT_CHOICES = []
	for (let index = 1; index < 17; index++) {
		OUTPUT_CHOICES.push({ id: index.toString(), label: `Output ${index}` })
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
		id: 'id_input',
		default: CHOICES_INPUT_DEFAULT,
		choices: INPUT_CHOICES,
	}

	const outputOption: CompanionInputFieldDropdown = {
		type: 'dropdown',
		label: 'Output',
		id: 'id_output',
		choices: OUTPUT_CHOICES,
		default: '1',
	}

	const outputOptions: CompanionInputFieldMultiDropdown = {
		type: 'multidropdown',
		label: 'Output',
		id: 'id_output',
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
		// Construct command
		if (command !== '') {
			/*
			 * create a binary buffer pre-encoded 'latin1' (8bit no change bytes)
			 * sending a string assumes 'utf8' encoding
			 * which then escapes character values over 0x7F
			 * and destroys the 'binary' content
			 */
			const sendBuf = Buffer.from(command, 'latin1')
			instance.log('debug', 'sendActionCommand: sending to ' + instance.config.host + ': ' + sendBuf.toString())

			if (instance.socket !== undefined && instance.socket.isConnected) {
				instance.socket.send(sendBuf)
			} else {
				instance.log('debug', 'sendActionCommand: Socket not connected :(')
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
		// instance.log('debug', `formatCommand input: ${input}`)
		// instance.log('debug', `formatCommand outputs: ${JSON.stringify(outputs)}, length: ${outputs.length}`)
		// instance.log('debug', `formatCommand: model - ${instance.config.model}, config: ${JSON.stringify(instance.config)}`)
		if (outputs.length !== 0) {
			switch (instance.config.model) {
				case HdtvVersion.HDTVFIX1600AE: {
					// format: 1x1.1x2.1x3. to set input 1 to output 1,2,3
					outputs.forEach((output: string) => {
						instance.log('debug', `formatCommand: output - ${output}`)

						command = `${command}${inputValue}${output}.`
					})

					return command
				}
				case HdtvVersion.HDTVFIX1600E: {
					// format: 1x1&2&3. to set input 1 to output 1,2,3
					command = `${inputValue}${outputs.join('&')}.`
					return command
				}
				default:
					return ''
			}
		}

		instance.log('debug', `formatCommand Command: ${command}`)
		return command
	}

	const clearSelected = (): void => {
		instance.InputOutput = {}
		instance.SelectedOutputs = []
		instance.LastInput = ''
		instance.checkFeedbacks(FeedbackId.input, FeedbackId.output)
	}

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.setOutput]: {
			name: 'Set Output',
			options: [inputOption, outputOptions],
			callback: async (action) => {
				instance.log('debug', `${JSON.stringify(action)}`)
				const input = `${action.options.id_input as string}x`
				const output = action.options.id_output as Array<string>
				const command = formatCommand(input, output)
				if (command !== '') {
					sendActionCommand(command)
				}
			},
		},
		[ActionId.selectInput]: {
			name: 'Select Input',
			options: [inputOption],
			callback: async (action) => {
				// instance.log('debug', `selectInput: action - ${JSON.stringify(action)}`)
				const inputNumber: string = action.options.id_input as string
				// instance.log('debug', `selectInput: inputNumber - ${inputNumber}`)
				if (Object.prototype.hasOwnProperty.call(instance.InputOutput, inputNumber) === false) {
					instance.LastInput = inputNumber
					instance.InputOutput[inputNumber] = {
						input: inputNumber,
						output: [],
					}
				} else {
					instance.LastInput = inputNumber
				}

				// instance.log('debug', `selectInput: LastInput - ${instance.LastInput}`)
				// instance.log('debug', `selectInput: instance.InputOutput - ${JSON.stringify(instance.InputOutput)}`)
				// instance.log('debug', `selectOutput: instance.SelectedOutputs - ${JSON.stringify(instance.SelectedOutputs)}`)
				instance.checkFeedbacks(FeedbackId.input, FeedbackId.output)
			},
		},
		[ActionId.selectOutput]: {
			name: 'Select Output',
			options: [outputOption],
			callback: async (action) => {
				// instance.log('debug', `selectOutput: action - ${JSON.stringify(action)}`)
				const inputNumber: string = instance.LastInput
				// instance.log('debug', `selectOutput: inputNumber - ${inputNumber}`)
				const outputNumber: string = action.options.id_output as string
				// instance.log('debug', `selectOutput: outputNumber - ${outputNumber}`)
				// REMOVE output for another input
				const outputInInput = Object.keys(instance.InputOutput).find(
					(k) => k !== inputNumber && instance.InputOutput[k].output.indexOf(outputNumber) > -1
				)
				// instance.log('debug', `outputInInput: ${JSON.stringify(outputInInput)}`)
				if (outputInInput !== undefined) {
					instance.InputOutput[outputInInput].output = arrayRemove(
						instance.InputOutput[outputInInput].output,
						outputNumber
					)
				}

				if (Object.prototype.hasOwnProperty.call(instance.InputOutput, inputNumber)) {
					instance.InputOutput[inputNumber].output = arrayAddRemove(
						instance.InputOutput[inputNumber].output,
						outputNumber
					)

					if (instance.InputOutput[inputNumber].output.indexOf(outputNumber) === -1) {
						instance.SelectedOutputs = arrayRemove(instance.SelectedOutputs, outputNumber)
					} else {
						instance.SelectedOutputs = arrayAddIfNotExist(instance.SelectedOutputs, outputNumber)
					}

					instance.checkFeedbacks(FeedbackId.output)
				}

				// instance.log('debug', `selectOutput: instance.SelectedOutputs - ${JSON.stringify(instance.SelectedOutputs)}`)
				// instance.log('debug', `selectOutput: instance.InputOutput - ${JSON.stringify(instance.InputOutput)}`)
			},
		},
		[ActionId.applyOutputs]: {
			name: 'Apply Outputs',
			options: [],
			callback: (): void => {
				// instance.log('debug', `applyOutputs: instance.InputOutput - ${JSON.stringify(instance.InputOutput)}`)
				for (const key in instance.InputOutput) {
					const input = instance.InputOutput[key]
					// instance.log('debug', `applyOutputs: single InputOutput - ${JSON.stringify(input)}`)

					const command = formatCommand(input.input, input.output)
					instance.log('debug', `applyOutputs: command - ${command}`)

					if (command !== '') {
						sendActionCommand(command)
					}
				}

				clearSelected()
			},
		},
		[ActionId.clearSelected]: {
			name: 'Claer Selected',
			options: [],
			callback: (): void => {
				clearSelected()
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
				// instance.log('debug', `${JSON.stringify(action)}`)
				const command = await instance.parseVariablesInString(action.options.id_send as string)
				if (command !== '') {
					sendActionCommand(command)
				}
			},
		},
	}

	return actions
}
