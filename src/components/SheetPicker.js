import React from 'react';

let gapi;
let google;

let tokenClient;
let gapiInited = false;
let gisInited = false;
let sheetsApiLoaded = false;

const CLIENT_ID = '1062787699601-f9hqmcdf3s5fjbvd4fln1n1pq2o4ffrv.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDLhD48ypiyAzzCqpk9hUghRU0JULve06c';

const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

let apisLoaded = false;
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        apisLoaded = true;
    }
}

async function initializeGapiClient() {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function postLoadGApi() {
    if (window.gapi) {
        window.gapi.load('client', initializeGapiClient);
    } else {
        setTimeout(postLoadGApi, 100);
    }
}

setTimeout(
    postLoadGApi, 100
)

function postLoad() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2 && window.google.accounts.oauth2.initTokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined later
        });

        gisInited = true;
        maybeEnableButtons();
    } else {
        setTimeout(postLoad, 100);
    }
}

setTimeout(
    postLoad, 100
)

const SheetPicker = () => {
    const [authorizeVisibility, setAuthorizeVisibility] = React.useState('visible');
    const [signoutVisibility, setSignoutVisibility] = React.useState('hidden');
    const [authorizeButtonText, setAuthorizeButtonText] = React.useState('Authorize');
    const [sheetId, setSheetId] = React.useState('');
    const [signout, setSignout] = React.useState('Sign Out');
    const [content, setContent] = React.useState('');
        
    function handleAuthClick() {
        if (!tokenClient) {
            return;
        }
        
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            setSignoutVisibility('visible');
            setAuthorizeButtonText('Refresh');

            const sheetId = document.getElementById('sheet_id').value;

            if (!!sheetId) {
                await listData(sheetId);
            }
        }

        if (window.gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    }

    
    function handleSignoutClick() {
        const token = window.gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            window.gapi.client.setToken('');
            setContent('');
            setAuthorizeButtonText('Authorize');
            setAuthorizeVisibility('hidden')
            setSignoutVisibility('hidden');
        }
    }

    
    async function listData(sheetId) {
        let response;
        try {
            // Fetch first 10 files
            response = await window.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'School Districts!A1:E',
            });
        } catch (err) {
            setContent(err.message);
            return;
        }
        const range = response.result;
        if (!range || !range.values || range.values.length == 0) {
            setContent('No values found.');
            return;
        }
        // Flatten to string to display
        const output = range.values.reduce(
            (str, row) => `${str}${row[0]}, ${row[4]}\n`,
            'Name, Major:\n');
        setContent(content);
    }

    return (
        <div>
            <button id="authorize_button" style={{visibility: authorizeVisibility}} onClick={handleAuthClick}>{authorizeButtonText}</button>
            <button id="signout_button" style={{visibility: signoutVisibility}} onClick={handleSignoutClick}>{signout}</button>
            <input type="text" id="sheet_id" value={sheetId} readOnly={true} />
            <div>
                {content}
            </div>
        </div>
    )
}

export default SheetPicker;