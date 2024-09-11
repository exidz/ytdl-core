"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getBasicInfo = _getBasicInfo;
var CLIENTS_NUMBER;
(function (CLIENTS_NUMBER) {
    CLIENTS_NUMBER[CLIENTS_NUMBER["WEBCREATOR"] = 0] = "WEBCREATOR";
    CLIENTS_NUMBER[CLIENTS_NUMBER["TVEMBEDDED"] = 1] = "TVEMBEDDED";
    CLIENTS_NUMBER[CLIENTS_NUMBER["IOS"] = 2] = "IOS";
    CLIENTS_NUMBER[CLIENTS_NUMBER["ANDROID"] = 3] = "ANDROID";
    CLIENTS_NUMBER[CLIENTS_NUMBER["WEB"] = 4] = "WEB";
    CLIENTS_NUMBER[CLIENTS_NUMBER["MWEB"] = 5] = "MWEB";
    CLIENTS_NUMBER[CLIENTS_NUMBER["TV"] = 6] = "TV";
})(CLIENTS_NUMBER || (CLIENTS_NUMBER = {}));
const Cache_1 = require("../../core/Cache");
const PoToken_1 = __importDefault(require("../../core/PoToken"));
const Fetcher_1 = __importDefault(require("../../core/Fetcher"));
const Log_1 = require("../../utils/Log");
const Url_1 = __importDefault(require("../../utils/Url"));
const constants_1 = require("../../utils/constants");
const Utils_1 = __importDefault(require("../../utils/Utils"));
const DownloadOptions_1 = __importDefault(require("../../utils/DownloadOptions"));
const Html5Player_1 = __importDefault(require("./parser/Html5Player"));
const Formats_1 = __importDefault(require("./parser/Formats"));
const Player_1 = __importDefault(require("./apis/Player"));
const Next_1 = __importDefault(require("./apis/Next"));
const Extras_1 = __importDefault(require("./Extras"));
/* Private Constants */
const AGE_RESTRICTED_URLS = ['support.google.com/youtube/?p=age_restrictions', 'youtube.com/t/community_guidelines'], SUPPORTED_CLIENTS = ['webCreator', 'tvEmbedded', 'ios', 'android', 'web', 'mweb', 'tv'], BASE_CLIENTS = ['web', 'webCreator', 'tvEmbedded', 'ios', 'android'], BASIC_INFO_CACHE = new Cache_1.Cache();
/* ----------- */
/* Private Functions */
function setupClients(clients, disableDefaultClients) {
    if (clients && clients.length === 0) {
        Log_1.Logger.warning('At least one client must be specified.');
        clients = BASE_CLIENTS;
    }
    clients = clients.filter((client) => SUPPORTED_CLIENTS.includes(client));
    if (disableDefaultClients) {
        return clients;
    }
    return [...new Set([...BASE_CLIENTS, ...clients])];
}
async function getSignatureTimestamp(html5player, options) {
    const BODY = await Fetcher_1.default.request(html5player, options), MO = BODY.match(/signatureTimestamp:(\d+)/);
    return MO ? MO[1] : undefined;
}
/* ----------- */
/* Public Functions */
/** Gets info from a video without getting additional formats. */
async function _getBasicInfo(id, options, isFromGetInfo) {
    DownloadOptions_1.default.applyIPv6Rotations(options);
    DownloadOptions_1.default.applyDefaultHeaders(options);
    DownloadOptions_1.default.applyDefaultAgent(options);
    DownloadOptions_1.default.applyOldLocalAddress(options);
    options.requestOptions ??= {};
    const { jar, dispatcher } = options.agent || {};
    Utils_1.default.setPropInsensitive(options.requestOptions?.headers, 'cookie', jar?.getCookieStringSync('https://www.youtube.com'));
    options.requestOptions.dispatcher ??= dispatcher;
    const HTML5_PLAYER_PROMISE = (0, Html5Player_1.default)(id, options);
    if (options.oauth2 && options.oauth2.shouldRefreshToken()) {
        Log_1.Logger.info('The specified OAuth2 token has expired and will be renewed automatically.');
        await options.oauth2.refreshAccessToken();
    }
    if (!options.poToken) {
        Log_1.Logger.warning('Specify poToken for stable and fast operation. See README for details.');
        Log_1.Logger.info('Automatically generates poToken, but stable operation cannot be guaranteed.');
        const { poToken, visitorData } = await PoToken_1.default.generatePoToken();
        options.poToken = poToken;
        options.visitorData = visitorData;
    }
    if (options.poToken && !options.visitorData) {
        Log_1.Logger.warning('If you specify a poToken, you must also specify the visitorData.');
    }
    options.clients = setupClients(options.clients || BASE_CLIENTS, options.disableDefaultClients ?? false);
    const HTML5_PLAYER_RESPONSE = await HTML5_PLAYER_PROMISE, HTML5_PLAYER_URL = HTML5_PLAYER_RESPONSE.playerUrl;
    if (!HTML5_PLAYER_URL) {
        throw new Error('Unable to find html5player file');
    }
    const SIGNATURE_TIMESTAMP = parseInt(HTML5_PLAYER_RESPONSE.signatureTimestamp || ''), PLAYER_API_PARAMS = {
        videoId: id,
        signatureTimestamp: SIGNATURE_TIMESTAMP,
        options,
    }, PLAYER_API_PROMISE = Player_1.default.getApiResponses(PLAYER_API_PARAMS, options.clients), NEXT_API_PROMISE = Next_1.default.getApiResponses(PLAYER_API_PARAMS), { isMinimalMode, responses: PLAYER_RESPONSES } = await PLAYER_API_PROMISE, NEXT_RESPONSES = await NEXT_API_PROMISE, PLAYER_RESPONSE_ARRAY = Object.values(PLAYER_RESPONSES) || [], VIDEO_INFO = {
        videoDetails: {},
        relatedVideos: [],
        formats: [],
        full: false,
        _metadata: {
            html5Player: null,
            clients: options.clients,
            isMinimumMode: false,
            id,
            options,
        },
        _ytdl: {
            version: constants_1.VERSION,
        },
    };
    VIDEO_INFO._metadata.isMinimumMode = isMinimalMode;
    VIDEO_INFO._metadata.html5Player = HTML5_PLAYER_URL;
    if (options.includesPlayerAPIResponse) {
        VIDEO_INFO._playerApiResponses = PLAYER_RESPONSES;
    }
    if (options.includesNextAPIResponse) {
        VIDEO_INFO._nextApiResponses = NEXT_RESPONSES;
    }
    /* Filtered */
    const INCLUDE_STORYBOARDS = PLAYER_RESPONSE_ARRAY.filter((p) => p?.storyboards)[0], VIDEO_DETAILS = PLAYER_RESPONSE_ARRAY.filter((p) => p?.videoDetails)[0]?.videoDetails || {}, MICROFORMAT = PLAYER_RESPONSE_ARRAY.filter((p) => p?.microformat)[0]?.microformat || null;
    VIDEO_DETAILS.liveBroadcastDetails = PLAYER_RESPONSES.web?.microformat?.playerMicroformatRenderer.liveBroadcastDetails || undefined;
    const STORYBOARDS = Extras_1.default.getStoryboards(INCLUDE_STORYBOARDS), MEDIA = Extras_1.default.getMedia(PLAYER_RESPONSES.web) || Extras_1.default.getMedia(PLAYER_RESPONSES.webCreator) || Extras_1.default.getMedia(PLAYER_RESPONSES.tvEmbedded) || Extras_1.default.getMedia(PLAYER_RESPONSES.ios) || Extras_1.default.getMedia(PLAYER_RESPONSES.android) || Extras_1.default.getMedia(PLAYER_RESPONSES.mweb) || Extras_1.default.getMedia(PLAYER_RESPONSES.tv), AGE_RESTRICTED = !!MEDIA && AGE_RESTRICTED_URLS.some((url) => Object.values(MEDIA || {}).some((v) => typeof v === 'string' && v.includes(url))), ADDITIONAL_DATA = {
        videoUrl: Url_1.default.getWatchPageUrl(id),
        author: Extras_1.default.getAuthor(NEXT_RESPONSES.web),
        media: MEDIA,
        likes: Extras_1.default.getLikes(NEXT_RESPONSES.web),
        ageRestricted: AGE_RESTRICTED,
        storyboards: STORYBOARDS,
        chapters: Extras_1.default.getChapters(NEXT_RESPONSES.web),
    }, FORMATS = PLAYER_RESPONSE_ARRAY.reduce((items, playerResponse) => {
        return [...items, ...Formats_1.default.parseFormats(playerResponse)];
    }, []);
    VIDEO_INFO.videoDetails = Extras_1.default.cleanVideoDetails(Object.assign({}, VIDEO_DETAILS, ADDITIONAL_DATA), MICROFORMAT?.playerMicroformatRenderer || null);
    VIDEO_INFO.relatedVideos = options.includesRelatedVideo ? Extras_1.default.getRelatedVideos(NEXT_RESPONSES.web, options.lang || 'en') : [];
    VIDEO_INFO.formats = isFromGetInfo ? FORMATS : [];
    return VIDEO_INFO;
}
async function getBasicInfo(link, options = {}) {
    Utils_1.default.checkForUpdates();
    const ID = Url_1.default.getVideoID(link), CACHE_KEY = ['getBasicInfo', ID, options.lang].join('-');
    return BASIC_INFO_CACHE.getOrSet(CACHE_KEY, () => _getBasicInfo(ID, options));
}
exports.default = getBasicInfo;
//# sourceMappingURL=BasicInfo.js.map