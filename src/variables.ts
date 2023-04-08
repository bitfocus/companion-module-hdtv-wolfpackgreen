import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { HdtvMatrixConfig } from './config'
import { InstanceBaseExt } from './utils'

export function updateVariables(instance: InstanceBaseExt<HdtvMatrixConfig>): void {
	const variables: CompanionVariableValues = {}
	instance.ExistingInputLabels = []
	instance.ExistingOutputLabels = []
	instance.ExistingRecallSaveLabels = []
	let offset = 0
	for (let i = 0; i < 16; i++) {
		if (instance.ExistingLabels[i + offset] == '' || instance.ExistingLabels[i + offset] == undefined) {
			variables[`InputLabel${i + 1}`] = `In ${i + 1}`
		} else {
			variables[`InputLabel${i + 1}`] = `In ${instance.ExistingLabels[i + offset]}`
		}

		instance.ExistingInputLabels.push(variables[`InputLabel${i + 1}`] as string)
	}

	instance.log('debug', `ExistingInputLabels: ${JSON.stringify(instance.ExistingInputLabels)}`)

	offset = 16
	for (let i = 0; i < 16; i++) {
		if (instance.ExistingLabels[i + offset] == '' || instance.ExistingLabels[i + offset] == undefined) {
			variables[`OutputLabel${i + 1}`] = `Out ${i + 1}`
		} else {
			variables[`OutputLabel${i + 1}`] = `Out ${instance.ExistingLabels[i + offset]}`
		}

		instance.ExistingOutputLabels.push(variables[`OutputLabel${i + 1}`] as string)
	}

	instance.log('debug', `ExistingOutputLabels: ${JSON.stringify(instance.ExistingOutputLabels)}`)

	offset = 32
	for (let i = 0; i < 16; i++) {
		if (instance.ExistingLabels[i + offset] == '' || instance.ExistingLabels[i + offset] == undefined) {
			variables[`RecallSaveLabel${i + 1}`] = `Layout ${i + 1}`
		} else {
			variables[`RecallSaveLabel${i + 1}`] = `Layout ${instance.ExistingLabels[i + offset]}`
		}

		instance.ExistingRecallSaveLabels.push(variables[`RecallSaveLabel${i + 1}`] as string)
	}

	instance.log('debug', `ExistingRecallSaveLabels: ${JSON.stringify(instance.ExistingRecallSaveLabels)}`)
	instance.setVariableValues(variables)
}

export function initVariablesDefinitions(instance: InstanceBaseExt<HdtvMatrixConfig>): void {
	const inputLabels = []
	const outputLabels = []
	const recallSaveLabels = []
	for (let i = 1; i < 17; i++) {
		inputLabels.push({
			name: `Input Label ${i}`,
			variableId: `InputLabel${i}`,
		})

		outputLabels.push({
			name: `Output Label ${i}`,
			variableId: `OutputLabel${i}`,
		})

		recallSaveLabels.push({
			name: `RecallSaveLabel ${i}`,
			variableId: `RecallSaveLabel${i}`,
		})
	}

	const inputLabelDef: Set<CompanionVariableDefinition> = new Set(inputLabels)
	const outputLabelDef: Set<CompanionVariableDefinition> = new Set(outputLabels)
	const recallSaveLabelDef: Set<CompanionVariableDefinition> = new Set(recallSaveLabels)

	const variables = [...inputLabelDef, ...outputLabelDef, ...recallSaveLabelDef]

	instance.setVariableDefinitions(variables)
}
