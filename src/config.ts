import { Regex, SomeCompanionConfigField } from '@companion-module/base'
import { HdtvVersion } from './utils'

export interface HdtvMatrixConfig {
	host: string
	port: number
	model: number
}

export const GetConfigFields = (): SomeCompanionConfigField[] => {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
			default: '192.168.1.80',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			default: 5000,
			min: 1,
			max: 65535,
			step: 1,
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'HDTV Model',
			choices: [
				{ id: HdtvVersion.HDTVFIX1600AE, label: HdtvVersion[HdtvVersion.HDTVFIX1600AE] },
				{ id: HdtvVersion.HDTVFIX1600E, label: HdtvVersion[HdtvVersion.HDTVFIX1600E] },
			],
			default: HdtvVersion.HDTVFIX1600AE,
			width: 6,
		},
	]
}
