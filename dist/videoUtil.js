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
exports.getVdoFilename = exports.stopVdoCapture = exports.startVdoCapture = exports.getImgFilename = exports.startImgCapture = exports.stopRelay = exports.startRelay = void 0;
const Cam = require("./cameras");
var camFileArray = [];
const redisClient_1 = require("./redisClient");
const vdofolder = 'vdofiles/', imgfolder = 'imgfiles/';
const Stream = require('node-rtsp-stream');
var streamArray = [];
const startRelay = (cameraId) => {
    var camera = Cam.getCamera(cameraId);
    var stream = new Stream({
        name: 'stream',
        streamUrl: camera.getCameraUrl(),
        wsPort: 9999,
        ffmpegOptions: {
            '-stats': '',
            '-r': 30 // options with required values specify the value after the key
        }
    });
    streamArray.push({ cameraId, stream });
    return stream.wsPort;
};
exports.startRelay = startRelay;
const stopRelay = (cameraId) => {
    streamArray.forEach((streamObj) => {
        if (streamObj.cameraId == cameraId) {
            streamObj.stream.stop();
        }
        ;
    });
};
exports.stopRelay = stopRelay;
const child_process_1 = require("child_process");
var vdoJobArray = [];
var ffmpeg;
function startImgCapture(cameraId) {
    console.time('Taking snapshot took ');
    var camera = Cam.getCamera(cameraId);
    const outpuImgName = __dirname + '/' + imgfolder + 'camera-' + cameraId + ' img-' + Date.now() + '.' + 'jpg';
    var photo = (0, child_process_1.spawn)("ffmpeg", ["-y", "-i", camera.url, "-vframes", "1", outpuImgName], { detached: true });
    photo.on("spawn", () => __awaiter(this, void 0, void 0, function* () {
        console.log(`Photo id: ${photo.pid}`);
        return photo.pid;
    }));
    photo.on('close', (code, signal) => __awaiter(this, void 0, void 0, function* () {
        console.timeEnd('Taking snapshot took ');
        if (code == 0 && signal == null) {
            yield (0, redisClient_1.addToCache)(photo.pid, outpuImgName);
        }
    }));
}
exports.startImgCapture = startImgCapture;
function getImgFilename(photoId) {
    return __awaiter(this, void 0, void 0, function* () {
        let filename = yield (0, redisClient_1.getFilename)(photoId);
        return filename;
    });
}
exports.getImgFilename = getImgFilename;
const startVdoCapture = (cameraId) => {
    var camera = Cam.getCamera(cameraId);
    const outputVdoName = __dirname + '/' + vdofolder + cameraId + '/' + Date.now() + '.' + +camera.codec;
    ffmpeg = (0, child_process_1.spawn)("ffmpeg", ["-i", camera.url, outputVdoName], { detached: true });
    vdoJobArray.push({ pid: ffmpeg.pid, process: ffmpeg });
    ffmpeg.on("spawn", () => {
        console.log(`Video id: ${ffmpeg.pid}`);
    });
    ffmpeg.on('close', (code, signal) => {
        console.log(`[INF] ${new Date()} - Video recording finished and saved at ${outputVdoName}`);
        camFileArray.push({ pid: ffmpeg.pid, filename: outputVdoName });
    });
    return ffmpeg.pid;
};
exports.startVdoCapture = startVdoCapture;
const stopVdoCapture = (pid) => {
    vdoJobArray.forEach((item) => {
        if (item.pid == pid) {
            ffmpeg.kill();
        }
    });
};
exports.stopVdoCapture = stopVdoCapture;
function getVdoFilename(pid) {
    let filename = 'image file not found';
    camFileArray.forEach((item) => {
        if (item.pid == pid) {
            filename = item.filename;
        }
    });
    return filename;
}
exports.getVdoFilename = getVdoFilename;
//# sourceMappingURL=videoUtil.js.map