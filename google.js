const { google } = require('googleapis');

class GoogleAPI {
    constructor(id) {
        this.id = id;
        this.authentication().then(r => this.sheets = r);
    }

    getId() {
        return this.id;
    }

    getSheets() {
        return this.sheets;
    }

    async authentication() {
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        });
        const client = await auth.getClient();

        return google.sheets({
            version: 'v4',
            auth: client
        });
    }

    async getData() {
        return await this.getSheets().spreadsheets.values.get({
            spreadsheetId: this.getId(),
            range: 'A2:C', // From line 2 to line 1000
        });
    }
}

module.exports = GoogleAPI;