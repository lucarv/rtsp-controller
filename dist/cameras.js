'use strict';
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
exports.getImgFilename = exports.addCamera = exports.getCameras = exports.getCamera = exports.Camera = void 0;
const hubProxy_1 = require("./hubProxy");
class Camera {
    constructor(id, url, deviceId, codec) {
        this.id = id;
        this.url = url;
        this.deviceId = deviceId;
        this.codec = codec;
    }
    getCameraUrl() {
        return this.url;
    }
    getCameraCodec() {
        return this.codec;
    }
    getCameraId() {
        return this.id;
    }
}
exports.Camera = Camera;
var cameras = [];
function getCamera(id) {
    return cameras[id - 1];
}
exports.getCamera = getCamera;
function getCameras() {
    return cameras;
}
exports.getCameras = getCameras;
const addCamera = (url, deviceId, codec) => __awaiter(void 0, void 0, void 0, function* () {
    let result = -1;
    try {
        let id = cameras.length + 1;
        let camId = 'ipcam' + id;
        if (!deviceId) {
            console.log('NO DEVICE ID');
        }
        else {
            camId = deviceId;
        }
        let camera = new Camera(id, url, camId, codec);
        cameras.push(camera);
        result = yield (0, hubProxy_1.registerCamera)(camId, url, codec);
    }
    catch (e) {
        console.log(e.toString());
    }
    return result;
});
exports.addCamera = addCamera;
function getImgFilename(photoId) {
    return '' + photoId;
    //    return 'image file not found';
}
exports.getImgFilename = getImgFilename;
const init = () => {
    console.time('Intializing Cameras took: ');
    try {
        // read from iothub registry
        console.log('Get Camera Devices');
        (0, hubProxy_1.getDevices)();
        /*
        let obj: any = readFileSync(camFile);

        obj.forEach((camera: any) => {
            console.log('Read cameras from File')
            let cam = new Camera(camera.id, camera.url, camera.deviceId, camera.codec);
            cameras.push(cam);
        });
        */
        if (cameras.length === 0) {
            console.error('No cameras configured');
        }
    }
    catch (e) {
        console.log(e.toString());
    }
    console.timeEnd('Intializing Cameras took: ');
};
init();
//# sourceMappingURL=cameras.js.map