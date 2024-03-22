import {Node} from "nodered"
let cache

class Serial_in extends Node {
	#io

	onStart(config) {
		super.onStart(config)
		cache ??= new Map
		let io = cache.get(config.pin)

        this.#io = io = new device.io.Serial({
            ...device.Serial.default,
            baud: Number(config.baud),
            port: Number(config.port),
            receive: Number(config.rx),
            transmit: Number(config.tx),
            format: config.format
        })
	}
	onMessage(msg, done) {
        let  msg = {}
        msg.payload = String.fromArrayBuffer(this.#io.read())
        msg.payload = msg.payload.trimEnd()
        node.send(msg)
		done()
	}

	static type = "mcu_serial_in"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
