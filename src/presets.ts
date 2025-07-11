import { combineRgb, CompanionButtonPresetDefinition, CompanionPresetDefinitions } from '@companion-module/base'
import { ActionId } from './actions.js'
import { FeedbackId } from './feedback.js'
import { InstanceBaseExt } from './utils.js'
import { HdtvMatrixConfig } from './config.js'

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
export function GetPresetList(instance: InstanceBaseExt<HdtvMatrixConfig>): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitionsExt = {}

	presets[`Apply_Outputs`] = {
		type: 'button',
		category: 'Actions',
		name: `Apply All Selections`,
		style: {
			text: `Apply All Selections`,
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

	presets[`Refresh_Labels`] = {
		type: 'button',
		category: 'Actions',
		name: `Refresh Matrix Labels`,
		style: {
			text: `Refresh Matrix Variables`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.refreshLabels, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`Refresh_Selections`] = {
		type: 'button',
		category: 'Actions',
		name: `Refresh Matrix Routes`,
		style: {
			text: `Refresh Matrix Routes`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.refreshRoutes, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`Send_Command`] = {
		type: 'button',
		category: 'Actions',
		name: `Send Custom Command`,
		style: {
			text: `Send Custom Command`,
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

	presets[`Unset_All_Output`] = {
		type: 'button',
		category: 'Actions',
		name: `Unset All Outputs`,
		style: {
			text: `Unset All Outputs`,
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [{ actionId: ActionId.unsetAll, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	for (let index = 1; index <= instance.model.inputCount; index++) {
		presets[`Select_Input_${index}`] = {
			type: 'button',
			category: 'Inputs',
			name: `Select $(hdtv:InputLabel${index})`,
			style: {
				text: `Select $(hdtv:InputLabel${index})`,
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

	for (let index = 1; index <= instance.model.outputCount; index++) {
		presets[`Select_Output_${index}`] = {
			type: 'button',
			category: 'Outputs',
			name: `Select $(hdtv:OutputLabel${index})`,
			style: {
				text: `Select $(hdtv:OutputLabel${index})`,
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

	for (let index = 1; index <= instance.model.outputCount; index++) {
		presets[`Unselect_Output_${index}`] = {
			type: 'button',
			category: 'Unset Outputs',
			name: `Unset $(hdtv:OutputLabel${index})`,
			style: {
				text: `Unset $(hdtv:OutputLabel${index})`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.unsetOutput,
							options: { output: index.toString() },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	for (let index = 1; index <= instance.model.recallSaveCount; index++) {
		presets[`Save_${index}`] = {
			type: 'button',
			category: 'Save Layout',
			name: `Save $(hdtv:RecallSaveLabel${index})`,
			style: {
				text: `Save $(hdtv:RecallSaveLabel${index})`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.save,
							options: { saveLayout: index.toString() },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets[`Recall_${index}`] = {
			type: 'button',
			category: 'Recall Layout',
			name: `Recall $(hdtv:RecallSaveLabel${index})`,
			style: {
				text: `Recall $(hdtv:RecallSaveLabel${index})`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.recall,
							options: { recallLayout: index.toString() },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}
	return presets
}
