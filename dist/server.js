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
exports.startServer = exports.initServer = exports.server = void 0;
const videoUtil = require("./videoUtil");
const Hapi = require("@hapi/hapi");
const Cam = require("./cameras");
function getCameras(request) {
    return Cam.getCameras();
}
function addCamera(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = 'ok';
        try {
            console.time('addCamera took...');
            let jsonData = request.payload;
            let result = yield Cam.addCamera(jsonData.url, jsonData.deviceId, jsonData.codec);
            if (result !== 0) {
                status = 'failed to add camera';
            }
            console.timeEnd('addCamera took...');
            return 'status';
        }
        catch (err) {
            console.log(err.toString());
            status = err.toString();
        }
        return status;
    });
}
function startRelay(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let camId = parseInt(request.params.cameraId);
        let port = videoUtil.startRelay(camId);
        return { port: port };
    });
}
function stopRelay(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let camId = parseInt(request.params.cameraId);
        let port = videoUtil.stopRelay(camId);
        return 'ok';
    });
}
function takePhoto(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let camId = parseInt(request.params.cameraId);
        console.log(`Processing takePhoto request #${camId}: ${request.info.id}`);
        let photoId = yield videoUtil.startImgCapture(camId);
        return { photoId };
    });
}
function getImageFilename(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let photoId = request.params.photoId;
        console.log(`Processing getImageFilename request #${photoId} >> ${request.info.id}`);
        let filename = yield videoUtil.getImgFilename(photoId);
        return { photoId, filename };
    });
}
function startVideoRec(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let camId = parseInt(request.params.cameraId);
        console.log(`Processing startVdoRec request #${camId}: ${request.info.id}`);
        let vdoId = yield videoUtil.startVdoCapture(camId);
        return { vdoId };
    });
}
function stopVideoRec(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let videoId = parseInt(request.params.videoId);
        console.log(`Processing startVdoRec request #${videoId}: ${request.info.id}`);
        videoUtil.stopVdoCapture(videoId);
        return `${videoId} stopped`;
    });
}
function getVdoFilename(request) {
    return __awaiter(this, void 0, void 0, function* () {
        let videoId = parseInt(request.params.videoId);
        let filename = videoUtil.getVdoFilename(videoId);
        console.log(`Processing getVdoFilename request #${videoId}: ${request.info.id}`);
        return { videoId, filename };
    });
}
const initServer = function () {
    return __awaiter(this, void 0, void 0, function* () {
        exports.server = Hapi.server({
            port: process.env.PORT || 80,
            host: '0.0.0.0'
        });
        // CAMERA Routes
        exports.server.route({
            method: 'GET',
            path: '/cameras',
            handler: getCameras
        });
        exports.server.route({
            method: 'POST',
            path: '/camera',
            options: {
                plugins: {
                    body: { merge: false, sanitizer: { stripNullorEmpty: false } }
                },
                handler: addCamera
            }
        });
        // RELAY Routes
        exports.server.route({
            method: 'GET',
            path: '/relay/{cameraId}',
            handler: startRelay
        });
        exports.server.route({
            method: 'DELETE',
            path: '/relay/{cameraId}',
            handler: stopRelay
        });
        // PHOTO Routes
        exports.server.route({
            method: 'GET',
            path: '/image/{cameraId}',
            handler: takePhoto
        });
        exports.server.route({
            method: 'GET',
            path: '/image/file/{photoId}',
            handler: getImageFilename
        });
        // VIDEO Routes
        exports.server.route({
            method: 'GET',
            path: '/video/{cameraId}',
            handler: startVideoRec
        });
        exports.server.route({
            method: 'GET',
            path: '/video/file/{videoId}',
            handler: getVdoFilename
        });
        exports.server.route({
            method: 'POST',
            path: '/video/{videoId}',
            handler: stopVideoRec
        });
        yield (0, exports.startServer)();
        return exports.server;
    });
};
exports.initServer = initServer;
const startServer = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Listening on ${exports.server.settings.host}:${exports.server.settings.port}`);
        return exports.server.start();
    });
};
exports.startServer = startServer;
process.on('unhandledRejection', (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map