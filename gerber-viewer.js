SCALE = 1.;	// The scale we render things at. Units are whatever Leaflet uses per millimetre.

// The CRS we use for displaying maps. It's like the Simple CRS but has a scale factor.
L.CRS.SimpleScaled = L.extend({}, L.CRS, {
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(SCALE, 0, -SCALE, 0),

	scale: function (zoom) {
		return Math.pow(1.5, zoom);
	}
});

// warning and error markers
L.Icon.Warning = L.icon({
	iconUrl: 'images/warning.png',
	iconSize: [41, 36],
	popupAnchor: [0, -16]
});

// warning and error markers
L.Icon.Error = L.icon({
	iconUrl: 'images/error.png',
	iconSize: [41, 36],
	popupAnchor: [0, -16]
});

function boardInfoLoaded() {
	// called when the board info XHR updates status
	if(this.readyState != 4)
		return;

	if(this.status != 200)
		return;

	// at this point we can assume the board info was loaded.
	var info = JSON.parse(this.responseText);

	var layerObjects = {}, map = this.map;
	var layerLoaded = function(l) {
		// called when the layer SVG has been loaded.

		// check whether all layers have loaded
		for(var i in layerObjects) {
			if(!layerObjects[i]._loaded)
				return;
		}

		// if so, find the total bounds of the board and zoom to it
		var boardBounds = L.latLngBounds([]);
		for(var i in layerObjects) {
			boardBounds.extend(layerObjects[i].getBounds());
		}

		map.fitBounds(boardBounds);
	}

	// add layers
	for(var i=0; i<info.layers.length; i++) {
		var layer = info.layers[i];
		var l = new GerberLayer(i, this.map, layer, layerLoaded);
		layerObjects[layer.name] = l;
		this.map.addLayer(l);
	}

	L.control.layers([], layerObjects).addTo(this.map);

	for(var i=0; i<info.notes.length; i++) {
		var note = info.notes[i];

		var item = L.DomUtil.create("li", "note " + note.type, this.notes);

		if(!note.pos) {
			item.innerHTML = "<b>global " + note.type + ":</b><br>" + note.message;
		} else {
			item.innerHTML = "<b>" + note.type + " at (" + note.pos[0] + "," + note.pos[1] +"):</b><br>" + note.message;

			// add a marker
			var markerPos = L.latLng(note.pos[1], note.pos[0]); // latLng are effectively (y,x) so reverse

			var marker;
			switch(note.type) {
				case "warning":
					marker = L.marker(markerPos, {icon: L.Icon.Warning}).addTo(this.map);
					marker.bindPopup("<b>warning:</b> " + note.message);
					break;

				case "error":
					marker = L.marker(markerPos, {icon: L.Icon.Error}).addTo(this.map);
					marker.bindPopup("<b>error:</b> " + note.message);
					break;
			}

			item.marker = marker;
			item.addEventListener("click", function() { this.marker.openPopup(); });
		}
	}
}

function loadViewers() {
	var viewers = document.getElementsByClassName("board-viewer");
	Array.prototype.forEach.call(viewers, function(viewer) {
		// request board data file
		var request = new XMLHttpRequest();
		request.addEventListener("readystatechange", boardInfoLoaded);
		request.open('GET', viewer.dataset.boardUrl);

		// add map in preparation
		var div   = viewer.getElementsByClassName("map")[0];
		var notes = viewer.getElementsByClassName("notes")[0];
		var map = L.map(div, {crs: L.CRS.SimpleScaled}).setView(L.latLng(50,50), 0);

		request.viewer = viewer;
		request.map    = map;
		request.notes  = notes;

		request.send();
	} );
}

document.addEventListener("DOMContentLoaded", loadViewers);
