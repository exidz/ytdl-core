import { YTDL_OAuth2Credentials } from '../types/Options';
export declare class OAuth2 {
    isEnabled: boolean;
    accessToken: string;
    refreshToken: string;
    expiryDate: string;
    clientId?: string;
    clientSecret?: string;
    constructor(credentials?: YTDL_OAuth2Credentials);
    private availableTokenCheck;
    private error;
    private getClientData;
    shouldRefreshToken(): boolean;
    refreshAccessToken(): Promise<void>;
    getAccessToken(): string;
}
