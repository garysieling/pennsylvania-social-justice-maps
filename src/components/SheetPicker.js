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
        console.log('postLoad');
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
                debugger;
                console.log(response);
            }
        });

        window.tokenClient = tokenClient;

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
    const [accessToken, setAccessToken] = React.useState('');
        
    
    function removeOptions(selectElement) {
        let i, L = selectElement.options.length - 1;
        for(i = L; i >= 0; i--) {
            selectElement.remove(i);
        }
      }

    function toSelect(name, data, cbDisplay, cbValue) {
        const select = document.getElementById(name);
        removeOptions(select);

        select.options[select.options.length] = new Option('', '');

        select.options =
            data.map(
              (record, i) => {
                select.options[select.options.length] = 
                  new Option(cbDisplay(record), cbValue(record, i));
              });
      }

      async function listSheets() {
        let response;
        try {
          response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: sheetId
          });
          
          window.sheetResponse = response;

          toSelect(
            'sheet_name',
            response.result.sheets,
            (sheet) => sheet.properties.title,
            (sheet) => sheet.properties.title
          );

          
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }
        
        //document.getElementById('content').innerText = output;
      }


      function pickerCallback(data) {
        let url = 'nothing';
        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {            
          let doc = data[google.picker.Response.DOCUMENTS][0];
          
          gapi.client.setToken({access_token: accessToken});

          sheetId = doc.id;
          listSheets();
        }
      }

      function onReady() {
        //document.getElementById('signout_button').style.visibility = 'visible';
        //document.getElementById('authorize_button').innerText = 'Refresh';

        const picker = new google.picker.PickerBuilder()
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .addView(google.picker.ViewId.SPREADSHEETS)
                .setOAuthToken(accessToken)
                .setDeveloperKey(API_KEY)
                .setCallback(pickerCallback)
                .build();
          picker.setVisible(true);
      }

    function handleAuthClick() {
        if (!tokenClient) {
            return;
        }

        const callback = async (response) => {
            console.log('tokenClient.callback');
            console.log(response);
            if (response.error !== undefined) {
              throw (response);
            }

            debugger;
            
            setAccessToken(response.access_token);

            //onReady();
        };
 
        //tokenClient.callback = callback;

        if (window.gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            console.log('requesting access token 1');
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            console.log('requesting access token 2');
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
            <input type="text" id="access_token" value={accessToken} readOnly={true} />
            <input type="text" id="sheet_id" value={sheetId} readOnly={true} />
            <div>
                {content}
            </div>
        </div>
    )
}

export default SheetPicker;