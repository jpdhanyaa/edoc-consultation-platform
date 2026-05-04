// webrtc-utils.ts

// Function to initialize WebRTC media stream for video and audio
export async function initMediaStream(): Promise<MediaStream> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        return stream;
    } catch (error) {
        console.error('Error accessing media devices.', error);
        throw error;
    }
}

// Function to stop media tracks
export function stopMediaTracks(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
}

// Function to get audio and video elements
export function getMediaElements(stream: MediaStream): { videoElement: HTMLVideoElement; audioElement: HTMLAudioElement } {
    const videoElement = document.createElement('video');
    const audioElement = document.createElement('audio');
    videoElement.srcObject = stream;
    audioElement.srcObject = stream;
    videoElement.autoplay = true;
    audioElement.autoplay = true;
    return { videoElement, audioElement };
}