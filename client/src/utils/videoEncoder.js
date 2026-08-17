import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

/**
 * Checks if WebCodecs VideoEncoder is supported
 */
export function isWebCodecsEncoderSupported() {
  return typeof window !== 'undefined' && 'VideoEncoder' in window;
}

/**
 * Lura Video & Audio Exporter using WebCodecs and mp4-muxer
 */
export class LuraVideoExporter {
  constructor(options = {}) {
    this.width = options.width || 1920;
    this.height = options.height || 1080;
    this.fps = options.fps || 30;
    this.quality = options.quality || 'medium'; // low, medium, high
    this.duration = options.duration || 5;
    this.onProgress = options.onProgress || null;
    
    this.muxer = null;
    this.target = null;
    this.videoEncoder = null;
    this.audioEncoder = null;
    this.hasAudio = options.hasAudio || false;
    this.frameIndex = 0;
    this.isCanceled = false;
  }

  getBitrate() {
    switch (this.quality) {
      case 'high': return 8_000_000; // 8 Mbps
      case 'low': return 2_000_000; // 2 Mbps
      case 'medium':
      default: return 4_500_000; // 4.5 Mbps
    }
  }

  async init() {
    this.target = new ArrayBufferTarget();

    const muxerOptions = {
      target: this.target,
      video: {
        codec: 'avc',
        width: this.width,
        height: this.height,
      },
      fastStart: 'in-memory',
      firstTimestampBehavior: 'offset',
    };

    if (this.hasAudio) {
      muxerOptions.audio = {
        codec: 'aac',
        numberOfChannels: 2,
        sampleRate: 44100,
      };
    }

    this.muxer = new Muxer(muxerOptions);

    // 1. Setup VideoEncoder
    const videoConfig = {
      codec: 'avc1.4d002a', // AVC Main Profile Level 4.2
      width: this.width,
      height: this.height,
      bitrate: this.getBitrate(),
      framerate: this.fps,
    };

    let isSupported = false;
    try {
      const support = await VideoEncoder.isConfigSupported(videoConfig);
      isSupported = support.supported;
    } catch {
      isSupported = false;
    }

    if (!isSupported) {
      videoConfig.codec = 'avc1.42001f'; // Baseline fallback
    }

    this.videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        this.muxer.addVideoChunk(chunk, meta);
      },
      error: (e) => {
        console.error('VideoEncoder error:', e);
      },
    });

    this.videoEncoder.configure(videoConfig);

    // 2. Setup AudioEncoder if audio is present and supported
    if (this.hasAudio && typeof AudioEncoder !== 'undefined') {
      try {
        const audioConfig = {
          codec: 'mp4a.40.2', // AAC-LC
          numberOfChannels: 2,
          sampleRate: 44100,
          bitrate: 128_000,
        };

        const audioSupport = await AudioEncoder.isConfigSupported(audioConfig);
        if (audioSupport.supported) {
          this.audioEncoder = new AudioEncoder({
            output: (chunk, meta) => {
              this.muxer.addAudioChunk(chunk, meta);
            },
            error: (e) => {
              console.error('AudioEncoder error:', e);
            },
          });
          this.audioEncoder.configure(audioConfig);
        }
      } catch (err) {
        console.warn('AudioEncoder setup skipped:', err);
        this.audioEncoder = null;
      }
    }
  }

  /**
   * Encode a single VideoFrame or Canvas element
   */
  async encodeCanvasFrame(canvas, timestampUs) {
    if (this.isCanceled || !this.videoEncoder) return;

    // Use VideoFrame from Canvas
    const frame = new VideoFrame(canvas, {
      timestamp: timestampUs,
      duration: Math.round(1_000_000 / this.fps),
    });

    // Keyframe roughly every 2 seconds (frame count based, not timestamp modulo)
    const isKeyframe = this.frameIndex % Math.round(this.fps * 2) === 0;

    try {
      this.videoEncoder.encode(frame, { keyFrame: isKeyframe });
    } finally {
      frame.close();
      this.frameIndex++;
    }
  }

  /**
   * Mix and encode audio clips from timeline
   */
  async encodeAudioTracks(audioClips, totalDurationSec) {
    if (!this.audioEncoder || !audioClips || audioClips.length === 0) return;

    try {
      const sampleRate = 44100;
      const offlineCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDurationSec), sampleRate);

      // Load & mix audio buffers into offline context
      for (const clip of audioClips) {
        if (!clip.src) continue;
        try {
          const res = await fetch(clip.src);
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;

          const gainNode = offlineCtx.createGain();
          gainNode.gain.value = clip.volume ?? 1;

          source.connect(gainNode);
          gainNode.connect(offlineCtx.destination);

          const startTime = Math.max(0, clip.startTime || 0);
          const offset = clip.offset || 0;
          const duration = clip.duration || (audioBuffer.duration - offset);
          source.start(startTime, offset, duration);
        } catch (e) {
          console.warn('Could not decode audio clip for export:', clip.name, e);
        }
      }

      const renderedBuffer = await offlineCtx.startRendering();
      const numChannels = renderedBuffer.numberOfChannels;
      const numFrames = renderedBuffer.length;
      const leftData = renderedBuffer.getChannelData(0);
      const rightData = numChannels > 1 ? renderedBuffer.getChannelData(1) : leftData;

      // Encode audio chunks in standard sizes (1024 samples per AAC frame)
      const chunkSize = 1024;
      for (let offset = 0; offset < numFrames; offset += chunkSize) {
        if (this.isCanceled) break;

        const currentChunkSize = Math.min(chunkSize, numFrames - offset);
        const planarData = new Float32Array(currentChunkSize * 2);

        for (let i = 0; i < currentChunkSize; i++) {
          planarData[i] = leftData[offset + i];
          planarData[currentChunkSize + i] = rightData[offset + i];
        }

        const audioData = new AudioData({
          format: 'f32-planar',
          sampleRate: sampleRate,
          numberOfFrames: currentChunkSize,
          numberOfChannels: 2,
          timestamp: Math.round((offset / sampleRate) * 1_000_000),
          data: planarData,
        });

        this.audioEncoder.encode(audioData);
        audioData.close();
      }
    } catch (err) {
      console.warn('Audio export encoding failed, continuing with video only:', err);
    }
  }

  /**
   * Finalize encoding and produce MP4 blob
   */
  async finalize() {
    try {
      if (this.videoEncoder && this.videoEncoder.state === 'configured') {
        await this.videoEncoder.flush();
      }
      if (this.audioEncoder && this.audioEncoder.state === 'configured') {
        await this.audioEncoder.flush();
      }
      if (this.muxer) {
        this.muxer.finalize();
      }

      const buffer = this.target.buffer;
      return new Blob([buffer], { type: 'video/mp4' });
    } finally {
      this.cleanup();
    }
  }

  cleanup() {
    if (this.videoEncoder) {
      try {
        if (this.videoEncoder.state !== 'closed') this.videoEncoder.close();
      } catch {
        // ignore
      }
      this.videoEncoder = null;
    }
    if (this.audioEncoder) {
      try {
        if (this.audioEncoder.state !== 'closed') this.audioEncoder.close();
      } catch {
        // ignore
      }
      this.audioEncoder = null;
    }
  }

  cancel() {
    this.isCanceled = true;
    this.cleanup();
  }
}
