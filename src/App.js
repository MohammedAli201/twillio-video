import './App.scss';
import React, { Component } from 'react';
import Room from './Room';
export const MAIN_API_URL = "https://bariiso.com";
const { connect } = require('twilio-video');

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            identity: '',
            roomName: '',
            room: null,
            errorMessage: '',
            showErrorPage: false,
        };

        this.joinRoom = this.joinRoom.bind(this);
        this.returnToLobby = this.returnToLobby.bind(this);
        this.updateIdentity = this.updateIdentity.bind(this);
        this.updateRoomName = this.updateRoomName.bind(this);
    }

    componentDidMount() {
        // Automatically join the room if URL contains the required parameters
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL params:', urlParams.toString());
        const token = urlParams.get('token');
        const roomName = urlParams.get('roomName');
        const name = urlParams.get('Username');

        if (token && roomName && name) {
            this.setState(
                {
                    identity: decodeURIComponent(name),
                    roomName: decodeURIComponent(roomName),
                },
                this.joinRoom // Automatically call joinRoom
            );
        } else {
            this.setState({ errorMessage: 'Invalid or missing parameters in the link.', showErrorPage: true });
        }
    }
    async joinRoom() {
        try {
            console.log('[joinRoom] Requesting media permissions...');
            await this.requestMediaPermissions();
            console.log('[joinRoom] Media permissions granted.');

            console.log('[joinRoom] Extracting URL parameters...');
            const { token, roomName, userName } = this.extractUrlParameters();

            if (!token || !roomName || !userName) {
                throw new Error('Missing required URL parameters (token, roomName, or userName).');
            }
            console.log('[joinRoom] Parameters extracted:', { token, roomName, userName });

            console.log('[joinRoom] Fetching token from API...');
            const fetchedToken = await this.fetchRoomToken(token, roomName, userName);

            console.log('[joinRoom] Connecting to the room...');
            const room = await this.connectToRoom(fetchedToken, roomName);
            console.log('[joinRoom] Connected to room successfully.');

            // Update state with the connected room
            this.setState({ room });
        } catch (err) {
            console.error('[joinRoom] Error occurred:', err);
            this.handleJoinRoomError(err);
        }
    }

    // Helper to request media permissions
    async requestMediaPermissions() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch (err) {
            console.error('[requestMediaPermissions] Failed to get media permissions:', err);
            throw new Error('Unable to access camera or microphone. Please grant permissions.');
        }
    }

    // Helper to extract URL parameters
    extractUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            token: urlParams.get('token'),
            roomName: urlParams.get('roomName'),
            userName: urlParams.get('Username') || urlParams.get('name'),
        };
    }

    // Helper to fetch room token
    async fetchRoomToken(token, roomName, userName) {
        const apiUrl = `${MAIN_API_URL}/api/Doctor/resource`;
        const requestBody = JSON.stringify({ token, roomName, userName });
        console.log('[fetchRoomToken] Request body:', requestBody);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody,
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('This link is not yet active.');
            }
            if (response.status === 410) {
                throw new Error('This link has expired.');
            }
            throw new Error(`Failed to fetch token: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error === 'Token expired') {
            throw new Error('This link has expired.');
        }
        console.log('[fetchRoomToken] Response:', data);

        // save in local storage
        localStorage.setItem('token', data.twilioToken);
        // romename 
        localStorage.setItem('roomName', roomName);

        return data.newToken;
    }

    // Helper to connect to a room
    async connectToRoom(token, roomName) {
        if (!token) {
            // take from local storage
            token = localStorage.getItem('token');
            roomName = localStorage.getItem('roomName');
        }
        console.log('[connectToRoom] Connecting to room:', roomName);
        console.log('[connectToRoom] Token:', token);
        return await connect(token, {
            name: roomName,
            audio: true,
            video: {
                width: 640,
                height: 480,
                frameRate: 15,
            },
            networkQuality: { local: 1, remote: 1 },
            maxAudioBitrate: 16000,
        });
    }

    // Helper to handle errors
    handleJoinRoomError(err) {
        if (err.message === 'This link has expired.' || err.message === 'This link is not yet active.') {
            this.setState({ errorMessage: err.message, showErrorPage: true });
        } else {
            this.setState({ errorMessage: 'An error occurred while connecting to the room.', showErrorPage: true });
        }
        this.stopCamera();
    }


    stopCamera() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });
    }

    returnToLobby() {
        this.setState({ room: null, errorMessage: '', showErrorPage: false });
    }

    updateIdentity(event) {
        this.setState({
            identity: event.target.value,
        });
    }

    updateRoomName(event) {
        this.setState({
            roomName: event.target.value,
        });
    }

    render() {
        const disabled = this.state.identity === '' || this.state.roomName === '';

        if (this.state.showErrorPage) {
            return (
                <div className="error-page">
                    <h1>Error</h1>
                    <p>{this.state.errorMessage}</p>
                    <button onClick={this.returnToLobby}>Go Back</button>
                </div>
            );
        }

        return (
            <div className="app">
                {this.state.room === null ? (
                    <div className="lobby">
                        <input
                            value={this.state.identity}
                            onChange={this.updateIdentity}
                            placeholder="What's your name?"
                        />
                        <input
                            value={this.state.roomName}
                            onChange={this.updateRoomName}
                            placeholder="Enter room name"
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
