const Serial_in = require('./serial_in')

module.exports = function(RED) {
    function Serial_in(config) {
        RED.nodes.createNode(this, config);
		console.log(config)

        const serial = new Serial_in()
        serial.onReadable = function() {
            const data = serial.read()
            node.send({payload: data})
        }
    }
    RED.nodes.registerType("mcu_serial_in", Serial_in);
}
