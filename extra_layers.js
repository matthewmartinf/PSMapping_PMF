// Extra layers: no-trawl and no-dredge zones + 6 nautical mile limit
// Loaded after the main map script in index.html
(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c];
        });
    }

    // --- Areas closed all year to both bottom trawling and dredging ---
    map.createPane('pane_TrawlRestrictions');
    map.getPane('pane_TrawlRestrictions').style.zIndex = 398;
    var trawl = L.geoJson(json_BottomTrawlRestrictions, {
        pane: 'pane_TrawlRestrictions',
        style: function (f) {
            if (f.properties.kind === 'other') {
                return {color: '#6B6B6B', weight: 1, dashArray: '4 3', fillColor: '#9E9E9E', fillOpacity: 0.25};
            }
            return {color: '#B35806', weight: 1.2, fillColor: '#F1A340', fillOpacity: 0.4};
        },
        onEachFeature: function (f, layer) {
            var p = f.properties;
            var html = '<b>' + esc(p.name) + '</b><br>' +
                (p.kind === 'other'
                    ? 'Closed to bottom trawling and dredging all year, for non-conservation reasons<br>'
                    : 'Closed to bottom trawling and dredging all year<br>') +
                (p.reason ? '<i>' + esc(p.reason) + '</i>' : '') +
                '<p style="margin:6px 0">' + esc(p.restriction) + '</p>' +
                (p.link ? '<a href="' + esc(p.link) + '" target="_blank">' + esc(p.regulation || 'Legislation') + '</a><br>' : esc(p.regulation) + '<br>') +
                '<small>Data updated: ' + esc(p.updated) + '</small>';
            layer.bindPopup(html, {maxHeight: 300, maxWidth: 320});
        }
    }).addTo(map);

    // --- 6 nautical mile limit ---
    map.createPane('pane_SixNM');
    map.getPane('pane_SixNM').style.zIndex = 399;
    var sixnm = L.geoJson(json_SixNauticalMileLimit, {
        pane: 'pane_SixNM',
        style: {color: '#08306B', weight: 2, dashArray: '8 5', opacity: 0.9},
        onEachFeature: function (f, layer) {
            layer.bindPopup('<b>6 nautical mile limit</b><br>Inshore waters boundary, measured from the baselines');
        }
    }).addTo(map);

    // --- Add both to the layer list ---
    overlaysTree.push(
        {label: '<span style="display:inline-block;width:22px;border-top:2px dashed #08306B;vertical-align:middle;"></span> 6 nautical mile limit', layer: sixnm},
        {label: 'No-trawl and no-dredge zones<br /><table>' +
            '<tr><td><span style="display:inline-block;width:14px;height:12px;background:rgba(241,163,64,0.4);border:1px solid #B35806;"></span></td><td>Conservation areas</td></tr>' +
            '<tr><td><span style="display:inline-block;width:14px;height:12px;background:rgba(158,158,158,0.25);border:1px dashed #6B6B6B;"></span></td><td>Other closures (military, health hazard)</td></tr>' +
            '</table>', layer: trawl}
    );
    lay.setOverlayTree(overlaysTree);

    map.attributionControl.addAttribution('Fishing restrictions: Scottish Government &copy; Crown copyright; 6 nm limit: Admiralty Maritime Data Solutions');
})();
