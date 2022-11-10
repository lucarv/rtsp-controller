'use strict';

import * as videoUtil from './videoUtil';
import * as Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
export let server: Server;

import * as Cam from './cameras';

function getCameras(request: Request): object {
    return Cam.getCameras();
}

async function addCamera(request: Request): Promise<string> {   
    try {
        console.time('addCamera took...');
        let jsonData: any = request.payload;
        console.log(jsonData.url+' ' + jsonData.deviceId + ' ' + jsonData.codec);
        let result: string = await Cam.addCamera(jsonData.url, jsonData.deviceId, jsonData.codec);
        console.timeEnd('addCamera took...');
        return result;
    } catch (err: any) {
        console.log(err.toString());
        return err.toString();
    }
  
}

async function startRelay(request: Request): Promise<object> {
    let camId: string = request.params.cameraId;
    let port = videoUtil.startRelay(camId);
    return { port: port };
}

async function stopRelay(request: Request): Promise<string> {
    let camId: number = parseInt(request.params.cameraId);
    let port = videoUtil.stopRelay(camId);
    return 'ok';
}

async function takePhoto(request: Request): Promise<object> {
    let cameraId: string = request.params.cameraId;
    console.log(`Processing takePhoto request #${cameraId}: ${request.info.id}`);
    let photoId: number = await videoUtil.startImgCapture(cameraId);
    console.log('Took a photo; ' + photoId)
    if (photoId == -1) {
        return { result: 'camera not found '};
    }
    return { "photoId": photoId };
}

async function getImageFilename(request: Request): Promise<object> {
    let photoId: string = request.params.photoId;
    console.log(`Processing getImageFilename request #${photoId} >> ${request.info.id}`);
    let filename: any = await videoUtil.getImgFilename(photoId);
    return { photoId, filename };
}

async function startVideoRec(request: Request): Promise<object> {
    let camId: string = request.params.cameraId;
    console.log(`Processing startVdoRec request #${camId}: ${request.info.id}`);
    let vdoId: number = await videoUtil.startVdoCapture(camId);
    return { vdoId };
}

async function stopVideoRec(request: Request): Promise<string> {
    let videoId: number = parseInt(request.params.videoId);
    console.log(`Processing startVdoRec request #${videoId}: ${request.info.id}`);
    videoUtil.stopVdoCapture(videoId);
    return `${videoId} stopped`;
}

async function getVdoFilename(request: Request): Promise<object> {
    let videoId: number = parseInt(request.params.videoId);
    let filename: string = videoUtil.getVdoFilename(videoId);
    console.log(`Processing getVdoFilename request #${videoId}: ${request.info.id}`);
    return { videoId, filename };
}

export const initServer = async function (): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 80,
        host: '0.0.0.0'
    });

    // CAMERA Routes
    server.route({
        method: 'GET',
        path: '/cameras',
        handler: getCameras
    });
    
    server.route({
        method: 'POST',
        path: '/camera',
        options: {
            plugins: {
                body: { merge: false, sanitizer: { stripNullorEmpty: false } }
            },
            handler: async (request, h) => {
                let result = await addCamera(request);
                if (result == 'Created') {
                return h.response('ok').code(201)
                } else {
                    return h.response(result).code(500)
                }
            }
        }
    });
    
    // RELAY Routes
    server.route({
        method: 'GET',
        path: '/relay/{cameraId}',
        handler: startRelay
    });
    server.route({
        method: 'DELETE',
        path: '/relay/{cameraId}',
        handler: stopRelay
    });
    // PHOTO Routes
    server.route({
        method: 'GET',
        path: '/image/{cameraId}',
        handler: takePhoto
    });
    server.route({
        method: 'GET',
        path: '/image/file/{photoId}',
        handler: getImageFilename
    });
    // VIDEO Routes
    server.route({
        method: 'GET',
        path: '/video/{cameraId}',
        handler: startVideoRec
    });
    server.route({
        method: 'GET',
        path: '/video/file/{videoId}',
        handler: getVdoFilename
    });
    server.route({
        method: 'POST',
        path: '/video/{videoId}',
        handler: stopVideoRec
    });

    await startServer();
    return server;
};

export const startServer = async function (): Promise<void> {
    console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

process.on('unhandledRejection', (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});