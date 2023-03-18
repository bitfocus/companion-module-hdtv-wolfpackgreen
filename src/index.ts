import {
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	SomeCompanionConfigField,
	TCPHelper,
} from '@companion-module/base'
import { GetConfigFields, HdtvMatrixConfig } from './config'
import { GetActions } from './actions'
import { initVariables, updateVariables } from './variables'
import { arrayAddIfNotExist, arrayAddRemove, InputOutputDataInterface } from './utils'
import { FeedbackId, GetFeedbacks } from './feedback'
import { GetPresetList } from './presets'
import { got } from 'got-cjs'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'

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
	private pingIntervalTime = 2000
	public socket: TCPHelper | null = null

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
		await this.getMatrixSelections()

		return Promise.resolve()
	}

	private async getMatrixSelections() {
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
			// this.log('debug', `URL: ${url}`)
			this.pingIntervalTimer = setIntervalAsync(async () => {
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
					// this.log('debug', `map: ${this.map}, edid: ${this.edid}, hpdi: ${this.hpdi}, hpdo: ${this.hpdo}`)

					this.ExistingInputOutput = {}
					this.ExistingSelectedOutputs = []
					for (let index = 1; index < 17; index++) {
						this.ExistingInputOutput[index] = {
							input: index.toString(),
							output: [],
						}
					}

					for (let index = 0; index < map.length; index++) {
						// this.log('debug', `init: ExistingInputOutput Before - ${JSON.stringify(this.ExistingInputOutput)}`)
						const outputNumber: string = (index + 1).toString()
						// this.log('debug', `init: outputNumber - ${outputNumber}`)
						const inputNumber: string = (map[index] + 1).toString() // This is the value of the input that the output is going to
						// this.log('debug', `init: inputNumber - ${inputNumber}`)
						if (map[index] !== 255) {
							this.ExistingSelectedOutputs = arrayAddIfNotExist(this.ExistingSelectedOutputs, outputNumber)

							if (Object.prototype.hasOwnProperty.call(this.ExistingInputOutput, inputNumber) === false) {
								this.ExistingInputOutput[inputNumber + 1] = {
									input: inputNumber,
									output: [],
								}
							}

							if (Object.prototype.hasOwnProperty.call(this.ExistingInputOutput, inputNumber)) {
								this.ExistingInputOutput[inputNumber].output = arrayAddRemove(
									this.ExistingInputOutput[inputNumber].output,
									outputNumber
								)
							}
						}
					}

					// this.log('debug', `init: ExistingInputOutput After - ${JSON.stringify(this.ExistingInputOutput)}`)
					// this.log('debug', `init: ExistingSelectedOutputs After - ${JSON.stringify(this.ExistingSelectedOutputs)}`)
					this.checkFeedbacks(FeedbackId.input, FeedbackId.output)
				})
			}, this.pingIntervalTime)
		} catch (error: any) {
			this.log('debug', `error: Err parsing data ${error}`)
			return
		}
	}
	/**
	 * @description when config is updated
	 * @param config
	 */
	public async configUpdated(config: HdtvMatrixConfig): Promise<void> {
		if (this.socket) {
			this.socket.destroy()
		}

		this.config = config
		this.saveConfig(config)
		this.log('info', 'changing config!')
		this.init_tcp()
		this.updateInstance()
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
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('data', (data) => {
				this.log('debug', `socket data: ${data}`)
			})
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
		this.log('debug', `Instance destroyed: ${this.id}`)
		if (this.pingIntervalTime) {
			await clearIntervalAsync(this.pingIntervalTimer)
		}
		if (this.socket) {
			this.socket.destroy()
		} else {
			this.updateStatus(InstanceStatus.Disconnected)
		}

		return Promise.resolve()
	}

	/**
	 * @description update variables values
	 */
	public UpdateVariablesValues(): void {
		updateVariables(this)
	}

	/**
	 * @description init variables
	 */
	public InitVariables(): void {
		initVariables(this)
	}
	/**
	 * @description sets actions, variables, presets and feedbacks available for this instance
	 */
	public updateInstance(): void {
		initVariables(this)
		updateVariables(this)

		this.setActionDefinitions(GetActions(this))
		this.setPresetDefinitions(GetPresetList())
		this.setFeedbackDefinitions(GetFeedbacks(this))
	}
}

runEntrypoint(HdtvMatrixInstance, [])
