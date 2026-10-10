import {Node} from "nodered"
import Timer from "timer"

/*
 * A partial line is sent after this much silence, so devices that do not end
 * their output with a newline are still heard.
 */
const PARTIAL_LINE_MS = 100
/* A line longer than this is sent as it is instead of growing without limit */
const MAX_LINE_LENGTH = 1024

/* One device.io.Serial per UART port, shared by the in and out nodes on it */
let cache

class Serial {
	/*
	 * Returns the port's serial, opening it on first use. Throws when the
	 * port cannot be opened, or when it is already open with other settings
	 * (the second node's baud / pins would otherwise be silently ignored).
	 */
	static add(config, reader) {
		const settings = {
			port: Number(config.port),
			baud: Number(config.baud),
			receive: Number(config.rx),
			transmit: Number(config.tx)
		}
		for (const name in settings) {
			if (!Number.isInteger(settings[name]))
				throw new Error(`invalid ${name}`)
		}

		cache ??= new Map
		let entry = cache.get(settings.port)
		if (entry) {
			const own = entry.settings
			if ((own.baud !== settings.baud) || (own.receive !== settings.receive) || (own.transmit !== settings.transmit))
				throw new Error(`port ${settings.port} is already used with other settings`)
		}
		else {
			entry = {settings, readers: [], line: "", timer: undefined}
			entry.serial = new device.io.Serial({
				...settings,
				onReadable() {
					Serial.#receive(entry, String.fromArrayBuffer(this.read()))
				}
			})
			cache.set(settings.port, entry)
		}
		if (reader)
			entry.readers.push(reader)
		return entry.serial
	}

	/* Sends every complete line; a partial one waits for the rest */
	static #receive(entry, text) {
		if (entry.timer !== undefined) {
			Timer.clear(entry.timer)
			entry.timer = undefined
		}

		const parts = (entry.line + text).split("\n")
		entry.line = parts.pop()
		for (const part of parts)
			Serial.#emit(entry, part)

		if (entry.line.length >= MAX_LINE_LENGTH) {
			Serial.#emit(entry, entry.line)
			entry.line = ""
		}
		else if (entry.line.length) {
			entry.timer = Timer.set(() => {
				entry.timer = undefined
				Serial.#emit(entry, entry.line)
				entry.line = ""
			}, PARTIAL_LINE_MS)
		}
	}

	static #emit(entry, line) {
		const payload = line.trimEnd()
		if (!payload.length)
			return
		for (const reader of entry.readers)
			reader.send({payload})
	}
}

/* What a message payload looks like on the wire */
function toBytes(payload) {
	if (payload instanceof ArrayBuffer)
		return payload
	if (ArrayBuffer.isView(payload))
		return payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength)
	const text = ("object" === typeof payload) ? JSON.stringify(payload) : String(payload)
	return ArrayBuffer.fromString(text + "\n")
}

class Serial_in extends Node {
	onStart(config) {
		super.onStart(config)

		try {
			Serial.add(config, this)
			this.status({fill: "green", shape: "dot", text: "node-red:common.status.connected"})
		}
		catch (e) {
			this.status({fill: "red", shape: "ring", text: "node-red:common.status.error"})
			this.error(e.message)
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
			this.#serial = Serial.add(config)
			this.status({fill: "green", shape: "dot", text: "node-red:common.status.connected"})
		}
		catch (e) {
			this.status({fill: "red", shape: "ring", text: "node-red:common.status.error"})
			this.error(e.message)
		}
	}

	onMessage(msg, done) {
		if (this.#serial && (msg.payload != null)) {
			try {
				this.#serial.write(toBytes(msg.payload))
			}
			catch (e) {
				this.error(e.message, msg)
				return
			}
		}
		done?.()
	}

	static type = "mcu_serial_out"
	static {
		RED.nodes.registerType(this.type, this)
	}
}
