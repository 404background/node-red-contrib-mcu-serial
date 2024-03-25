import {Node} from "nodered"
let cache

class Serial_out extends Node {
	#serial

	onStart(config) {
		super.onStart(config)

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
	}

	onMessage(msg, done) {
        if (msg.payload != null){
            this.#serial.write(ArrayBuffer.fromString(msg.payload + "\n"))
        }
        this.send(msg)
		done()
	}

	static type = "mcu_serial_out"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
