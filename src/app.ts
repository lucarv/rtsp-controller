'use strict';

import { initServer } from "./server";
import { initRedis } from "./redisClient";
import { initCam } from "./cameras";

const init = async (): Promise<void> => {
    
    console.time('Starting App took...');
    await initCam();
    await initRedis();
    await initServer();
    console.timeEnd('Starting App took...');
}

init();
