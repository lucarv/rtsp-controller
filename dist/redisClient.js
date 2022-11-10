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
exports.getFilename = exports.addToCache = exports.initRedis = void 0;
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || 'redis://192.168.1.201:6379';
const client = (0, redis_1.createClient)({ url: redisUrl });
const initRedis = function () {
    return __awaiter(this, void 0, void 0, function* () {
        client.on('error', (err) => console.log('Redis Client Error', err));
        yield client.connect();
        console.log('Connected to redis cache');
    });
};
exports.initRedis = initRedis;
const addToCache = (photoId, cameraFile) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.set('' + photoId, cameraFile);
    console.log(`persisted photo ${photoId} to cache`);
});
exports.addToCache = addToCache;
const getFilename = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`retrieving file ${fileId} from cache`);
    let filename = yield client.get('' + fileId);
    console.log(`redis: ${filename}`);
    if (filename === null) {
        return 'file not found';
    }
    else {
        return filename;
    }
});
exports.getFilename = getFilename;
//# sourceMappingURL=redisClient.js.map