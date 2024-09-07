"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../../../cache");
const utils_1 = __importDefault(require("../../../utils"));
const Url_1 = __importDefault(require("../../../utils/Url"));
const WATCH_PAGE_CACHE = new cache_1.Cache();
class YouTubePageExtractor {
    static getWatchHtmlUrl(id, options) {
        return `${Url_1.default.getWatchPageUrl(id)}&hl=${options.lang || 'en'}&bpctr=${Math.ceil(Date.now() / 1000)}&has_verified=1`;
    }
    static getWatchPageBody(id, options) {
        const WATCH_PAGE_URL = YouTubePageExtractor.getWatchHtmlUrl(id, options);
        return WATCH_PAGE_CACHE.getOrSet(WATCH_PAGE_URL, () => utils_1.default.request(WATCH_PAGE_URL, options)) || Promise.resolve('');
    }
    static getEmbedPageBody(id, options) {
        const EMBED_PAGE_URL = `${Url_1.default.getEmbedUrl(id)}?hl=${options.lang || 'en'}`;
        return utils_1.default.request(EMBED_PAGE_URL, options);
    }
}
exports.default = YouTubePageExtractor;
//# sourceMappingURL=PageExtractor.js.map