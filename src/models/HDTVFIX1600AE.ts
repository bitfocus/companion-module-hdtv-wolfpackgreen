import { type ModelSpec } from './types.js'
import { HdtvCommandFormat, HdtvVersion } from '../utils.js'
export const ModelSpec1600AE: ModelSpec = {
	id: HdtvVersion.HDTVFIX1600AE,
	label: 'HDTV-FIX1600AE',
	inputCount: 16,
	outputCount: 16,
	recallSaveCount: 16,
	commandFormat: HdtvCommandFormat.PeriodSeparator,
}
