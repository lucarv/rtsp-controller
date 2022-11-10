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
exports.registerCamera = exports.getDevices = exports.initProxy = void 0;
//import { Gateway } from 'azure-iot-multiplexing-gateway';
//import { Message } from 'azure-iot-common';
const azure_iot_common = require("azure-iot-common");
const connectionString = 'HostName=lucamsft.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=PJrASGxx3zA359wcUVMu3v0u8CHg3n10OI5arDJ1ST0=';
//HostName=lucamsft.azure-devices.net;SharedAccessKeyName=registryReadWrite;SharedAccessKey=t6CZfMudqP5hi4M3eCPWdSosNGMq6FehwD767m/O/SU='
const azure_iothub_1 = require("azure-iothub");
const iothub = require('azure-iothub');
var registry;
var cameras = [];
const initProxy = () => __awaiter(void 0, void 0, void 0, function* () {
    registry = azure_iothub_1.Registry.fromConnectionString(connectionString);
    //    var gateway = new Gateway();
    //var message = new Message('Hello world');
});
exports.initProxy = initProxy;
const getDevices = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let queryString = 'select * from devices';
        let devices = registry.createQuery(queryString, 100);
        console.log(devices);
    }
    catch (e) {
        console.log(e.toString());
    }
});
exports.getDevices = getDevices;
const setTags = (deviceId, url, codec) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Setting tags for device: ' + deviceId);
    try {
        let twin = yield registry.getTwin(deviceId);
        let etag = twin.responseBody.etag;
        //let patch = { url, codec };
        let result = yield registry.updateTwin(deviceId, { tags: { 'type': 'ipcam', url, codec } }, etag);
        console.log('Twin update result: ' + result);
    }
    catch (err) {
        console.log('Error updating device: ' + err.toString());
    }
});
const registerCamera = (id, url, codec) => __awaiter(void 0, void 0, void 0, function* () {
    let result = 0;
    if (cameras.indexOf(id) === -1) {
        console.log('New Camera: ' + id);
        cameras.push(id);
        var device = {
            deviceId: id,
            status: 'enabled'
        };
        try {
            console.time(`Registering device: ${id} took: `);
            yield registry.create(device);
            yield setTags(id, url, codec);
            console.timeEnd(`Registering device: ${id} took: `);
            /*
            registry.create(device, function (err: Error, deviceInfo: any, res: any) {
                console.log('registered device: ' + deviceInfo.deviceId);
                if (err) {
                    console.error(`error here: ${err.toString()}`);
                    result = -1;
                } else {
                    if (deviceInfo) {
                        console.log(deviceInfo.etag);
                        setTags(id, url, codec);
                    }
                }
            });
            */
        }
        catch (e) {
            console.log(e.toString());
            result = -1;
        }
    }
    return result;
});
exports.registerCamera = registerCamera;
//# sourceMappingURL=hubProxy.js.map