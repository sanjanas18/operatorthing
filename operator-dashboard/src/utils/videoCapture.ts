export class VideoFrameCapture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private captureInterval: any = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  captureFrame(videoElement: HTMLVideoElement): string | null {
    if (!videoElement || videoElement.videoWidth === 0) {
      return null;
    }

    this.canvas.width = videoElement.videoWidth;
    this.canvas.height = videoElement.videoHeight;
    this.ctx.drawImage(videoElement, 0, 0);

    return this.canvas.toDataURL('image/jpeg', 0.7);
  }

  startCapturing(
    videoElement: HTMLVideoElement,
    onFrame: (frameData: string) => void,
    intervalMs: number = 10000
  ) {
    this.stopCapturing();

    this.captureInterval = setInterval(() => {
      const frame = this.captureFrame(videoElement);
      if (frame) {
        onFrame(frame);
      }
    }, intervalMs);

    console.log(`📸 Started capturing frames every ${intervalMs}ms`);
  }

  stopCapturing() {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
      console.log('🛑 Stopped capturing frames');
    }
  }
}

export default new VideoFrameCapture();