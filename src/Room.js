import React, { Component } from 'react';
import Participant from './Participant';
import './App.scss';
class Room extends Component {
    constructor(props) {
        super(props);

        this.state = {
            remoteParticipants: Array.from(this.props.room.participants.values()),
        };

        this.leaveRoom = this.leaveRoom.bind(this);
        this.addParticipant = this.addParticipant.bind(this);
        this.removeParticipant = this.removeParticipant.bind(this);
    }

    componentDidMount() {
        // Add event listeners for future remote participants coming or going
        this.props.room.on('participantConnected', this.addParticipant);
        this.props.room.on('participantDisconnected', this.removeParticipant);

        window.addEventListener('beforeunload', this.leaveRoom);
    }

    componentWillUnmount() {
        // Clean up event listeners when the component is unmounted
        this.props.room.off('participantConnected', this.addParticipant);
        this.props.room.off('participantDisconnected', this.removeParticipant);

        window.removeEventListener('beforeunload', this.leaveRoom);

        // Disconnect from the room if still connected
        this.leaveRoom();
    }

    addParticipant(participant) {
        console.log(`${participant.identity} has joined the room.`);

        this.setState(prevState => ({
            remoteParticipants: [...prevState.remoteParticipants, participant],
        }));
    }

    removeParticipant(participant) {
        console.log(`${participant.identity} has left the room`);

        this.setState(prevState => ({
            remoteParticipants: prevState.remoteParticipants.filter(
                p => p.identity !== participant.identity
            ),
        }));
    }

    leaveRoom() {
        if (this.props.room) {
            console.log('Disconnecting from room...');
            this.props.room.disconnect();
        }
        this.props.returnToLobby();
    }

    render() {
        return (
            <div className="room">
                <div className="participants">
                    <Participant
                        key={this.props.room.localParticipant.identity}
                        localParticipant={true}
                        participant={this.props.room.localParticipant}
                    />
                    {this.state.remoteParticipants.map(participant => (
                        <Participant key={participant.identity} participant={participant} />
                    ))}
                </div>
                <button id="leaveRoom" onClick={this.leaveRoom}>
                    Leave Room
                </button>
            </div>
        );
    }
}

export default Room;
