import React from 'react';
import { useGoogleLogin, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = '1062787699601-f9hqmcdf3s5fjbvd4fln1n1pq2o4ffrv.apps.googleusercontent.com';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const API_KEY = 'AIzaSyDLhD48ypiyAzzCqpk9hUghRU0JULve06c';

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';


window.onTokenReceived = function(resp) {
    console.log('token client callbacl')
    if (resp.error !== undefined) {
        throw (resp);
    }

    //this.setState({access_token: resp.access_token});
}

class SheetPicker extends React.Component {
    SheetPicker() {
        this.state = {
            access_token: ''
        }
    }

    componentDidMount() {
        console.log('componentDidMount');
    }

    handleAuthClick() {
       window.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: 'onTokenReceived', // defined later
          });

        window.gapi.load('client', () => {
            window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC]
              });
        
                if (window.gapi.client.getToken() === null) {
                    console.log('requesting token')

                    // Prompt the user to select a Google Account and ask for consent to share their data
                    // when establishing a new session.
                    window.tokenClient.requestAccessToken({prompt: 'consent'});
                } else {
                    // Skip display of account chooser and consent dialog for an existing session.
                    window.tokenClient.requestAccessToken({prompt: ''});
                }
        });
    }

    handleSignoutClick() {
        const token = window.gapi.client.getToken();
        if (token !== null) {
            window.google.accounts.oauth2.revoke(token.access_token);
            window.gapi.client.setToken('');
            document.getElementById('content').innerText = '';
            document.getElementById('authorize_button').innerText = 'Authorize';
            document.getElementById('signout_button').style.visibility = 'hidden';
        }
    }


    render() {
        return (
            <div>
                <button id="authorize_button" onClick={this.handleAuthClick.bind(this)}>Authorize</button>
                <button id="signout_button" onClick={this.handleSignoutClick}>Sign Out</button>
                <input type="text" id = "sheet_id" />
            </div>
        )
    }
}

export default SheetPicker;
