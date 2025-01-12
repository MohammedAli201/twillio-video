import './App.scss';




import React, { Component } from 'react';
import Room from './Room';

class App extends Component {
  state = {
    username: '',        // User's name
    roomName: '',        // Room name (set when user joins)
    roomNameInput: '',   // Room name input from the form
    token: null,         // Access token for joining the room
  };

  // Handles input changes for username and room name
  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  // Submits the form to join a room

  handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://localhost:9000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.state.username,
          room: this.state.roomNameInput,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const { token } = await response.json();
      this.setState({
        token: token,
        roomName: this.state.roomNameInput,
      });
    } catch (error) {
      console.error('Failed to fetch:', error);
      alert('Failed to connect to the server. Please try again.');
    }
  };
  
  // Logs the user out (disconnects from the room)
  handleLogout = () => {
    this.setState({
      token: null,    // Clear the token
      roomName: '',   // Clear the room name
    });
  };

  // Renders the component
  render() {
    return (
      <div className="app">
        {/* If the user has a token (joined the room) */}
        {this.state.token ? (
          <Room
            roomName={this.state.roomName}  // Pass the room name
            token={this.state.token}        // Pass the token
            handleLogout={this.handleLogout} // Pass the logout handler
          />
        ) : (
          // Render the lobby form for entering username and room name
          <form onSubmit={this.handleSubmit}>
            <h1>Twilio Video Chat</h1>
            <input
              type="text"
              name="username"
              value={this.state.username}
              onChange={this.handleChange}
              placeholder="Enter your name"
              required
            />
            <input
              type="text"
              name="roomNameInput"
              value={this.state.roomNameInput}
              onChange={this.handleChange}
              placeholder="Enter room name"
              required
            />
            <button type="submit">Join</button>
          </form>
        )}
      </div>
    );
  }
}

export default App;

