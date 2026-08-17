import MP4Box from 'mp4box';

/**
 * Checks if WebCodecs VideoDecoder is supported in current environment
 */
export function isWebCodecsSupported() {
  return typeof window !== 'undefined' && 'VideoDecoder' in window && 'VideoFrame' in window;
}

/**
 * Lura Video Decoder based on WebCodecs and MP4Box.js with frame windowing and memory cleanup
 */
export class LuraVideoDecoder {
  constructor(url, onReady = null, onError = null) {
    this.url = url;
    this.onReady = onReady;
    this.onError = onError;
    
    this.mp4boxFile = null;
    this.videoDecoder = null;
    this.videoTrack = null;
    this.samples = [];
    this.frames = new Map(); // timestampUs -> VideoFrame
    this.duration = 0;
    this.width = 0;
    this.height = 0;
    this.fps = 30;
    this.isReady = false;
    this.isDecoding = false;
    this.lastWindowCenterSec = 0;
    this.windowRadiusSec = 2.0; // Keep frames within ±2 seconds
    this.fallbackVideo = null;
    
    this.init();
  }

  async init() {
    if (!isWebCodecsSupported()) {
      console.warn('WebCodecs VideoDecoder not supported in this browser. Using HTML5 Video fallback.');
      this.initFallback();
      return;
    }

    try {
      this.mp4boxFile = MP4Box.createFile();
      
      this.mp4boxFile.onReady = async (info) => {
        const videoTrack = info.videoTracks[0];
        if (!videoTrack) {
          throw new Error('No video track found in file');
        }

        this.videoTrack = videoTrack;
        this.duration = (info.duration / info.timescale) || 5;
        this.width = videoTrack.video.width || 1280;
        this.height = videoTrack.video.height || 720;
        this.fps = (videoTrack.nb_samples / this.duration) || 30;

        await this.setupDecoder(videoTrack);
        this.mp4boxFile.setExtractionOptions(videoTrack.id, null, { nbSamples: 10000 });
        this.mp4boxFile.start();
      };

      this.mp4boxFile.onSamples = (trackId, ref, samples) => {
        if (this.videoTrack && trackId === this.videoTrack.id) {
          this.samples.push(...samples);
          if (!this.isReady) {
            this.isReady = true;
            if (this.onReady) this.onReady(this);
          }
        }
      };

      this.mp4boxFile.onError = (err) => {
        console.error('MP4Box error:', err);
        this.initFallback();
      };

      // Fetch file buffer
      const response = await fetch(this.url);
      if (!response.ok) throw new Error(`Failed to load video from ${this.url}`);
      const arrayBuffer = await response.arrayBuffer();
      arrayBuffer.fileStart = 0;
      this.mp4boxFile.appendBuffer(arrayBuffer);
      this.mp4boxFile.flush();
    } catch (err) {
      console.warn('WebCodecs decoding initialization failed, falling back to HTML5 video:', err);
      this.initFallback();
    }
  }

  async setupDecoder(videoTrack) {
    const rawCodec = videoTrack.codec || 'avc1.640028';
    
    // Extract description / avcC / hvcC box for decoder config
    const track = this.mp4boxFile.getTrackById(videoTrack.id);
    let description = null;
    if (track && track.mdia && track.mdia.minf && track.mdia.minf.stbl && track.mdia.minf.stbl.stsd) {
      const entry = track.mdia.minf.stbl.stsd.entries[0];
      if (entry && entry.avcC) {
        const stream = new MP4Box.DataStream(undefined, 0, MP4Box.DataStream.BIG_ENDIAN);
        entry.avcC.write(stream);
        description = new Uint8Array(stream.buffer, 8); // Skip length and box type
      }
    }

    let config = {
      codec: rawCodec,
      codedWidth: this.width,
      codedHeight: this.height,
      description: description,
    };

    // Step 1: Check if specific codec configuration is supported
    let isSupported = false;
    try {
      const support = await VideoDecoder.isConfigSupported(config);
      isSupported = support.supported;
    } catch {
      isSupported = false;
    }

    // Step 2: Fallback to baseline avc1 if not supported
    if (!isSupported) {
      console.warn(`Codec ${rawCodec} not supported, falling back to avc1.42E01E`);
      config.codec = 'avc1.42E01E';
    }

    this.videoDecoder = new VideoDecoder({
      output: (frame) => {
        this.frames.set(frame.timestamp, frame);
      },
      error: (e) => {
        console.error('VideoDecoder runtime error:', e);
      }
    });

    this.videoDecoder.configure(config);
  }

  initFallback() {
    this.fallbackVideo = document.createElement('video');
    this.fallbackVideo.src = this.url;
    this.fallbackVideo.crossOrigin = 'anonymous';
    this.fallbackVideo.muted = true;
    this.fallbackVideo.playsInline = true;
    this.fallbackVideo.preload = 'auto';

    this.fallbackVideo.onloadedmetadata = () => {
      this.duration = this.fallbackVideo.duration || 5;
      this.width = this.fallbackVideo.videoWidth || 1280;
      this.height = this.fallbackVideo.videoHeight || 720;
      this.isReady = true;
      if (this.onReady) this.onReady(this);
    };

    this.fallbackVideo.onerror = (e) => {
      if (this.onError) this.onError(e);
    };
  }

  /**
   * Request frames around time and prune outside ±2s window to avoid memory leaks
   */
  pruneFramesWindow(centerTimeSec) {
    if (this.frames.size === 0) return;
    const minUs = (centerTimeSec - this.windowRadiusSec) * 1_000_000;
    const maxUs = (centerTimeSec + this.windowRadiusSec) * 1_000_000;

    for (const [timestampUs, frame] of this.frames.entries()) {
      if (timestampUs < minUs || timestampUs > maxUs) {
        try {
          frame.close();
        } catch {
          // ignore closed frames
        }
        this.frames.delete(timestampUs);
      }
    }
  }

  /**
   * Decode samples needed for a specific time range
   */
  decodeAroundTime(timeSec) {
    if (!this.videoDecoder || this.videoDecoder.state !== 'configured' || this.samples.length === 0) return;
    this.pruneFramesWindow(timeSec);

    const targetUs = timeSec * 1_000_000;
    const rangeMinUs = (timeSec - 0.5) * 1_000_000;
    const rangeMaxUs = (timeSec + 1.5) * 1_000_000;

    // Find sample closest before rangeMin to start from keyframe
    let keyframeIndex = -1;
    let targetIndex = -1;

    for (let i = 0; i < this.samples.length; i++) {
      const sample = this.samples[i];
      const sampleTimeUs = (sample.dts / sample.timescale) * 1_000_000;
      if (sample.is_sync) {
        keyframeIndex = i;
      }
      if (sampleTimeUs >= rangeMinUs && targetIndex === -1) {
        targetIndex = i;
      }
      if (sampleTimeUs > rangeMaxUs) break;
    }

    const startIndex = keyframeIndex !== -1 ? keyframeIndex : 0;
    for (let i = startIndex; i < this.samples.length; i++) {
      const sample = this.samples[i];
      const sampleTimeUs = (sample.dts / sample.timescale) * 1_000_000;
      if (sampleTimeUs > rangeMaxUs) break;

      if (!this.frames.has(sampleTimeUs)) {
        try {
          const chunk = new EncodedVideoChunk({
            type: sample.is_sync ? 'key' : 'delta',
            timestamp: sampleTimeUs,
            duration: (sample.duration / sample.timescale) * 1_000_000,
            data: sample.data,
          });
          this.videoDecoder.decode(chunk);
        } catch {
          // Chunk decode issue handled by decoder error
        }
      }
    }
  }

  /**
   * Get frame at exact time (or closest preceding frame) or draw from fallback video
   */
  renderFrameToCanvas(ctx, timeSec, dx, dy, dw, dh, filter = 'none') {
    if (this.fallbackVideo) {
      if (Math.abs(this.fallbackVideo.currentTime - timeSec) > 0.05) {
        this.fallbackVideo.currentTime = Math.min(this.duration, Math.max(0, timeSec));
      }
      ctx.save();
      if (filter && filter !== 'none') ctx.filter = filter;
      try {
        ctx.drawImage(this.fallbackVideo, dx, dy, dw, dh);
      } catch {
        // Handle canvas drawing error if video frame not ready yet
      }
      ctx.restore();
      return true;
    }

    this.decodeAroundTime(timeSec);
    const targetUs = timeSec * 1_000_000;

    let closestFrame = null;
    let closestDiff = Infinity;

    for (const [timestampUs, frame] of this.frames.entries()) {
      const diff = Math.abs(timestampUs - targetUs);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestFrame = frame;
      }
    }

    if (closestFrame) {
      ctx.save();
      if (filter && filter !== 'none') ctx.filter = filter;
      try {
        ctx.drawImage(closestFrame, dx, dy, dw, dh);
      } catch {
        // In case frame is closed
      }
      ctx.restore();
      return true;
    }

    return false;
  }

  destroy() {
    for (const frame of this.frames.values()) {
      try {
        frame.close();
      } catch {
        // ignore
      }
    }
    this.frames.clear();
    if (this.videoDecoder) {
      try {
        if (this.videoDecoder.state !== 'closed') this.videoDecoder.close();
      } catch {
        // ignore
      }
    }
    if (this.fallbackVideo) {
      this.fallbackVideo.src = '';
      this.fallbackVideo = null;
    }
  }
}
