import './App.scss';
import React, { Component } from 'react';
import Room from './Room';

const { connect } = require('twilio-video');

class App extends Component {
    constructor(props) {
        super(props); // Call the super constructor first!

        this.state = {
            identity: '',
            room: null,
        };

        this.joinRoom = this.joinRoom.bind(this);
        this.returnToLobby = this.returnToLobby.bind(this);
        this.updateIdentity = this.updateIdentity.bind(this);
        this.removePlaceholderText = this.removePlaceholderText.bind(this);

        this.inputRef = React.createRef(); // Initialize the ref properly
    }

    async joinRoom() {
        try {
            const response = await fetch('https://ef3d-2a01-799-175a-8600-8036-cf54-c3e0-5a6b.ngrok-free.app/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.state.identity,
                    room: 'cool-room',
                }),
            });
            const data = await response.json();
            const room = await connect(data.token, {
                name: 'cool-room',
                audio: true,
                video: true,
            });

            this.setState({ room: room });
        } catch (err) {
            console.log(err);
        }
    }

    returnToLobby() {
        this.setState({ room: null });
    }

    removePlaceholderText() {
        if (this.inputRef.current) {
            this.inputRef.current.placeholder = '';
        }
    }

    updateIdentity(event) {
        this.setState({
            identity: event.target.value,
        });
    }

    render() {
        const disabled = this.state.identity === '';

        return (
            <div className="app">
                {this.state.room === null ? (
                    <div className="lobby">
                        <input
                            value={this.state.identity}
                            onChange={this.updateIdentity}
                            ref={this.inputRef}
                            onClick={this.removePlaceholderText}
                            placeholder="What's your name?"
                        />
                        <button disabled={disabled} onClick={this.joinRoom}>
                            Join Room
                        </button>
                    </div>
                ) : (
                    <Room returnToLobby={this.returnToLobby} room={this.state.room} />
                )}
            </div>
        );
    }
}

export default App;
