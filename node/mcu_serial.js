/* Editor-side definitions only: the nodes run on the MCU (serial.js) */
module.exports = function(RED) {
	function Serial_in(config) {
		RED.nodes.createNode(this, config)
	}
	RED.nodes.registerType("mcu_serial_in", Serial_in)

	function Serial_out(config) {
		RED.nodes.createNode(this, config)
	}
	RED.nodes.registerType("mcu_serial_out", Serial_out)
}
