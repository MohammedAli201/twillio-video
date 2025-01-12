import './App.scss';



import React, { Component } from 'react';
import Participant from './Participant';
import { connect } from 'twilio-video';

class Room extends Component {
  state = {
    participants: [], // List of participants in the room
  };

  // Called when the component is mounted
  componentDidMount() {
    const { token, roomName } = this.props; // Get token and room name from props

    // Connect to the Twilio Video room
    connect(token, { name: roomName }).then((room) => {
      this.room = room;

      // Add existing participants to the state
      this.setState({
        participants: Array.from(room.participants.values()),
      });

      // Listen for new participants joining
      room.on('participantConnected', this.handleParticipantConnected);

      // Listen for participants leaving
      room.on('participantDisconnected', this.handleParticipantDisconnected);
    });
  }

  // Cleanup when the component is unmounted
  componentWillUnmount() {
    // Disconnect from the room
    this.room.disconnect();
  }

  // Handler for when a new participant connects
  handleParticipantConnected = (participant) => {
    this.setState((prevState) => ({
      participants: [...prevState.participants, participant],
    }));
  };

  // Handler for when a participant disconnects
  handleParticipantDisconnected = (participant) => {
    this.setState((prevState) => ({
      participants: prevState.participants.filter((p) => p !== participant),
    }));
  };

  render() {
    const { roomName, handleLogout } = this.props; // Get props

    return (
      <div className="room">
        <h2>Room: {roomName}</h2>
        <button onClick={handleLogout}>Leave Room</button>

        {/* Render each participant */}
        <div className="participants">
          {this.state.participants.map((participant) => (
            <Participant
              key={participant.sid} // Unique identifier for the participant
              participant={participant} // Pass the participant object
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Room;
