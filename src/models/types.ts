import { HdtvCommandFormat, HdtvVersion } from '../utils.js'

export const MODEL_AUTO_DETECT = 0
export interface ModelSpec {
	id: HdtvVersion
	label: string
	inputCount: number
	outputCount: number
	recallSaveCount: number
	commandFormat: HdtvCommandFormat
}
