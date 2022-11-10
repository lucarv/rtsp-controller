'use strict';

import { createClient, RedisClientType } from 'redis';
var cacheHostName: string | undefined = process.env.REDIS_URL || 'redis-we.redis.cache.windows.net';
var cachePassword: string | undefined = process.env.REDIS_TOKEN || '6DUY6ly4ZfHgYZSeP7Vn5YQu8ZrpffPc5AzCaNjHBhM=';
var client: RedisClientType;

export const initRedis = async function (): Promise<void> {
    client = createClient({
        // rediss for TLS
        url: "redis://" + cacheHostName + ":6379",
        password: cachePassword,
    });
    await client.connect();

    client.on('error', (err) => console.log('Redis Client Error', err));
    console.log('Connected to redis cache')
}

export const addToCache = async (photoId: number, cameraFile: string) => {
    await client.set('' + photoId, cameraFile);
    console.log(`persisted photo ${photoId} to cache`);
}

export const getFilename = async (fileId: string): Promise<string> => {
    console.log(`retrieving file ${fileId} from cache`);
    let filename: any = await client.get('' + fileId);
    console.log(`redis: ${filename}`)
    if (filename === null) {
        return 'file not found';
    } else {
        return filename;
    }
}
