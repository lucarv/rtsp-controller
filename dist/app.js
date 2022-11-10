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
const server_1 = require("./server");
const redisClient_1 = require("./redisClient");
const hubProxy_1 = require("./hubProxy");
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    console.time('Starting App took...');
    yield (0, redisClient_1.initRedis)();
    yield (0, server_1.initServer)();
    //await asyncMain()
    yield (0, hubProxy_1.initProxy)();
    console.timeEnd('Starting App took...');
});
init();
//# sourceMappingURL=app.js.map