'use strict';

import * as Cam from './cameras';
interface CamFile {
    pid: any,
    filename: string
}
var camFileArray: CamFile[] = [];
import { addToCache, getFilename } from "./redisClient";

const
    vdofolder: string = 'vdofiles/',
    imgfolder: string = 'imgfiles/';

const Stream = require('node-rtsp-stream');
var streamArray: any[] = [];

export const startRelay = (cameraId: string): object => {
    var camera: Cam.Camera | undefined = Cam.getCamera(cameraId);
    if (camera !== undefined) {
        var stream = new Stream({
            name: 'stream',
            streamUrl: camera.getCameraUrl(),
            wsPort: 9999,
            ffmpegOptions: { // options ffmpeg flags
                '-stats': '', // an option with no neccessary value uses a blank string
                '-r': 30 // options with required values specify the value after the key
            }
        })
        streamArray.push({ cameraId, stream });
        return { "streamPort": stream.wsPort };
    } else {
        return { "streamPort": -1 };

    }
}

export const stopRelay = (cameraId: number): void => {
    streamArray.forEach((streamObj) => {
        if (streamObj.cameraId == cameraId) {
            streamObj.stream.stop();
        };
    });
}

import { spawn, ChildProcess } from 'child_process';
interface vdoJob {
    pid: any,
    process: ChildProcess
}
var vdoJobArray: vdoJob[] = [];
var ffmpeg: ChildProcess;


export async function startImgCapture(cameraId: string): Promise<number> {

    let pid:number = 0;
    console.time('Taking snapshot took ');
    console.log('[startImgCapture] camera id: ' + cameraId);

    var camera: Cam.Camera | undefined = Cam.getCamera(cameraId);

    if (camera !== undefined) {
        const outpuImgName: string = __dirname + '/' + imgfolder + 'camera-' + cameraId + ' img-' + Date.now() + '.' + 'jpg';
        var photo: any = spawn("ffmpeg", ["-y", "-i", camera.url, "-vframes", "1", outpuImgName], { detached: true });
        pid = photo.pid;
        console.log('[startImgCapture] pid: ' + photo.pid);

        photo.on("spawn", async () => {
            console.log(`Photo id: ${photo.pid}`);
        });

        photo.on('close', async (code: number, signal: number) => {
            console.timeEnd('Taking snapshot took ');
            if (code == 0 && signal == null) {
                await addToCache(photo.pid, outpuImgName);
            }
        });
    } else {
        console.log('Camera not found');
    }
    return pid;
}

export async function getImgFilename(photoId: string): Promise<string> {
    let filename: any = await getFilename(photoId)
    return filename
}

export const startVdoCapture = (cameraId: string): any => {
    var camera: Cam.Camera | undefined = Cam.getCamera(cameraId);
    if (camera !== undefined) {
        const outputVdoName = __dirname + '/' + vdofolder + cameraId + '/' + Date.now() + '.' + + camera.codec
        ffmpeg = spawn("ffmpeg", ["-i", camera.url, outputVdoName], { detached: true });
        vdoJobArray.push({ pid: ffmpeg.pid, process: ffmpeg });

        ffmpeg.on("spawn", () => {
            console.log(`Video id: ${ffmpeg.pid}`);
        });

        ffmpeg.on('close', (code, signal) => {
            console.log(`[INF] ${new Date()} - Video recording finished and saved at ${outputVdoName}`);
            camFileArray.push({ pid: ffmpeg.pid, filename: outputVdoName });
        });
        return ffmpeg.pid;
    } else {
        return -1;
    }
}

export const stopVdoCapture = (pid: number): void => {
    vdoJobArray.forEach((item: vdoJob) => {
        if (item.pid == pid) {
            ffmpeg.kill();
        }
    });
}

export function getVdoFilename(pid: number): string {
    let filename: string = 'image file not found';
    camFileArray.forEach((item: CamFile) => {
        if (item.pid == pid) {
            filename = item.filename;
        }
    });
    return filename
}
