let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fs = require('fs');
let _ = require('lodash');

class WondermamRadio {
    constructor(link) {
        this.link = link;
        this.initData();
        this.jsonFile = "data.json";
        this.columnNumber = 3;
        this.turn = 0;
    }

    getLink() {
        return this.link;
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

    initData() {
        try {
            const data = fs.readFileSync("data.json", 'utf8');
            this.data = JSON.parse(data);
        } catch (err) {
            console.error(err);
            this.data = [];
        }
    }

    setData(data) {
        this.data = data;
    }

    updateJSON() {
        let wondermam = this;
        let req = new XMLHttpRequest();
        let col = this.getColumnNumber();
        let jsonFile = this.getJSONFile();
        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status === 200) { // if DONE and STATUS OK, execute code (async)
                let response = JSON.parse(req.responseText);
                wondermam.fillJSONFile(response, col, jsonFile);
            }
        };
        req.open("GET", this.getLink(), true);
        req.send(null);
    }

    fillJSONFile(response, col, jsonFile) {
        let json = this.createJSON(response, col);
        try {
            if (_.isEqual(this.getData(), [])) { // No data set for the moment
                fs.writeFileSync(jsonFile, JSON.stringify(json));
            } else {
                this.updateData(json);
                fs.writeFileSync(jsonFile, JSON.stringify(this.getData()));
            }
        } catch (err) {
            console.error(err);
        }
    }

    createJSON(response, col) {
        let json = [];
        for (let i = 0; i < response.feed.entry.length; i += col) {
            if (!(response.feed.entry[i].gs$cell.row == 1)) {
                json.push({
                    band: response.feed.entry[i].content.$t,
                    album: response.feed.entry[i + 1].content.$t,
                    proposition: response.feed.entry[i + 2].content.$t,
                    used: 0
                });
            }
        }
        return json;
    }

    updateData(json) {
        let newData = _.differenceBy(json, this.getData(), "album");
        let concat = _.concat(this.getData(), newData);
        this.setData(concat);
    }

    getProposition() {
        this.data.sort(() => Math.random() - 0.5); // shuffle array
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].used === this.turn) {
                this.data[i].used += 1;
                return this.data[i];
            }
        }
        this.turn += 1; // all album proposed the same number of time, begin another iteration
        this.getProposition();
    }

    getMessage() {
        let proposition = this.getProposition();
        return "Bonjour à tous ! La proposition d'aujourd'hui nous est fournie par ***" + proposition.proposition
            + "*** !\nEt il s'agit de l'album ***" + proposition.album + "*** de ***" + proposition.band
            + "*** !\nBonne écoute et bonne semaine à tous !";
    }
}

module.exports = WondermamRadio;