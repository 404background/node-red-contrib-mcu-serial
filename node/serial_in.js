import {Node} from "nodered"
let cache

class Serial_in extends Node {
	#serial

	onStart(config) {
		super.onStart(config)
		const node = this

		cache ??= new Map
		let serial = cache.get(config.port)

		if (serial) {
			this.#serial = serial
		}
		else {
			try {
				this.#serial = serial = new device.io.Serial({
					baud: Number(config.baud),
					port: Number(config.port),
					receive: Number(config.rx),
					transmit: Number(config.tx)
				})
				cache.set(config.port, serial)
			}
			catch {
				this.status({fill: "red", shape: "dot", text: "node-red:common.status.error"})
			}
		}
		
		this.#serial.onReadable() = function() {
			let msg = String.fromArrayBuffer(this.read())
			msg = msg.trimEnd()
			node.send({payload: msg})
		}
	}

	static type = "mcu_serial_in"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
