import jwt from 'jsonwebtoken';
import axios from 'axios';

class ZoomService {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    private async getAccessToken(): Promise<string> {
        // Return the cached token if there is still one
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const accountId = process.env.ZOOM_ACCOUNT_ID;
        const clientId = process.env.ZOOM_CLIENT_ID;
        const clientSecret = process.env.ZOOM_CLIENT_SECRET;

        if (!accountId || !clientId || !clientSecret) {
            throw new Error('Missing credentials');
        }

        try {
            const response = await axios.post(
                `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
                {},
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                    },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

            if (!this.accessToken) {
                throw new Error('No token in response');
            }

            return this.accessToken;
        } catch (error: any) {
            console.error('OAuth failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate');
        }
    }

    async createMeeting(data: {
        emergencyType: string;
        location: { latitude: number; longitude: number; address?: string };
    }): Promise<{
        meetingNumber: string;
        callerId: string;
        operatorId: string;
        sdkKey: string;
        password?: string;
    }> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                'https://api.zoom.us/v2/users/me/meetings',
                {
                    topic: `Emergency: ${data.emergencyType}`,
                    type: 1,
                    settings: {
                        host_video: true,
                        participant_video: true,
                        join_before_host: true,
                        waiting_room: false,
                        meeting_authentication: false,
                        password: false, 
                        audio: 'both',
                        auto_recording: 'cloud',
                        approval_type: 0,
                        audio_transcription: true,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const meetingNumber = response.data.id.toString();
            const password = response.data.password || '';
            const callerId = `caller_${Date.now()}`;
            const operatorId = `operator_${Date.now()}`;

            console.log('Created meeting:', meetingNumber, password ? `(PASSWORD: ${password})` : '(NO PASSWORD)');

            return {
                meetingNumber,
                callerId,
                operatorId,
                sdkKey: process.env.ZOOM_SDK_KEY || '',
                password,
            };
        } catch (error: any) {
            console.error('Create meeting error:', error.response?.data || error.message);
            throw new Error('Failed to create meeting: ' + (error.response?.data?.message || error.message));
        }
    }

    // Generate SDK signature
    generateSignature(meetingNumber: string, role: 0 | 1): string {
        const sdkKey = process.env.ZOOM_SDK_KEY;
        const sdkSecret = process.env.ZOOM_SDK_SECRET;

        if (!sdkKey || !sdkSecret) {
            throw new Error('Missing ZOOM_SDK_KEY or ZOOM_SDK_SECRET');
        }

        const iat = Math.round(Date.now() / 1000) - 30;
        const exp = iat + 60 * 60 * 2;

        const payload = {
            sdkKey: sdkKey,
            appKey: sdkKey,
            mn: meetingNumber,
            role: role,
            iat: iat,
            exp: exp,
            tokenExp: exp,
        };

        return jwt.sign(payload, sdkSecret);
    }

    getCallerSignature(meetingNumber: string): string {
        return this.generateSignature(meetingNumber, 0);
    }

    getOperatorSignature(meetingNumber: string): string {
        return this.generateSignature(meetingNumber, 1);
    }
}

export default new ZoomService();