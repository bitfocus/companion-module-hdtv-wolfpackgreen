import { DropdownChoice } from '@companion-module/base'
import { ModelSpec1600AE } from './HDTVFIX1600AE.js'
import { ModelSpec1600E } from './HDTVFIX1600E.js'
import { ModelSpec800E } from './HDTVFIX800E.js'
import { ModelSpec } from './types.js'
import { HdtvVersion } from '../utils.js'
import { ModelSpecAuto } from './default.js'

export * from './types.js'

export const ALL_MODELS: ModelSpec[] = [ModelSpec800E, ModelSpec1600AE, ModelSpec1600E]

export const ALL_MODEL_CHOICES: DropdownChoice[] = ALL_MODELS.map(({ id, label }) => ({ id, label }))
ALL_MODEL_CHOICES.sort((a, b) => {
	return (b.id as number) - (a.id as number)
})

export function GetModelSpec(id: HdtvVersion): ModelSpec | undefined {
	return ALL_MODELS.find((m) => m.id === id)
}

export function GetAutoDetectModel(): ModelSpec {
	return ModelSpecAuto
}
