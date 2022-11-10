"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncMain = void 0;
const azure_iot_device_mqtt_1 = require("azure-iot-device-mqtt");
const azure_iot_device_1 = require("azure-iot-device");
const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTION_STRING || 'HostName=lucamsft.azure-devices.net;DeviceId=ipcam_tapo_001;SharedAccessKey=e/2ZvIYNpOQnQ6fHGhY2Lqx4BO23CAVAhbrVj//SD8c=';
let sendInterval;
if (deviceConnectionString === '') {
    console.log('device connection string not set');
    process.exit(-1);
}
const client = azure_iot_device_1.Client.fromConnectionString(deviceConnectionString, azure_iot_device_mqtt_1.Mqtt);
function asyncMain() {
    return __awaiter(this, void 0, void 0, function* () {
        client.on('connect', connectHandler);
        client.on('error', errorHandler);
        client.on('disconnect', disconnectHandler);
        client.on('message', messageHandler);
        client.open().catch((err) => {
            console.error('Could not connect: ' + err.message);
        });
    });
}
exports.asyncMain = asyncMain;
function disconnectHandler() {
    clearInterval(sendInterval);
    sendInterval = null;
    client.open().catch((err) => {
        console.error(err.message);
    });
}
function connectHandler() {
    console.log('Hub Client connected');
    // Create a message and send it to the IoT Hub every two seconds
    if (!sendInterval) {
        sendInterval = setInterval(() => {
            //const message = generateMessage();
            //console.log('Sending message: ' + message.getData());
            //client.sendEvent(message, printResultFor('send'));
        }, 2000);
    }
}
function messageHandler(msg) {
    console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
    client.complete(msg, printResultFor('completed'));
}
function errorHandler(err) {
    console.error(err.message);
}
function printResultFor(op) {
    return function printResult(err, res) {
        if (err)
            console.log(op + ' error: ' + err.toString());
        if (res)
            console.log(op + ' status: ' + res.constructor.name);
    };
}
function generateMessage() {
    const windSpeed = 10 + Math.random() * 4; // range: [10, 14]
    const temperature = 20 + Math.random() * 10; // range: [20, 30]
    const humidity = 60 + Math.random() * 20; // range: [60, 80]
    const data = JSON.stringify({
        deviceId: 'myFirstDevice',
        windSpeed: windSpeed,
        temperature: temperature,
        humidity: humidity,
    });
    const message = new azure_iot_device_1.Message(data);
    message.properties.add('temperatureAlert', temperature > 28 ? 'true' : 'false');
    return message;
}
asyncMain().catch((err) => {
    console.log('error code: ', err.code);
    console.log('error message: ', err.message);
    console.log('error stack: ', err.stack);
});
//# sourceMappingURL=deviceClient.js.map