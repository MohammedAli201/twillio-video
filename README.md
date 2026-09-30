# Twilio Video Consultation Frontend

A React client for joining video rooms using a token supplied by a separate backend.

## What this project demonstrates

Video tracks, participant components, browser media permissions and room lifecycle.

## Run locally

```bash
npm ci
npm start
```

Create React App normally serves the development app at `http://localhost:3000`.
`npm run build` produces a static build. The existing `npm test` script does not by itself establish application test coverage.

Set `REACT_APP_API_URL` in a local `.env` file to your own test backend. The client calls `/api/Doctor/resource`. An invitation supplies `token`, `roomName` and `Username`; never publish a working invitation.

## Code guide

`src/App.js` exchanges an invitation for a room token; `Room.js`, `Participant.js` and `Track.js` render the call.

## Status

Integration prototype. Requires an authorised backend, a Twilio setup and camera/microphone permission. The current invitation flow uses URL parameters and needs a security review before production use.

Dependencies are recorded in `package-lock.json`. The original framework generation is retained; no claim of a current production dependency audit is made.
