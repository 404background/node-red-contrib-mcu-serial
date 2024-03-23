import {Node} from "nodered"

class Serial_out extends Node {
	#serial

	onStart(config) {
		super.onStart(config)
		this.#serial = serial = new device.io.Serial({
            ...device.Serial.default,
            baud: Number(config.baud),
            port: Number(config.port),
            receive: Number(config.rx),
            transmit: Number(config.tx),
            format: config.format,
			onReadable: function (count) {
				let  msg = {}
				msg.payload = String.fromArrayBuffer(this.read())
				msg.payload = msg.payload.trimEnd()
				node.send(msg)
			},
        })
	}
	onMessage(msg, done) {
        if (msg.payload != null){
            this.#serial.write(ArrayBuffer.fromString(msg.payload + "\n"))
        }
        node.send(msg)
		done()
	}

	static type = "mcu_serial_out"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
