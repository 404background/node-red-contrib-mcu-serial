import {Node} from "nodered"

class Serial_in extends Node {
	onStart(config) {
		super.onStart(config)
		let serial = new device.io.Serial({
            ...device.Serial.default,
            baud: Number(config.baud),
            port: Number(config.port),
            receive: Number(config.rx),
            transmit: Number(config.tx),
			onReadable: function (count) {
				let  msg = {}
				msg.payload = String.fromArrayBuffer(this.read())
				msg.payload = msg.payload.trimEnd()
				this.send(msg)
			},
        })
	}

	static type = "mcu_serial_in"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
