import { YTDL_ClientsParams } from '../../meta/Clients';
export default class Tv {
    static getPlayerResponse(params: YTDL_ClientsParams): Promise<import("../../types/youtube").YTDL_InnertubeResponseInfo<import("../../types/youtube").YT_PlayerApiResponse>>;
}
