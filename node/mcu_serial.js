module.exports = function(RED) {
    function Serial_in(config) {
        RED.nodes.createNode(this, config);
		console.log(config)
    }
    RED.nodes.registerType("mcu_serial_in", Serial_in);
}

module.exports = function(RED) {
    function Serial_out(config) {
        RED.nodes.createNode(this, config);
		console.log(config)
    }
    RED.nodes.registerType("mcu_serial_out", Serial_out);
}