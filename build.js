var _ = require('lodash');

var fs = require('fs');

var openHabJsonStructure = {
    "template": "",
    "settings": [],
    "name": "TuneIn Playlist fetcher & display",
    "author": "Matthias Guth",
    "description": "Get and show playlist from external source for TuneIn station id",
    "source_url": "https://raw.githubusercontent.com/ChiSamurai/habpanel-tunein-playlist/master/build/tuneinPlaylistFetch.widget.json",
    "readme_url": "https://github.com/ChiSamurai/habpanel-tunein-playlist"
};

var template = fs.readFileSync("template.html", "utf8");
var settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
var templatePrepared = template.replace(/\n|\t/g, '');

var openHabJson = openHabJsonStructure;
openHabJson.settings = settings;
openHabJson.template = templatePrepared;

fs.writeFileSync("build/tuneinPlaylistFetch.widget.json", JSON.stringify(openHabJson, null, 2));