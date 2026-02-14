

// import jwt from 'jsonwebtoken';

// class ZoomService {
//   generateSignature(meetingNumber: string, role: 0 | 1): string {
//     const sdkKey = process.env.ZOOM_SDK_KEY;
//     const sdkSecret = process.env.ZOOM_SDK_SECRET;

//     if (!sdkKey || !sdkSecret) {
//       throw new Error('Zoom SDK credentials not configured');
//     }

//     const iat = Math.round(Date.now() / 1000) - 30;
//     const exp = iat + 60 * 60 * 2; // 2 hours

//     const payload = {
//       sdkKey: sdkKey,
//       appKey: sdkKey, // Meeting SDK needs this
//       mn: meetingNumber,
//       role: role,
//       iat: iat,
//       exp: exp,
//       tokenExp: exp,
//     };

//     const token = jwt.sign(payload, sdkSecret);
//     console.log('Generated signature payload:', payload);
    
//     return token;
//   }

//   createMeeting(data: {
//     emergencyType: string;
//     location: { latitude: number; longitude: number; address?: string };
//   }): {
//     meetingNumber: string;
//     callerId: string;
//     operatorId: string;
//     sdkKey: string;
//   } {
//     const meetingNumber = Date.now().toString();
//     const callerId = `caller_${Date.now()}`;
//     const operatorId = `operator_${Date.now()}`;

//     return {
//       meetingNumber,
//       callerId,
//       operatorId,
//       sdkKey: process.env.ZOOM_SDK_KEY || '',
//     };
//   }

//   getCallerSignature(meetingNumber: string): string {
//     return this.generateSignature(meetingNumber, 0);
//   }

//   getOperatorSignature(meetingNumber: string): string {
//     return this.generateSignature(meetingNumber, 1);
//   }
// }

// export default new ZoomService();

import jwt from 'jsonwebtoken';
import axios from 'axios';

class ZoomService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Get OAuth access token
//   private async getAccessToken(): Promise<string> {
//     if (this.accessToken && Date.now() < this.tokenExpiry) {
//       return this.accessToken;
//     }

//     const accountId = process.env.ZOOM_ACCOUNT_ID;
//     const clientId = process.env.ZOOM_CLIENT_ID;
//     const clientSecret = process.env.ZOOM_CLIENT_SECRET;

//     if (!accountId || !clientId || !clientSecret) {
//       throw new Error('❌ Missing Zoom OAuth credentials in .env');
//     }

//     try {
//       console.log('🔑 Getting Zoom access token...');
      
//       const response = await axios.post(
//         `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
//         {},
//         {
//           headers: {
//             'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
//           },
//         }
//       );

//       this.accessToken = response.data.access_token;
//       this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      
//       console.log('✅ Got Zoom access token');
//         return this.accessToken!;
//     } catch (error: any) {
//       console.error('❌ OAuth error:', error.response?.data || error.message);
//       throw new Error('Failed to authenticate with Zoom');
//     }
//   }

// private async getAccessToken(): Promise<string> {
//   // Return cached token if still valid
//   if (this.accessToken && Date.now() < this.tokenExpiry) {
//     return this.accessToken;
//   }

//   const accountId = process.env.ZOOM_ACCOUNT_ID;
//   const clientId = process.env.ZOOM_CLIENT_ID;
//   const clientSecret = process.env.ZOOM_CLIENT_SECRET;

//   // DEBUG: Print what we're using (hide most of secret)
//   console.log('🔍 Using credentials:');
//   console.log('  Account ID:', accountId);
//   console.log('  Client ID:', clientId);
//   console.log('  Client Secret:', clientSecret ? `${clientSecret.substring(0, 5)}...${clientSecret.substring(clientSecret.length - 5)}` : 'MISSING');

//   if (!accountId || !clientId || !clientSecret) {
//     throw new Error('❌ Missing Zoom OAuth credentials in .env');
//   }

//   try {
//     console.log('🔑 Getting Zoom access token...');
    
//     const response = await axios.post(
//       `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
//       {},
//       {
//         headers: {
//           'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
//         },
//       }
//     );

//     this.accessToken = response.data.access_token;
//     this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    
//     console.log('✅ Got Zoom access token');
    
//     if (!this.accessToken) {
//       throw new Error('Failed to get access token from Zoom');
//     }
    
//     return this.accessToken;
//   } catch (error: any) {
//     console.error('❌ OAuth error:', error.response?.data || error.message);
//     throw new Error('Failed to authenticate with Zoom');
//   }
// }



private async getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (this.accessToken && Date.now() < this.tokenExpiry) {
    return this.accessToken;
  }

  // HARDCODED - Copy the FULL Client Secret from Zoom
  const accountId = 'ykNo3oL7R925z2z5xVBYkg';
  const clientId = 'MvFG4tfbSvu34hYIlmsxQw';
  const clientSecret: string = 'p2Rwy1Poj68rONip7RGvqcp9SjESVqUf'; // ← PASTE FULL SECRET HERE (go to Zoom, click "View", copy ALL of it)

  console.log('🔍 Hardcoded credentials test:');
  console.log('  Account ID:', accountId);
  console.log('  Client ID:', clientId);
  console.log('  Client Secret length:', clientSecret.length, 'chars');
  console.log('  Client Secret preview:', clientSecret ? `${clientSecret.substring(0, 5)}...${clientSecret.substring(clientSecret.length - 5)}` : 'EMPTY!');

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('❌ Missing credentials');
  }

  try {
    console.log('🔑 Requesting access token...');
    
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
    
    console.log('✅ SUCCESS! Got access token');
    
    if (!this.accessToken) {
      throw new Error('No token in response');
    }
    
    return this.accessToken;
  } catch (error: any) {
    console.error('❌ OAuth failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate');
  }
}



  // Create actual Zoom meeting - NO PASSWORD
//   async createMeeting(data: {
//     emergencyType: string;
//     location: { latitude: number; longitude: number; address?: string };
//   }): Promise<{
//     meetingNumber: string;
//     callerId: string;
//     operatorId: string;
//     sdkKey: string;
//   }> {
//     try {
//       const token = await this.getAccessToken();
      
//       console.log('📞 Creating Zoom meeting (NO PASSWORD)...');
      
//       const response = await axios.post(
//         'https://api.zoom.us/v2/users/me/meetings',
//         {
//           topic: `Emergency: ${data.emergencyType}`,
//           type: 1, // Instant meeting
//           settings: {
//             host_video: true,
//             participant_video: true,
//             join_before_host: true,
//             waiting_room: false,
//             meeting_authentication: false, // ← NO PASSWORD
//             password: false, // ← DISABLE PASSWORD
//             audio: 'both',
//             auto_recording: 'cloud',
//             approval_type: 0,
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       const meetingNumber = response.data.id.toString();
//       const callerId = `caller_${Date.now()}`;
//       const operatorId = `operator_${Date.now()}`;

//       console.log('✅ Created meeting:', meetingNumber, '(NO PASSWORD)');

//       return {
//         meetingNumber,
//         callerId,
//         operatorId,
//         sdkKey: process.env.ZOOM_SDK_KEY || '',
//       };
//     } catch (error: any) {
//       console.error('❌ Create meeting error:', error.response?.data || error.message);
//       throw new Error('Failed to create meeting: ' + (error.response?.data?.message || error.message));
//     }
//   }

async createMeeting(data: {
  emergencyType: string;
  location: { latitude: number; longitude: number; address?: string };
}): Promise<{
  meetingNumber: string;
  callerId: string;
  operatorId: string;
  sdkKey: string;
  password?: string; // ← ADD THIS
}> {
  try {
    const token = await this.getAccessToken();
    
    console.log('📞 Creating Zoom meeting (NO PASSWORD)...');
    
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
          password: false, // Try to disable
          audio: 'both',
          auto_recording: 'cloud',
          approval_type: 0,
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
    const password = response.data.password || ''; // ← Capture password from response
    const callerId = `caller_${Date.now()}`;
    const operatorId = `operator_${Date.now()}`;

    console.log('✅ Created meeting:', meetingNumber, password ? `(PASSWORD: ${password})` : '(NO PASSWORD)');

    return {
      meetingNumber,
      callerId,
      operatorId,
      sdkKey: process.env.ZOOM_SDK_KEY || '',
      password, // ← RETURN IT
    };
  } catch (error: any) {
    console.error('❌ Create meeting error:', error.response?.data || error.message);
    throw new Error('Failed to create meeting: ' + (error.response?.data?.message || error.message));
  }
}

  // Generate SDK signature
  generateSignature(meetingNumber: string, role: 0 | 1): string {
    const sdkKey = process.env.ZOOM_SDK_KEY;
    const sdkSecret = process.env.ZOOM_SDK_SECRET;

    if (!sdkKey || !sdkSecret) {
      throw new Error('❌ Missing ZOOM_SDK_KEY or ZOOM_SDK_SECRET');
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