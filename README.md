# gerber-map

## About
This project uses [Leaflet](http://leafletjs.com/) to render PCB design files
turned into SVGs by [gerber-to-svg](https://github.com/mcous/gerber-to-svg).

## Demo
A demo of the repo contents is available at <http://roysmeding.nl/gerber-map/>.

## Files
- `data/power_stage_rev1_2015-03-20.json`
    This is the JSON file linked from index.html. It specifies the SVG filename,
    name and colour for each layer, as well as the positions, texts and types for
    all of the layout notes.

    In case you're curious, the design files are from one of my electronics
    projects, an [induction heater](https://github.com/roysmeding/induction-heater) power stage board.

- `index.html`
    This is the main HTML file. It includes the necessary JS and CSS, and contains
    a map div that points to the metadata JSON file using a data attribute.

- `gerber-viewer.js`
    The JavaScript file for the Gerber viewer class. After the document is loaded,
    the code here looks for all divs with the 'board-viewer' class, retrieves their
    associated JSON files, and sets up a Leaflet map with the listed layers and
    markers for each one. In addition, it contains some definitions for the
    coordinate transformation used, as well as the note markers.

- `gerber-layer.js`
    The JavaScript file for the Gerber layer class. It gets passed all the info it
    needs for one layer, then loads it asynchronously. It also contains the code for
    how the layer responds to zooming and such.

- `viewer.css`
    Gerber-viewer-specific CSS goes in here. It's mostly stuff for how large the
    map view is, and how the notes list is laid out.

- `leaflet.css`, `leaflet.js`, `leaflet-src.js`
    These are just Leaflet's files, unchanged from how they were downloaded.

- `data/*.svg`
    The SVG files pointed to by the JSON file.

- `images/*`
    This directory contains the icons for the 'warning' and 'error' markers.

- `README.md`
    You're reading it :)

- `LICENSE.md`
    The license. This software is licensed under the MIT License.

## Author
Written by [Roy Smeding](http://roysmeding.nl)
