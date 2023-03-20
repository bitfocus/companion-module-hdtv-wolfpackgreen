import { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import { HdtvMatrixConfig } from './config'
import { InstanceBaseExt } from './utils'

export function updateVariables(instance: InstanceBaseExt<HdtvMatrixConfig>): void {
	const variables: CompanionVariableValues = {}

	for (let i = 0; i < 16; i++) {
		if (instance.ExistingLabels[i] == '' || instance.ExistingLabels[i] == undefined) {
			variables[`InputLabel${i + 1}`] = ''
		} else {
			variables[`InputLabel${i + 1}`] = instance.ExistingLabels[i]
		}
	}

	for (let i = 0; i < 16; i++) {
		if (instance.ExistingLabels[i + 16] == '' || instance.ExistingLabels[i + 16] == undefined) {
			variables[`OutputLabel${i + 1}`] = ''
		} else {
			variables[`OutputLabel${i + 1}`] = instance.ExistingLabels[i + 16]
		}
	}
	instance.setVariableValues(variables)
}

export function initVariablesDefinitions(instance: InstanceBaseExt<HdtvMatrixConfig>): void {
	const inputLabels = []
	const outputLabels = []
	for (let i = 1; i < 17; i++) {
		inputLabels.push({
			name: `Input Label ${i}`,
			variableId: `InputLabel${i}`,
		})

		outputLabels.push({
			name: `Output Label ${i}`,
			variableId: `OutputLabel${i}`,
		})
	}

	const inputLabelDef: Set<CompanionVariableDefinition> = new Set(inputLabels)
	const outputLabelDef: Set<CompanionVariableDefinition> = new Set(outputLabels)

	const variables = [...inputLabelDef, ...outputLabelDef]

	instance.setVariableDefinitions(variables)
}
