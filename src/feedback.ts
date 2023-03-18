import {
	CompanionFeedbackDefinitions,
	CompanionFeedbackDefinition,
	combineRgb,
	CompanionInputFieldDropdown,
} from '@companion-module/base'
import { HdtvMatrixConfig } from './config'
import { InstanceBaseExt } from './utils'

export enum FeedbackId {
	input = 'input',
	output = 'output',
}

export function GetFeedbacks(instance: InstanceBaseExt<HdtvMatrixConfig>): CompanionFeedbackDefinitions {
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

	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.input]: {
			type: 'advanced',
			name: 'Selected Input feedback',
			description: 'Selected Input',
			options: [inputOption],
			callback: (feedback) => {
				// instance.log('debug', `Input: ${feedback.options.input}`)
				// instance.log('debug', `Feedback.Input: ExistingSelectedOutputs - ${JSON.stringify(instance.ExistingSelectedOutputs)}`)
				// instance.log('debug', `feedback input: InputOutput - ${JSON.stringify(instance.InputOutput)}, Option: ${feedback.options.input}`)

				// instance.log('debug', `feedback input: ExistingInputOutput: ${JSON.stringify(instance.ExistingInputOutput)}}`)

				// instance.log('debug',`feedback input: ExistingSelectedOutput: ${JSON.stringify(instance.ExistingSelectedOutputs)}}`)

				// instance.log(
				// 	'debug',
				// 	`Has Property: ${Object.prototype.hasOwnProperty.call(instance.ExistingInputOutput, feedback.options.input as string)}`
				// )

				// instance.log(
				// 	'debug',
				// 	`Has Feedback: Length - ${instance.ExistingInputOutput[feedback.options.input as string].output.length} ${
				// 		JSON.stringify(instance.ExistingInputOutput[feedback.options.input as string].output)
				// 	}`
				// )
				if (instance.LastInput === feedback.options.input) {
					return { bgcolor: combineRgb(0, 255, 0) }
				} else if (
					Object.prototype.hasOwnProperty.call(instance.InputOutput, feedback.options.input as string) &&
					instance.InputOutput[feedback.options.input as string].output.length > 0
				) {
					return { bgcolor: combineRgb(255, 0, 0) }
				} else if (
					Object.prototype.hasOwnProperty.call(instance.ExistingInputOutput, feedback.options.input as string) &&
					instance.ExistingInputOutput[feedback.options.input as string].output.length > 0
				) {
					return { bgcolor: combineRgb(0, 0, 255) }
				} else {
					return { bgcolor: combineRgb(0, 0, 0) }
				}
			},
		},
		[FeedbackId.output]: {
			type: 'advanced',
			name: 'Selected Output feedback',
			description: 'Selected Output',
			options: [outputOption],
			callback: (feedback) => {
				// instance.log('debug', `feedback output: feedback - ${JSON.stringify(feedback)}`)
				const outputNumber: string = feedback.options.output as string
				// instance.log('debug', `LastInput - ${instance.LastInput}`)
				// instance.log('debug', `Option - ${outputNumber}`)
				// instance.log('debug', `feedback output: ExistingSelectedOutputs - ${JSON.stringify(instance.ExistingSelectedOutputs)}`)

				// if (outputNumber === '11') {
				// 	// instance.log('debug', `feedback output: SelectedOutputs - ${JSON.stringify(instance.SelectedOutputs)}`)
				// 	// instance.log('debug', `IndexOf - ${instance.SelectedOutputs.indexOf(outputNumber)}`)
				// 	instance.log(
				// 		'debug',
				// 		`Existing IndexOf - ${instance.ExistingInputOutput[instance.LastInput].output.indexOf(outputNumber)}`
				// 	)
				// }

				if (
					instance.LastInput !== '' &&
					Object.prototype.hasOwnProperty.call(instance.InputOutput, instance.LastInput) &&
					instance.InputOutput[instance.LastInput].output.indexOf(outputNumber) > -1
				) {
					return { bgcolor: combineRgb(0, 255, 0) }
				} else if (instance.SelectedOutputs.indexOf(outputNumber) > -1) {
					return { bgcolor: combineRgb(255, 0, 0) }
				} else if (instance.ExistingSelectedOutputs.indexOf(outputNumber) > -1) {
					if (
						instance.LastInput !== '' &&
						Object.prototype.hasOwnProperty.call(instance.ExistingInputOutput, instance.LastInput) &&
						instance.ExistingInputOutput[instance.LastInput].output.indexOf(outputNumber) > -1
					) {
						return { bgcolor: combineRgb(51, 73, 49) }
					} else {
						return { bgcolor: combineRgb(0, 0, 255) }
					}
				} else {
					return { bgcolor: combineRgb(0, 0, 0) }
				}
			},
		},
	}

	return feedbacks
}
