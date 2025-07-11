import {
	CompanionFeedbackDefinitions,
	CompanionFeedbackDefinition,
	combineRgb,
	CompanionInputFieldDropdown,
} from '@companion-module/base'
import { HdtvMatrixConfig } from './config.js'
import { InstanceBaseExt } from './utils.js'

export enum FeedbackId {
	input = 'input',
	output = 'output',
}

export function GetFeedbacks(instance: InstanceBaseExt<HdtvMatrixConfig>): CompanionFeedbackDefinitions {
	const INPUT_CHOICES = []
	for (let index = 1; index < instance.model.inputCount; index++) {
		INPUT_CHOICES.push({ id: index.toString(), label: `${instance.ExistingInputLabels[index - 1]}` })
	}

	const CHOICES_INPUT_DEFAULT = '1'
	const OUTPUT_CHOICES = []
	for (let index = 1; index < instance.model.outputCount; index++) {
		OUTPUT_CHOICES.push({ id: index.toString(), label: `${instance.ExistingOutputLabels[index - 1]}` })
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
				if (instance.LastInput === feedback.options.input) {
					return {
						bgcolor: combineRgb(0, 255, 0), // green
						color: combineRgb(0, 0, 0), // black
					} // green
				} else if (
					Object.prototype.hasOwnProperty.call(instance.InputOutput, feedback.options.input as string) &&
					instance.InputOutput[feedback.options.input as string].output.length > 0
				) {
					return {
						bgcolor: combineRgb(255, 0, 0), // red
						color: combineRgb(255, 255, 255), // white
					}
				} else if (
					Object.prototype.hasOwnProperty.call(instance.ExistingInputOutput, feedback.options.input as string) &&
					instance.ExistingInputOutput[feedback.options.input as string].output.length > 0
				) {
					return {
						bgcolor: combineRgb(0, 0, 255), // blue
						color: combineRgb(255, 255, 255), // white
					}
				} else {
					return {
						bgcolor: combineRgb(0, 0, 0), // black
						color: combineRgb(255, 255, 255), // white
					}
				}
			},
		},
		[FeedbackId.output]: {
			type: 'advanced',
			name: 'Selected Output feedback',
			description: 'Selected Output',
			options: [outputOption],
			callback: (feedback) => {
				const outputNumber: string = feedback.options.output as string

				if (
					instance.LastInput !== '' &&
					Object.prototype.hasOwnProperty.call(instance.InputOutput, instance.LastInput) &&
					instance.InputOutput[instance.LastInput].output.indexOf(outputNumber) > -1
				) {
					return {
						bgcolor: combineRgb(0, 255, 0), // green
						color: combineRgb(0, 0, 0), // white
					}
				} else if (instance.SelectedOutputs.indexOf(outputNumber) > -1) {
					return {
						bgcolor: combineRgb(255, 0, 0), //red
						color: combineRgb(255, 255, 255), // white
					}
				} else if (instance.ExistingSelectedOutputs.indexOf(outputNumber) > -1) {
					if (
						instance.LastInput !== '' &&
						Object.prototype.hasOwnProperty.call(instance.ExistingInputOutput, instance.LastInput) &&
						instance.ExistingInputOutput[instance.LastInput].output.indexOf(outputNumber) > -1
					) {
						return {
							bgcolor: combineRgb(51, 73, 49), // gray
							color: combineRgb(255, 255, 255), // white
						}
					} else {
						return {
							bgcolor: combineRgb(51, 153, 255), // blue
							color: combineRgb(0, 0, 0), // black
						}
					}
				} else {
					return {
						bgcolor: combineRgb(0, 0, 0), // black
						color: combineRgb(255, 255, 255), // white
					}
				}
			},
		},
	}

	return feedbacks
}
