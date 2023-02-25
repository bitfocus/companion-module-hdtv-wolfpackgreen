import {
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionActionEvent,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
} from '@companion-module/base'
import { HdtvMatrixConfig } from './config'
import { InstanceBaseExt } from './utils'

export enum ActionId {
	setOutput = 'set_Output',
	selectInput = 'select_Input',
	selectOutput = 'select_Output',
	applyOutputs = 'apply_Outputs',
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
		default: 1,
	}

	const outputOptions: CompanionInputFieldMultiDropdown = {
		type: 'multidropdown',
		label: 'Output',
		id: 'id_output',
		choices: OUTPUT_CHOICES,
		minChoicesForSearch: 0,
		default: [],
	}

	const sendActionCommand = (command: string, _info?: CompanionActionEvent | null): void => {
		// Construct command
		if (command !== '') {
			/*
			 * create a binary buffer pre-encoded 'latin1' (8bit no change bytes)
			 * sending a string assumes 'utf8' encoding
			 * which then escapes character values over 0x7F
			 * and destroys the 'binary' content
			 */
			// const sendBuf = Buffer.from(cmd + action.options.id_end, 'latin1')
			const sendBuf = Buffer.from(command, 'latin1')
			instance.log('debug', 'sending to ' + instance.config.host + ': ' + sendBuf.toString())

			if (instance.socket !== undefined && instance.socket.isConnected) {
				instance.socket.send(sendBuf)
			} else {
				instance.log('debug', 'Socket not connected :(')
			}
		}
	}

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.setOutput]: {
			name: 'Set Output',
			options: [inputOption, outputOptions],
			callback: async (action) => {
				// instance.log('debug', JSON.stringify(action))
				const input = `${await instance.parseVariablesInString(action.options.id_input as string)}x`
				if ((action.options.id_output as Array<number>).length !== 0) {
					let command = ''

					;(action.options.id_output as Array<number>).forEach((output: number) => {
						command = `${command}${input}${output}.`
					})

					sendActionCommand(command)
				}
			},
		},
		[ActionId.selectInput]: {
			name: 'Select Input',
			options: [inputOption],
			callback: async (action) => {
				// instance.log('debug', JSON.stringify(action))
				const inputNumber: string = action.options.id_input as string
				// instance.log('debug', inputNumber)
				if (Object.prototype.hasOwnProperty.call(instance.InputOutput, inputNumber) === false) {
					instance.LastInput = inputNumber
					instance.InputOutput[inputNumber] = {
						input: inputNumber,
						output: [],
					}
				}

				// instance.log('debug', `LastInput: ${instance.LastInput}`)
				// instance.log('debug', JSON.stringify(instance.InputOutput))
			},
		},
		[ActionId.selectOutput]: {
			name: 'Select Output',
			options: [outputOption],
			callback: async (action) => {
				// instance.log('debug', JSON.stringify(action))
				const inputNumber: string = instance.LastInput
				// instance.log('debug', inputNumber)
				const outputNumber: string = action.options.id_output as string
				// instance.log('debug', `outputNumber: ${outputNumber}`)

				if (Object.prototype.hasOwnProperty.call(instance.InputOutput, inputNumber)) {
					const index = instance.InputOutput[inputNumber].output.indexOf(outputNumber)
					// instance.log('debug', `index: ${index}`)
					if (index === -1) {
						instance.InputOutput[inputNumber].output.push(outputNumber)
					}
				}

				// instance.log('debug', JSON.stringify(instance.InputOutput))
			},
		},
		[ActionId.applyOutputs]: {
			name: 'Apply Outputs',
			options: [],
			callback: (): void => {
				// instance.log('debug', `action: ${JSON.stringify(action)}`)
				for (const key in instance.InputOutput) {
					const input = instance.InputOutput[key]
					const inputValue = `${input.input}x`

					// instance.log('debug', `input: ${JSON.stringify(input)}`)
					if (input.output.length !== 0) {
						let command = ''

						input.output.forEach((output: string) => {
							command = `${command}${inputValue}${output}.`
						})

						// instance.log('debug', `command: ${command}`)
						sendActionCommand(command)
					}
				}

				instance.InputOutput = {}
			},
		},
	}

	return actions
}
