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
import { InputOutputDataInterface } from './utils'
import { GetFeedbacks } from './feedback'

/**
 * @description Companion instance class for Zoom
 */
class HdtvMatrixInstance extends InstanceBase<HdtvMatrixConfig> {
	public InputOutput: InputOutputDataInterface = {}
	public LastInput = ''
	public SelectedOutputs: string[] = []

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
		this.instanceOptions.disableVariableValidation = true
	}

	/**
	 * @description triggered on instance being enabled
	 * @param config
	 */
	public async init(config: HdtvMatrixConfig): Promise<void> {
		this.log('info', `Welcome, HDTV HDMI Matrix module is being initialized`)
		await this.configUpdated(config)
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
		// this.init_tcp_variables()
		this.updateInstance()
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

			// this.socket.on('data', () => {})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	// init_tcp_variables() {}
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
		this.log('debug', `Instance destroyed: ${this.id}`)
		if (this.socket) {
			this.socket.destroy()
		} else {
			this.updateStatus(InstanceStatus.Disconnected)
		}
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
		this.setFeedbackDefinitions(GetFeedbacks(this))
	}
}

runEntrypoint(HdtvMatrixInstance, [])
