/* Fishing activity layer with metric switcher + legend.
   Needs: Leaflet, the global `map` (qgis2web creates it), and data/fishing_2025.js loaded first. */
(function () {
  if (typeof map === 'undefined' || typeof json_fishing_2025 === 'undefined') {
    console.warn('fishing_layer.js: map or fishing data not found');
    return;
  }

  var COLOURS = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];

  var METRICS = {
    FISH_HRS: {
      label: 'Fishing hours',
      title: 'Fishing hours (hrs/year)',
      breaks: [5, 10, 50, 100, 300],
      unit: ' hrs',
      fmt: function (v) { return v.toLocaleString('en-GB', { maximumFractionDigits: 1 }); }
    },
    SAR: {
      label: 'Seabed swept (surface)',
      title: 'Surface swept-area ratio<br><small>times seabed swept per year</small>',
      breaks: [0.05, 0.2, 0.5, 1, 3],
      unit: '',
      fmt: function (v) { return v.toFixed(2); }
    },
    ssSAR: {
      label: 'Seabed swept (subsurface)',
      title: 'Subsurface swept-area ratio<br><small>times swept per year, gear &gt;2 cm deep</small>',
      breaks: [0.02, 0.05, 0.2, 0.5, 1],
      unit: '',
      fmt: function (v) { return v.toFixed(2); }
    }
  };
  var current = 'FISH_HRS';

  function colourFor(v, breaks) {
    for (var i = 0; i < breaks.length; i++) if (v < breaks[i]) return COLOURS[i];
    return COLOURS[COLOURS.length - 1];
  }

  // Own pane below qgis2web's layers (they sit at z-index 400+), so PMF features stay on top
  map.createPane('pane_fishing');
  map.getPane('pane_fishing').style.zIndex = 390;

  var layer = L.geoJSON(json_fishing_2025, {
    pane: 'pane_fishing',
    renderer: L.canvas({ pane: 'pane_fishing' }),
    style: styleFn,
    onEachFeature: function (f, l) {
      l.bindPopup(function () {
        var p = f.properties, rows = '';
        Object.keys(METRICS).forEach(function (k) {
          var m = METRICS[k];
          rows += '<tr' + (k === current ? ' style="font-weight:bold"' : '') + '><td>' + m.label +
                  '</td><td style="text-align:right;padding-left:8px">' + m.fmt(p[k]) + m.unit + '</td></tr>';
        });
        return '<strong>Fishing activity 2025</strong><table>' + rows + '</table>' +
               '<small>c-square ' + p.cSquare + '</small>';
      });
    }
  });

  function styleFn(f) {
    var m = METRICS[current];
    return { fillColor: colourFor(f.properties[current], m.breaks), fillOpacity: 0.75, stroke: false };
  }

  // Control: on/off, metric dropdown, legend
  var Ctl = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function () {
      var d = L.DomUtil.create('div', 'leaflet-control fishing-control');
      d.innerHTML =
        '<label class="fc-head"><input type="checkbox" id="fc-toggle"> Fishing activity (2025)</label>' +
        '<div id="fc-body">' +
        '<select id="fc-metric">' +
        Object.keys(METRICS).map(function (k) { return '<option value="' + k + '">' + METRICS[k].label + '</option>'; }).join('') +
        '</select><div id="fc-legend"></div>' +
        '<div class="fc-src">ICES/OSPAR VMS data, mobile bottom-contacting gear, 0.05&deg; c-squares within 6 nm</div>' +
        '</div>';
      L.DomEvent.disableClickPropagation(d);
      L.DomEvent.disableScrollPropagation(d);
      return d;
    }
  });
  new Ctl().addTo(map);

  var css = document.createElement('style');
  css.textContent =
    '.fishing-control{background:#fff;padding:8px 10px;border-radius:5px;box-shadow:0 1px 5px rgba(0,0,0,.4);font:12px/1.4 sans-serif;max-width:230px}' +
    '.fishing-control .fc-head{font-weight:bold;cursor:pointer;display:block}' +
    '.fishing-control select{width:100%;margin:6px 0;font-size:12px}' +
    '.fishing-control .fc-row{display:flex;align-items:center;gap:6px}' +
    '.fishing-control .fc-sw{width:16px;height:12px;border:1px solid #999;flex:none}' +
    '.fishing-control .fc-src{color:#666;font-size:10px;margin-top:6px}' +
    '.fishing-control #fc-body{display:none}';
  document.head.appendChild(css);

  function drawLegend() {
    var m = METRICS[current], b = m.breaks, f = m.fmt;
    var html = '<div style="margin-bottom:3px">' + m.title + '</div>';
    for (var i = 0; i <= b.length; i++) {
      var txt = i === 0 ? '&lt; ' + f(b[0]) :
                i === b.length ? '&gt; ' + f(b[i - 1]) :
                f(b[i - 1]) + ' &ndash; ' + f(b[i]);
      html += '<div class="fc-row"><span class="fc-sw" style="background:' + COLOURS[i] + '"></span>' + txt + m.unit + '</div>';
    }
    document.getElementById('fc-legend').innerHTML = html;
  }

  var toggle = document.getElementById('fc-toggle');
  var body = document.getElementById('fc-body');
  toggle.addEventListener('change', function () {
    if (toggle.checked) { layer.addTo(map); body.style.display = 'block'; }
    else { map.removeLayer(layer); body.style.display = 'none'; }
  });
  document.getElementById('fc-metric').addEventListener('change', function (e) {
    current = e.target.value;
    layer.setStyle(styleFn);
    drawLegend();
  });
  drawLegend();
})();
