import { Regex, SomeCompanionConfigField } from '@companion-module/base'

export interface HdtvMatrixConfig {
	host: string
	port: number
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
			step: 1
		},
	]
}
