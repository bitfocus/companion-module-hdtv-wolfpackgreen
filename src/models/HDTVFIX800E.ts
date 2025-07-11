import { type ModelSpec } from './types.js'
import { HdtvCommandFormat, HdtvVersion } from '../utils.js'
export const ModelSpec800E: ModelSpec = {
	id: HdtvVersion.HDTVFIX800E,
	label: 'HDTV-FIX800E',
	inputCount: 8,
	outputCount: 8,
	recallSaveCount: 16,
	commandFormat: HdtvCommandFormat.PeriodSeparator,
}
