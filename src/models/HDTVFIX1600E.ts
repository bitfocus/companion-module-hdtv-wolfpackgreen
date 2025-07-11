import { type ModelSpec } from './types.js'
import { HdtvCommandFormat, HdtvVersion } from '../utils.js'
export const ModelSpec1600E: ModelSpec = {
	id: HdtvVersion.HDTVFIX1600E,
	label: 'HDTV-FIX1600E',
	inputCount: 16,
	outputCount: 16,
	recallSaveCount: 16,
	commandFormat: HdtvCommandFormat.AndSeparator,
}
