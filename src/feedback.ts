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
				// instance.log('debug', `feedback input: InputOutput - ${JSON.stringify(instance.InputOutput)}, Option: ${feedback.options.input}`)
				if (instance.LastInput === feedback.options.input) {
					return { bgcolor: combineRgb(0, 255, 0) }
				} else if (Object.prototype.hasOwnProperty.call(instance.InputOutput, feedback.options.input as string)) {
					return { bgcolor: combineRgb(255, 0, 0) }
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

				// instance.log('debug', `feedback output: SelectedOutputs - ${JSON.stringify(instance.SelectedOutputs)}`)
				// instance.log('debug', `LastInput - ${instance.LastInput}`)
				// instance.log('debug', `Option - ${feedback.options.output}`)
				// instance.log('debug', `IndexOf - ${instance.SelectedOutputs.indexOf(outputNumber)}`)

				if (
					instance.LastInput !== '' &&
					Object.prototype.hasOwnProperty.call(instance.InputOutput, instance.LastInput) &&
					instance.InputOutput[instance.LastInput].output.indexOf(outputNumber) > -1
				) {
					return { bgcolor: combineRgb(0, 255, 0) }
				} else if (instance.SelectedOutputs.indexOf(outputNumber) > -1) {
					return { bgcolor: combineRgb(255, 0, 0) }
				} else {
					return { bgcolor: combineRgb(0, 0, 0) }
				}
			},
		},
	}

	return feedbacks
}
