import axios from 'axios';
import ZoomService from './ZoomService.js';

class ZoomRecordingService {
    async getRecording(meetingNumber: string): Promise<any> {
        try {
            const token = await (ZoomService as any).getAccessToken();

            const response = await axios.get(
                `https://api.zoom.us/v2/meetings/${meetingNumber}/recordings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const recordings = response.data.recording_files || [];
            const transcript = response.data.recording_play_passcode;


            return {
                available: recordings.length > 0,
                videoUrl: recordings.find((f: any) => f.file_type === 'MP4')?.download_url || null,
                audioUrl: recordings.find((f: any) => f.file_type === 'M4A')?.download_url || null,
                transcriptUrl: recordings.find((f: any) => f.file_type === 'TRANSCRIPT')?.download_url || null,
                allFiles: recordings,
                passcode: transcript,
                processingStatus: response.data.recording_count > 0 ? 'completed' : 'processing',
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('⏳ Recording not ready yet (still processing)');
                return {
                    available: false,
                    processingStatus: 'processing',
                    message: 'Recording is being processed. Try again in a few minutes.',
                };
            }

            console.error('Error fetching recording:', error.response?.data || error.message);
            throw error;
        }
    }

    async downloadRecording(downloadUrl: string, outputPath: string): Promise<void> {
        try {
            const token = await (ZoomService as any).getAccessToken();

            const response = await axios.get(downloadUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'stream',
            });

            const fs = require('fs');
            const writer = fs.createWriteStream(outputPath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('Error downloading recording:', error);
            throw error;
        }
    }
}

export default new ZoomRecordingService();