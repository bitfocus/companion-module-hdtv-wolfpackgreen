import {
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
	TCPHelper,
} from '@companion-module/base'
import { GetConfigFields, HdtvMatrixConfig } from './config.js'
import { GetActions } from './actions.js'
import { arrayAddIfNotExist, arrayAddRemove, InputOutputDataInterface } from './utils.js'
import { FeedbackId, GetFeedbacks } from './feedback.js'
import { GetPresetList } from './presets.js'
import { got } from 'got-cjs'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'
import { initVariablesDefinitions, updateVariables } from './variables.js'

/**
 * @description Companion instance class for Zoom
 */
class HdtvMatrixInstance extends InstanceBase<HdtvMatrixConfig> {
	public InputOutput: InputOutputDataInterface = {}
	public ExistingInputOutput: InputOutputDataInterface = {}
	public ExistingSelectedOutputs: string[] = []
	public LastInput = ''
	public SelectedOutputs: string[] = []
	private pingIntervalTimer: any
	public ExistingLabels: string[] = []
	public ExistingInputLabels: string[] = []
	public ExistingOutputLabels: string[] = []
	public ExistingRecallSaveLabels: string[] = []
	public socket: TCPHelper | null = null
	private refreshMatrixSelectionsCounter = 0

	public config: HdtvMatrixConfig = {
		host: '',
		port: 0,
		model: 0,
	}

	/**
	 * @description constructor
	 * @param internal
	 */
	constructor(internal: unknown) {
		super(internal)
		// this.instanceOptions.disableVariableValidation = true
	}

	/**
	 * @description triggered on instance being enabled
	 * @param config
	 */
	public async init(config: HdtvMatrixConfig): Promise<void> {
		this.log('info', `Welcome, HDTV HDMI Matrix module is being initialized`)
		await this.configUpdated(config)

		return Promise.resolve()
	}

	public async refreshMatrixLabels() {
		const url = `http://${this.config.host}/mark.shtml`
		//http://192.168.8.80/mark.shtml
		const headers = {}
		const options = {
			https: {
				rejectUnauthorized: true,
			},
			headers,
		}
		try {
			this.log('info', 'Refresh Matrix Labels')
			await got.get(url, options).then((res) => {
				const data: any = res.body

				// eslint-disable-next-line
				let mark = ''
				eval(data)
				this.ExistingLabels = mark.replace('%20', ' ').split(';')

				updateVariables(this)
			})
		} catch (error: any) {
			this.log('error', `getMatrixLabel: error - Err parsing data ${error}`)
			return
		}
	}

	public async refreshMatrixRoutes() {
		const url = `http://${this.config.host}/sysctl.shtml`
		//http://192.168.8.80/sysctl.shtml
		const headers = {}
		const options = {
			https: {
				rejectUnauthorized: true,
			},
			headers,
		}
		// labels: http://192.168.8.80/mark.shtml
		try {
			this.log('info', 'Refreshing Matrix Routes')

			await got.get(url, options).then((res) => {
				const data: any = res.body

				// eslint-disable-next-line
				let map = [1, 2, 3, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
				// eslint-disable-next-line
				let edid = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				// eslint-disable-next-line
				let hpdi = 0
				// eslint-disable-next-line
				let hpdo = 0

				eval(data)

				this.ExistingInputOutput = {}
				this.ExistingSelectedOutputs = []
				for (let index = 1; index < 17; index++) {
					this.ExistingInputOutput[index] = {
						input: index.toString(),
						output: [],
					}
				}

				for (let index = 0; index < map.length; index++) {
					const outputNumber: string = (index + 1).toString()
					const inputNumber: string = (map[index] + 1).toString() // This is the value of the input that the output is going to
					if (map[index] !== 255) {
						this.ExistingSelectedOutputs = arrayAddIfNotExist(this.ExistingSelectedOutputs, outputNumber)

						if (Object.prototype.hasOwnProperty.call(this.ExistingInputOutput, inputNumber) === false) {
							this.ExistingInputOutput[inputNumber + 1] = {
								input: inputNumber,
								output: [],
							}
						} else if (Object.prototype.hasOwnProperty.call(this.ExistingInputOutput, inputNumber)) {
							this.ExistingInputOutput[inputNumber].output = arrayAddRemove(
								this.ExistingInputOutput[inputNumber].output,
								outputNumber,
							)
						}
					}
				}

				this.checkFeedbacks(FeedbackId.input, FeedbackId.output)
			})
		} catch (error: any) {
			this.log('error', `Refresh Matrix Routes: error - Err parsing data ${error}`)
			return
		}
	}

	public async refreshMatrixRoutesXTimes(numberOfTimes: number) {
		this.refreshMatrixSelectionsCounter = 0
		if (this.pingIntervalTimer) {
			this.log('debug', 'Clearing Route Refresh Timer')
			await clearIntervalAsync(this.pingIntervalTimer)
		}

		this.pingIntervalTimer = setIntervalAsync(async () => {
			this.refreshMatrixSelectionsCounter += 1
			this.log('info', `Refreshing Matrix Routes ${this.refreshMatrixSelectionsCounter} of ${numberOfTimes}`)
			if (this.refreshMatrixSelectionsCounter >= numberOfTimes) {
				await clearIntervalAsync(this.pingIntervalTimer)
			}

			await this.refreshMatrixRoutes()
		}, 2000)
	}

	public async clearSelections() {
		this.InputOutput = {}
		this.SelectedOutputs = []
		this.LastInput = ''
		this.checkFeedbacks(FeedbackId.input, FeedbackId.output)
	}

	/**
	 * @description when config is updated
	 * @param config
	 */
	public async configUpdated(config: HdtvMatrixConfig): Promise<void> {
		this.log('info', 'config changing!')
		if (this.socket) {
			this.socket.destroy()
		}

		if (this.pingIntervalTimer) {
			await clearIntervalAsync(this.pingIntervalTimer)
		}

		this.config = config
		this.saveConfig(config)
		this.init_tcp()
		initVariablesDefinitions(this)
		await this.refreshMatrixRoutes()
		await this.refreshMatrixLabels()

		this.setActionDefinitions(GetActions(this))
		this.setPresetDefinitions(GetPresetList())
		this.setFeedbackDefinitions(GetFeedbacks(this))

		this.log('info', 'config changed!')

		return Promise.resolve()
	}

	init_tcp() {
		if (this.socket) {
			this.socket.destroy()
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', `Network error: ${err.message}`)
			})

			// this.socket.on('data', () => {})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	/**
	 * @description get all config field information
	 * @returns the config fields
	 */
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	/**
	 * @description close connections and stop timers/intervals
	 */
	async destroy() {
		this.InputOutput = {}
		this.SelectedOutputs = []
		this.LastInput = ''
		this.ExistingInputOutput = {}
		this.ExistingLabels = []
		this.ExistingSelectedOutputs = []
		this.ExistingInputLabels = []
		this.ExistingOutputLabels = []
		this.ExistingRecallSaveLabels = []
		if (this.pingIntervalTimer) {
			await clearIntervalAsync(this.pingIntervalTimer)
		}
		if (this.socket) {
			this.socket.destroy()
		} else {
			this.updateStatus(InstanceStatus.Disconnected)
		}
		this.log('debug', `Instance destroyed: ${this.id}`)

		return Promise.resolve()
	}
}

runEntrypoint(HdtvMatrixInstance, [])
