var map = null;

// initialise the 'map' object
function init() {

    // start position for the map (hardcoded here for simplicity)
    var lat = 52.37;
    var lon = 4.9;
    var zoom = 12;

    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        },

        initialize: function (options) {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(
            this, arguments);
            this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.trigger
            }, this.handlerOptions);
        },

        trigger: function (e) {
            var lonlat = map.getLonLatFromViewPortPx(e.xy);
            lonlatGCS = lonlat.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
            $.get('http://mijndev.openstreetmap.nl:7000?lat=' + lonlat.lat + '&lon=' + lonlat.lon, function (data) {
                if (data != null && data.length > 0) {
                    // alert(data[0]['naam']);
                    $("#tijden").empty();
                    $("#tijden").show();
                    for (x = 0; x < data.length; x++) {
                        if (data[x]['type'] == 'kv55') {
                            $("#tijden").append('<h1>' + data[x]['naam'] + '</h1><div id="tpc_' + data[x]['tpc'] + '">Laden van GOVI...</div>');
                            $.ajax({
                                url: "http://cache.govi.openov.nl/kv55/" + data[x]['tpc'],
                                success: renderKV55,
                                dataType: "xml"
                            });
                        } else if (data[x]['type'] == 'kv55-arriva') {
                            $("#tijden").append('<h1>' + data[x]['naam'] + '</h1><div id="tpc_' + data[x]['tpc'] + '">Laden van Arriva...</div>');
                            $.ajax({
                                url: "http://cache.govi.openov.nl/arriva/" + data[x]['tpc'],
                                success: renderKV55,
                                dataType: "xml"
                            });
                        }
                    }
                }
            }, "json");
        }

    });

    // complex object of type OpenLayers.Map
    var map_controls = [new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanPanel(), new OpenLayers.Control.ZoomPanel(), new OpenLayers.Control.LayerSwitcher()];

    map = new OpenLayers.Map('map', {
        controls: map_controls,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508),
        numZoomLevels: 18,
        maxResolution: 156543,
        units: 'm',
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        projection: new OpenLayers.Projection("EPSG:900913")
    });

    var layerTileNL = new OpenLayers.Layer.OSM("OpenStreetMap", "http://tile.openstreetmap.nl/tiles/${z}/${x}/${y}.png", {
        numZoomLevels: 19
    });

    var ov_zones_overlay = new OpenLayers.Layer.OSM("Zonekaart", "http://tiles.mijndev.openstreetmap.nl:8080/ov-zones/${z}/${x}/${y}.png", {
        attribution: '<br />Zones via <a href="http://www.agi-rws.nl/">AGI-RWS</a>',
        numZoomLevels: 19,
        isBaseLayer: false,
        visibility: true
    });

    var ov_haltes = new OpenLayers.Layer.OSM("Haltes", "http://tiles.mijndev.openstreetmap.nl:8080/openov-haltes/${z}/${x}/${y}.png", {
        attribution: '',
        numZoomLevels: 19,
        isBaseLayer: false,
        visibility: true
    });


    map.addLayers([layerTileNL, ov_zones_overlay, ov_haltes]);
    var click = new OpenLayers.Control.Click();
    map.addControl(click);
    click.activate();

    // center map
    if (!map.getCenter()) {
        map.setCenter(new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), zoom);
    }
}

function renderKV55(xmlDoc) {
    tpc = xmlDoc.getElementsByTagName("TimingPointCode")[0].childNodes[0].nodeValue;
    output = ''
    trips = xmlDoc.getElementsByTagName("Trip");
    for (i = 0; i < trips.length; i++) {
        owner = trips[i].getElementsByTagName("DataOwnerCode")[0].childNodes[0].nodeValue;
        name = trips[i].getElementsByTagName("DestinationName")[0].childNodes[0].nodeValue;
        expected = trips[i].getElementsByTagName("ExpectedDepartureTime")[0].childNodes[0];
        if (expected) {
            expected = expected.nodeValue;
        } else {
            expected = trips[i].getElementsByTagName("TargetDepartureTime")[0].childNodes[0].nodeValue;
        }

        output += '<b>' + expected + '</b>' + '&nbsp;' + name + '<br />';
    }
    $("#tpc_" + tpc).empty();
    $("#tpc_" + tpc).append(output);
}