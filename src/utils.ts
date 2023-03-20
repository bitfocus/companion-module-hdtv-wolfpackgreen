import { InstanceBase } from '@companion-module/base'

type TimeFormat = 'hh:mm:ss' | 'hh:mm:ss.ms' | 'mm:ss' | 'mm:ss.ms'

// Force options to have a default to prevent sending undefined values
// type EnforceDefault<T, U> = Omit<T, 'default'> & { default: U }

// export interface Options {
// 	input: EnforceDefault<CompanionInputFieldDropdown, number>
// 	output: EnforceDefault<CompanionInputFieldMultiDropdown, Array<string>>
// }

/**
 * @param red 0-255
 * @param green 0-255
 * @param blue 0-255
 * @returns RGB value encoded for Companion Bank styling
 */
export const rgb = (red: number, green: number, blue: number): number => {
	return ((red & 0xff) << 16) | ((green & 0xff) << 8) | (blue & 0xff)
}

// export const options: Options = {
// 	input: {
// 		type: 'dropdown',
// 		label: 'Input Number',
// 		id: 'input',
// 		default: 1,
// 		choices: []
// 	},
// 	output: {
// 		type: 'multidropdown',
// 		label: 'Outputs',
// 		id: 'outputs',
// 		default: [],
// 		choices: []
// 	},
// }

export enum HdtvVersion {
	HDTVFIX1600AE = 0,
	HDTVFIX1600E = 1,
}

export const arrayAddIfNotExist = (arr: Array<string>, value: string): Array<string> => {
	// Find a index of the value (use this so we can use it for remove)
	const index = arr.findIndex((element) => element === value)
	// Create a temp array
	const tempArr = arr
	if (index === -1) {
		tempArr.push(value)
	}

	return tempArr
}

export const arrayRemove = (arr: Array<string>, value: string): Array<string> => {
	return arr.filter(function (element) {
		return element != value
	})
}

export const arrayAddRemove = (arr: Array<string>, value: string): Array<string> => {
	// Find a index of the value (use this so we can use it for remove)
	const index = arr.findIndex((element) => element === value)
	// Create a temp array
	const tempArr = arr
	if (index === -1) {
		tempArr.push(value)
		return tempArr
	} else {
		tempArr.splice(index, 1)
		return tempArr
	}
}

/**
 * @param time Time in miliseconds or seconds
 * @param interval Interval of the time value - 'ms' or 's'
 * @param format String formatting - 'hh:mm:ss', 'hh:mm:ss.ms', 'mm:ss', or 'mm:ss.ms'
 * @returns Formated time string
 */
export const formatTime = (time: number, interval: 'ms' | 's', format: TimeFormat): string => {
	const timeMS = time * (interval === 'ms' ? 1 : 1000)
	const padding = (value: number): string => (value < 10 ? '0' + value : value.toString())

	const hh = padding(Math.floor(timeMS / 360000))
	const mm = padding(Math.floor(timeMS / 60000) % 60)
	const ss = padding(Math.floor(timeMS / 1000) % 60)
	const ms = (timeMS % 1000) / 100

	const result = `${format.includes('hh') ? `${hh}:` : ''}${mm}:${ss}${format.includes('ms') ? `.${ms}` : ''}`
	return result
}

export const padding = (num: number, size: number): string => {
	let converted = num.toString()
	while (converted.length < size) converted = '0' + converted
	return converted
}

export interface InputOutputDataInterface {
	[input: string]: {
		input: string
		output: string[]
	}
}

export interface InstanceBaseExt<TConfig> extends InstanceBase<TConfig> {
	[x: string]: any
	config: TConfig
	socket: any
	LastInput: string
	SelectedOutputs: string[]
	InputOutput: InputOutputDataInterface
	ExistingInputOutput: InputOutputDataInterface
	ExistingSelectedOutputs: string[]
	ExistingLabels: string[]
	getMatrixLabels(): Promise<void>
}
