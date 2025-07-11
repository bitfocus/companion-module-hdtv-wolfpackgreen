import { MODEL_AUTO_DETECT, type ModelSpec } from './types.js'
import { HdtvCommandFormat } from '../utils.js'
export const ModelSpecAuto: ModelSpec = {
	id: MODEL_AUTO_DETECT,
	label: 'AUTO DETECT',
	inputCount: 16,
	outputCount: 16,
	recallSaveCount: 16,
	commandFormat: HdtvCommandFormat.PeriodSeparator,
}
