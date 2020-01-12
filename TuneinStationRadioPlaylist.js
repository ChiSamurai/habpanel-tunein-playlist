"use strict";

angular.module('app.widgets').service('tuneinPlaylistService', TuneinPlaylistService).controller('TuneinPlaylistController', TuneinPlaylistController);
TuneinPlaylistController.$inject = ['$scope', '$timeout', 'OHService', 'tuneinPlaylistService'];

TuneinPlaylistService.$inject = ['$http', '$cacheFactory'];

function TuneinPlaylistController($scope, $timeout, OHService, tuneinPlaylistService) {
    var $ctrl = this;

    var tuneinStationIdName = null;
    var initController = function initController() {
        $ctrl.state = {
            error: false,
            tuneinStationId: null,
            result: [],
        };
        $ctrl.model = {
            query: ''
        };
    };

    function getPlaylistLoop() {
        tuneinPlaylistService.fetchPlaylist($ctrl.state.tuneinStationId).then(function (result) {
            if (!result.data) $ctrl.state.result = [];
            else if (
                $ctrl.state.result.length === 0 ||
                result.data[0].id !== $ctrl.state.result[0].id
            ) {
                $ctrl.state.result = result.data;
            }
        });
        setTimeout(getPlaylistLoop, 10000);
    }

    setTimeout(getPlaylistLoop, 3000);

    initController();

    OHService.onUpdate($scope, $scope.tuneinStationIdName, function (event) {
        var newStationId = OHService.getItem($ctrl.tuneinStationIdName).state;
        if ($ctrl.state.tuneinStationId !== newStationId) {
            console.log("StationId update from", $ctrl.state.tuneinStationId, "to", newStationId);
            $ctrl.state.result = [];
            $ctrl.state.tuneinStationId = newStationId;
        }
    });


    $scope.$watch('config.tuneinStationIdName', function (tuneinStationIdName) {
        $ctrl.tuneinStationIdName = tuneinStationIdName;
        console.log("configured tuneinStationIdName found:", tuneinStationIdName);
    });



}


function TuneinPlaylistService($http, $cacheFactory) {
    var $service = this;
    var cache = $cacheFactory('spotify-playlister');

    var fetchPlaylistPromises = new Map();
    fetchPlaylistPromises.set('s20291', function () {
        return fetch("https://www.swr.de/~webradio/swr1/bw/swr1bw-playlist-100~playerbarPlaylist_stationid-swr1bw_-16d08524256910a0d4aa31c50afd973e41b2c25f.json");
    });

    fetchPlaylistPromises.set('s20293', function () {
        return fetch("https://www.swr.de/~webradio/swr4/bw/swr4bw-playlist-100~playerbarPlaylist_stationid-swr4st_-eeb1dfdf8592694beafbe1ac2411f9a32dc78bd2.json");
    });


    var enqueueCacheRemove = function enqueueCacheRemove(key) {
        setTimeout(function () {
            cache.remove(key);
        }, 10000);
    };

    var fetch = function fetch(url) {
        enqueueCacheRemove(url);
        return $http({
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };

    return {
        fetchPlaylist: function fetchPlaylist(tuneinStationId) {
            var playlistFunction = fetchPlaylistPromises.get(tuneinStationId);
            return playlistFunction ? playlistFunction() : Promise.resolve([]);
        }
    };
}