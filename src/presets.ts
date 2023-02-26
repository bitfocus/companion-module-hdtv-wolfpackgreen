import { combineRgb, CompanionButtonPresetDefinition, CompanionPresetDefinitions } from '@companion-module/base'
import { ActionId } from './actions'
import { FeedbackId } from './feedback'

interface CompanionPresetExt extends CompanionButtonPresetDefinition {
	feedbacks: Array<
		{
			feedbackId: FeedbackId
		} & CompanionButtonPresetDefinition['feedbacks'][0]
	>
	steps: Array<{
		down: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['down'][0]
		>
		up: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['up'][0]
		>
	}>
}

interface CompanionPresetDefinitionsExt {
	[id: string]: CompanionPresetExt | undefined
}
export function GetPresetList(): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitionsExt = {}

	presets[`Apply_Outputs`] = {
		type: 'button',
		category: 'Actions',
		name: `Apply Outputs`,
		style: {
			text: `Apply Outputs`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.applyOutputs, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`Clear_Selected`] = {
		type: 'button',
		category: 'Actions',
		name: `Clear Selected`,
		style: {
			text: `Clear Selected`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.clearSelected, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`Send_Command`] = {
		type: 'button',
		category: 'Actions',
		name: `Send Command`,
		style: {
			text: `Send Command`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.sendCommand, options: { id_send: '', id_end: '.' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`Set_Output`] = {
		type: 'button',
		category: 'Actions',
		name: `Set Output`,
		style: {
			text: `Set Output`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.setOutput, options: { input: '1' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	for (let index = 1; index < 17; index++) {
		presets[`Select_Input_${index}`] = {
			type: 'button',
			category: 'Inputs',
			name: `Select Input ${index}`,
			style: {
				text: `Select Input ${index}`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.selectInput,
							options: { input: index.toString() },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FeedbackId.input,
					options: {
						input: index.toString(),
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}
	}

	for (let index = 1; index < 17; index++) {
		presets[`Select_Output_${index}`] = {
			type: 'button',
			category: 'Outputs',
			name: `Select Output ${index}`,
			style: {
				text: `Select Output ${index}`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.selectOutput,
							options: { output: index.toString() },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FeedbackId.output,
					options: {
						output: index.toString(),
					},
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}
	}
	return presets
}
