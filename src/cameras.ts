'use strict';

import fetch from "node-fetch";
const hub_proxy_url: string = process.env.GATEWAY_URL || 'https://hub-mux-gw.salmonfield-3ced17fa.westeurope.azurecontainerapps.io';

export class Camera {
    deviceId: string;
    url: string;
    codec: string;

    constructor(url: string, deviceId: string, codec: string) {
        this.url = url;
        this.deviceId = deviceId;
        this.codec = codec;
    }
    getCameraUrl(): string {
        return this.url;
    }
    getCameraCodec(): string {
        return this.codec;
    }
}
var cameras: Camera[] = [];

export function getCamera(cameraId: string): any {
    console.log(`[getCamera] ${cameras} >> ${cameraId}`);
/*
    if (cameras === undefined) {
        return cameras.find((cam: Camera) => cam.deviceId === cameraId);
    } else {
        return null;
    }
    */
   return 'wtf'


}

export async function getCameras(): Promise<Camera[]> {
    try {
        let url = hub_proxy_url + '/devices';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        let arrayOfCams: any = await response.json();
        if (arrayOfCams !== undefined) {
            cameras = arrayOfCams;
        }
    } catch (err: any) {
        console.log(err.toString());
    }
    return cameras;
}

export const addCamera = async (url: string, deviceId: string, codec: string): Promise<string> => {
    try {
        let url = hub_proxy_url + '/' + deviceId;
        let jsonData = { url: url, deviceId: deviceId, codec: codec };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        });
        let result: string = response.statusText;

        let camera = new Camera(deviceId, url, codec);
        console.log(camera)
        cameras.push(camera);
        return result;
        //result = await registerDevice(deviceId, url, codec);
    } catch (err: any) {
        console.log(err.toString());
        return err.toString();

    }
}

/*
export function getImgFilename(photoId: number): string {
    return '' + photoId;
//    return 'image file not found';
}
*/
export async function initCam(): Promise<void> {
    try {
        // read from iothub registry
        cameras = await getCameras();
        console.log(`Got ${cameras.length} Camera Devices`);


        if (cameras.length === 0) {
            console.error('No cameras configured');
        }
    } catch (e: any) {
        console.log(e.toString());
    }
}

/*
    "tags": {
        "url": "rtsp://lucarv:lucaPWD4tap0@192.168.1.92:554/stream2",
        "codec": "mp4",
        "type": "ipcam"
    },
    */