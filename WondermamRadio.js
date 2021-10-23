let GitHub = require('github-api');
const fs = require('fs');
let _ = require('lodash');
let {Base64} = require('js-base64');
const GoogleAPI = require('./google');

class WondermamRadio {
    constructor(tokens) {
        this.googleAPI = new GoogleAPI(tokens.google.token);
        this.github = new GitHub({
            token: tokens.github.token
        });
        this.repository = this.github.getRepo(tokens.github.login, tokens.github.repo);
        this.initData().then(r => this.data = JSON.parse(Base64.atob(r.data.content)));
        this.jsonFile = "data.json";
        this.columnNumber = 3;
        this.turn = 0;
        this.proposition = {
            band: "default",
            album: "default",
            proposition: "default"
        };
    }

    getJSONFile() {
        return this.jsonFile;
    }

    getData() {
        return this.data;
    }

    getColumnNumber() {
        return this.columnNumber;
    }

    getAPI() {
        return this.googleAPI;
    }

    getProposition() {
        return this.proposition;
    }

    async initData() {
        try {
            return await this.repository.getContents("main", "reco.json", false);
        } catch (err) {
            console.log("Error:[" + err + "]");
            return [];
        }
    }

    setData(data) {
        this.data = data;
    }

    async updateJSON() {
        let col = this.getColumnNumber();
        let jsonFile = this.getJSONFile();
        let response = await this.getAPI().getData();
        console.log("Response:[" + JSON.stringify(response.data) + "]");
        this.fillJSONFile(response.data, col, jsonFile);
        this.setProposition();
        await this.commit();
    }

    fillJSONFile(response, col, jsonFile) {
        let json = this.createJSON(response, col);
        try {
            if (_.isEqual(this.getData(), [])) { // No data set for the moment
                console.log("No data on git, put new JSON:[" + JSON.stringify(json) + "]");
                fs.writeFileSync(jsonFile, JSON.stringify(json));
            } else {
                this.updateData(json);
                fs.writeFileSync(jsonFile, JSON.stringify(this.getData()));
            }
        } catch (err) {
            console.error("Error:[" + err + "]");
        }
    }

    createJSON(data, col) {
        let json = [];
        for (let i = 0; i < data.values.length; i += col) {
            json.push({
                band: data.values[i][0],
                album: data.values[i][1],
                proposition: data.values[i][2],
                used: 0
            });
        }
        return json;
    }

    updateData(json) {
        let newData = _.differenceBy(json, this.getData(), "album");
        let concat = _.concat(this.getData(), newData);
        this.setData(concat);
        console.log("JSON updated");
    }

    async commit() {
        let today = new Date();
        let date = today.getFullYear() + "_" + (today.getMonth() + 1) + "_" + today.getDate();
        await this.repository.writeFile(
            'main',
            'reco.json',
            JSON.stringify(this.data),
            'Update ' + date
        );
        console.log("Changes committed");
    }

    setProposition() {
        this.data.sort(() => Math.random() - 0.5); // shuffle array
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].used === this.turn) {
                this.data[i].used += 1;
                this.proposition = this.data[i];
                return;
            }
        }
        this.turn += 1; // all album proposed the same number of time, begin another iteration
        this.setProposition();
    }

    getMessage() {
        let proposition = this.getProposition();
        return "Bonjour à tous ! La proposition d'aujourd'hui nous est fournie par ***" + proposition.proposition
            + "*** !\nEt il s'agit de l'album ***" + proposition.album + "*** de ***" + proposition.band
            + "*** !\nBonne écoute et bonne semaine à tous !";
    }
}

module.exports = WondermamRadio;