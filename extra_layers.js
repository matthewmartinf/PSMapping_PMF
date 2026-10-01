// Extra layers: bottom trawl restrictions + 6 nautical mile limit
// Loaded after the main map script in index.html
(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c];
        });
    }

    // --- Areas where bottom trawling is prohibited or restricted ---
    map.createPane('pane_TrawlRestrictions');
    map.getPane('pane_TrawlRestrictions').style.zIndex = 398;
    var trawl = L.geoJson(json_BottomTrawlRestrictions, {
        pane: 'pane_TrawlRestrictions',
        style: function (f) {
            var prohibited = f.properties.type === 'Prohibited';
            return {
                color: '#B35806',
                weight: 1,
                fillColor: '#F1A340',
                fillOpacity: prohibited ? 0.35 : 0.18,
                dashArray: prohibited ? '' : '4 3'
            };
        },
        onEachFeature: function (f, layer) {
            var p = f.properties;
            var html = '<b>' + esc(p.name) + '</b><br>' +
                '<b>' + esc(p.type) + '</b> &middot; ' + esc(p.season) +
                (p.dates ? ' (' + esc(p.dates) + ')' : '') + '<br>' +
                '<p style="margin:6px 0">' + esc(p.restriction) + '</p>' +
                (p.reason ? '<i>' + esc(p.reason) + '</i><br>' : '') +
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
        {label: 'Bottom trawl restrictions<br /><table>' +
            '<tr><td><span style="display:inline-block;width:14px;height:12px;background:rgba(241,163,64,0.35);border:1px solid #B35806;"></span></td><td>Prohibited</td></tr>' +
            '<tr><td><span style="display:inline-block;width:14px;height:12px;background:rgba(241,163,64,0.18);border:1px dashed #B35806;"></span></td><td>Restricted</td></tr>' +
            '</table>', layer: trawl}
    );
    lay.setOverlayTree(overlaysTree);

    map.attributionControl.addAttribution('Fishing restrictions: Scottish Government &copy; Crown copyright; 6 nm limit: Admiralty Maritime Data Solutions');
})();
