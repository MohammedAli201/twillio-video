import React, {Component} from 'react';
import './App.scss';


class Participant extends Component {
  state = {
    videoTracks: [], // Array of video tracks for the participant
    audioTracks: [], // Array of audio tracks for the participant
  };

  // Helper method to extract tracks from track publications
  trackpubsToTracks = (trackPublications) => {
    return Array.from(trackPublications.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);
  };

  // Called when the component is mounted
  componentDidMount() {
    const { participant } = this.props;

    // Add video and audio tracks that the participant already has
    this.setState({
      videoTracks: this.trackpubsToTracks(participant.videoTracks),
      audioTracks: this.trackpubsToTracks(participant.audioTracks),
    });

    // Listen for new tracks being subscribed
    participant.on('trackSubscribed', this.trackSubscribed);

    // Listen for tracks being unsubscribed
    participant.on('trackUnsubscribed', this.trackUnsubscribed);
  }

  // Cleanup when the component is unmounted
  componentWillUnmount() {
    const { videoTracks, audioTracks } = this.state;

    // Detach all video and audio tracks
    videoTracks.forEach((track) => this.detachTrack(track));
    audioTracks.forEach((track) => this.detachTrack(track));

    const { participant } = this.props;
    participant.off('trackSubscribed', this.trackSubscribed);
    participant.off('trackUnsubscribed', this.trackUnsubscribed);
  }

  // Handle new track subscription
  trackSubscribed = (track) => {
    if (track.kind === 'video') {
      this.setState((prevState) => ({
        videoTracks: [...prevState.videoTracks, track],
      }));
    } else if (track.kind === 'audio') {
      this.setState((prevState) => ({
        audioTracks: [...prevState.audioTracks, track],
      }));
    }
  };

  // Handle track unsubscription
  trackUnsubscribed = (track) => {
    if (track.kind === 'video') {
      this.setState((prevState) => ({
        videoTracks: prevState.videoTracks.filter((t) => t !== track),
      }));
    } else if (track.kind === 'audio') {
      this.setState((prevState) => ({
        audioTracks: prevState.audioTracks.filter((t) => t !== track),
      }));
    }
  };

  // Helper method to attach a track to a DOM element
  attachTrack = (track, element) => {
    track.attach(element);
  };

  // Helper method to detach a track from the DOM
  detachTrack = (track) => {
    track.detach().forEach((element) => element.remove());
  };

  render() {
    const { participant } = this.props; // Get participant from props
    const { videoTracks, audioTracks } = this.state; // Get tracks from state

    return (
      <div className="participant">
        <h3>{participant.identity}</h3>
        <div className="video">
          {videoTracks.map((track) => (
            <video
              key={track.sid}
              ref={(ref) => {
                if (ref) this.attachTrack(track, ref);
              }}
              autoPlay
              playsInline
            />
          ))}
        </div>
        <div className="audio">
          {audioTracks.map((track) => (
            <audio
              key={track.sid}
              ref={(ref) => {
                if (ref) this.attachTrack(track, ref);
              }}
              autoPlay
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Participant;
