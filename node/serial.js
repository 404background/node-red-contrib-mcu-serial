import {Node} from "nodered"
let cache

class Serial {
	static add(config, reader) {
		const cachePort = 'mcu_serial' + Number(config.port);
		cache ??= new Map;
		let serial = cache.get(cachePort);
		if (!serial) {
			serial = new device.io.Serial({
				baud: Number(config.baud),
				port: Number(config.port),
				receive: Number(config.rx),
				transmit: Number(config.tx),
				onReadable() {
					let msg = String.fromArrayBuffer(this.read());
					msg = msg.trimEnd()
					this.readers.forEach(reader => {
						reader.send({payload: msg})
					});
				}
			})
			cache.set(cachePort, serial)
			serial.readers = [];
		}
		if (reader)
			serial.readers.push(reader);
		return serial;
	}
}

class Serial_in extends Node {
	onStart(config) {
		super.onStart(config)

		try {
			Serial.add(config, this);
		}
		catch {
			this.status({fill: "red", shape: "dot", text: "node-red:common.status.error"})
		}
	}

	static type = "mcu_serial_in"
	static {
		RED.nodes.registerType(this.type, this)
	}
}


class Serial_out extends Node {
	#serial

	onStart(config) {
		super.onStart(config)

		try {
			this.#serial = Serial.add(config);
		}
		catch {
			this.status({fill: "red", shape: "dot", text: "node-red:common.status.error"})
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