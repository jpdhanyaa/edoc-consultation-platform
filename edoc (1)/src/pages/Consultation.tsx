import React, { useEffect, useRef, useState } from 'react';

const Consultation = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);

    useEffect(() => {
        const getMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setLocalStream(stream);
                localVideoRef.current.srcObject = stream;
            } catch (error) {
                console.error('Error accessing media devices.', error);
            }
        };

        getMedia();
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleCamera = () => {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
    };

    const toggleMic = () => {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
    };

    return (
        <div>
            <video ref={localVideoRef} autoPlay muted></video>
            <video ref={remoteVideoRef} autoPlay></video>
            <button onClick={toggleCamera}>{isCameraOn ? 'Turn off Camera' : 'Turn on Camera'}</button>
            <button onClick={toggleMic}>{isMicOn ? 'Mute' : 'Unmute'}</button>
        </div>
    );
};

export default Consultation;