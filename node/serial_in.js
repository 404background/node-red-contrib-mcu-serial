import {Node} from "nodered"

class Serial_in extends Node {
	onMessage(msg) {
        this.send(msg)
	}

	onStart(config) {
		super.onStart(config)
		const node = this
		let serial = new device.io.Serial({
            baud: Number(config.baud),
            port: Number(config.port),
            receive: Number(config.rx),
            transmit: Number(config.tx),
			onReadable() {
				let msg = String.fromArrayBuffer(this.read())
				msg = msg.trimEnd()
				node.send({payload: msg})
			}
        })
	}

	static type = "mcu_serial_in"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
