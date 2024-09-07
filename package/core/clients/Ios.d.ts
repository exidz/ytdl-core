import { YTDL_ClientsParams } from '../../meta/Clients';
export default class Ios {
    static getPlayerResponse(params: YTDL_ClientsParams): Promise<{
        isError: boolean;
        error: import("../errors").PlayerRequestError | null;
        contents: import("../../types/youtube").YT_YTInitialPlayerResponse;
    }>;
}
