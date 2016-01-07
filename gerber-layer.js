// We expect SVGs to be in mil (svgerber seems to do this), but I prefer mm
MM_PER_MIL = 0.0254;

var GerberLayer = L.Class.extend({
	initialize: function (index, map, info, loadCallback) {
		// create a div for the SVG; Leaflet wants this.
		this._el = L.DomUtil.create('div', 'gerber-layer');

		// start an XHR to load the SVG
		this._request = new XMLHttpRequest();
		this._request._parent = this;
		this._request.onreadystatechange = this.onLoaded;
		this._request.open('GET', info.svg);
		this._request.send();

		// rendering info
		this._color          = info.color;
		this._zIndex         = index;
		this._el.style.color = info.color;	// the SVGs are set up so that the CSS color attribute determines their render color

		this._fn             = info.svg;
		this._loaded         = false;
		this._loadCallback   = loadCallback;
	},

	onLoaded: function() {
		if (this.readyState === 4 && this.status === 200) {
			// the SVG was loaded succcessfully, put it in the document
			var xmldoc = this.responseXML,
			    svg    = xmldoc.getElementsByTagName('svg')[0];

			var p = this._parent;

			// pull viewBox info from the SVG, which reflect its position and size in PCB coordinates
			var vx = svg.viewBox.baseVal.x      * MM_PER_MIL,
			    vy = svg.viewBox.baseVal.y      * MM_PER_MIL,
			    vw = svg.viewBox.baseVal.width  * MM_PER_MIL,
			    vh = svg.viewBox.baseVal.height * MM_PER_MIL;

			// turn those into two lat/long pairs for determining the SVG's position so it aligns right
			// remember, latitude is Y
			var northWest  = new L.latLng(vy+vh, vx),
			    southEast  = new L.latLng(vy, vx+vw);

			p._bounds = L.latLngBounds([northWest, southEast]);

			// zoom animations
			if (p._map.options.zoomAnimation && L.Browser.any3d) {
				L.DomUtil.addClass(svg, 'leaflet-zoom-animated');
			} else {
				L.DomUtil.addClass(svg, 'leaflet-zoom-hide');
			}

			svg.style.zIndex = p._zIndex;
			p._svg = svg;
			p._el.appendChild(svg);

			p._reset();

			p._loaded = true;
			p._loadCallback(this);
		}
	},

	getBounds: function() {
		// return the bounds
		return this._bounds;
	},

	onAdd: function (map) {
		this._map = map;

		// create a DOM element and put it into one of the map panes
		map.getPanes().overlayPane.appendChild(this._el);
		if(this._svg)
			this._svg.style.zIndex = this._zIndex;

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		// remove layer's DOM elements and listeners
		map.getPanes().overlayPane.removeChild(this._el);
		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
				map.off('zoomanim', this._animateZoom, this);
		}
	},

	_animateZoom: function (e) {
		if(this._svg) {
			console.log(e);
			var topLeft     = this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center),
			    bottomRight = this._map._latLngToNewLayerPoint(this._bounds.getSouthEast(), e.zoom, e.center),
			    scale       = this._map.getZoomScale(e.zoom);

			this._svg.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(topLeft) + ' scale(' + scale + ') ';
		}
	},

	_reset: function () {
		if(this._svg) {
			var topLeft     = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
			    bottomRight = this._map.latLngToLayerPoint(this._bounds.getSouthEast());

			// update the SVG position and size so that the layers align properly
			this._svg.width.baseVal.value  = bottomRight.x - topLeft.x;
			this._svg.height.baseVal.value = bottomRight.y - topLeft.y;
			L.DomUtil.setPosition(this._svg, topLeft);
		}
	}
});
