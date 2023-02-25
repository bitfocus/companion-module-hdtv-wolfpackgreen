import { CompanionVariableValues } from '@companion-module/base'
import { HdtvMatrixConfig } from './config'
import { InstanceBaseExt } from './utils'

export function updateVariables(instance: InstanceBaseExt<HdtvMatrixConfig>): void {
	const variables: CompanionVariableValues = {}

	instance.setVariableValues(variables)
}

export function initVariables(instance: InstanceBaseExt<HdtvMatrixConfig>): void {
	const variables: CompanionVariableValues = {}

	instance.setVariableValues(variables)
}
