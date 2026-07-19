/**
 * `od:snapshot` listener: rasterizes the current document via an SVG
 * <foreignObject> and replies over `postMessage` with a PNG data URL. Shared
 * (not duplicated) between the web app's srcDoc pipeline
 * (apps/web/src/runtime/srcdoc.ts) and the daemon's powered-preview HTML
 * transform (apps/daemon/src/routes/project/index.ts) — postMessage works
 * cross-origin, so a URL-loaded powered preview can answer capture requests
 * without ever being remounted into a srcDoc iframe (which would drop its
 * live backend fetches).
 */
const SNAPSHOT_BRIDGE_MARKER = 'data-od-snapshot-bridge';

const SNAPSHOT_BRIDGE_SCRIPT = `<script data-od-snapshot-bridge>(function(){
  if (window.__odSnapshotBridgeInstalled) return;
  window.__odSnapshotBridgeInstalled = true;
  var SNAPSHOT_STYLE_PROPS = [
    'display','position','box-sizing','width','height','min-width','max-width','min-height','max-height',
    'margin','margin-top','margin-right','margin-bottom','margin-left',
    'padding','padding-top','padding-right','padding-bottom','padding-left',
    'border','border-top','border-right','border-bottom','border-left','border-radius',
    'font','font-family','font-size','font-weight','font-style','line-height','letter-spacing',
    'color','background-color','opacity','transform','transform-origin','overflow','overflow-x','overflow-y',
    'white-space','text-align','vertical-align','object-fit','object-position',
    'flex','flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis',
    'grid','grid-template-columns','grid-template-rows','grid-column','grid-row',
    'gap','row-gap','column-gap','align-items','align-content','align-self',
    'justify-items','justify-content','justify-self','inset','top','right','bottom','left',
    'z-index','box-shadow','text-shadow'
  ];
  function copyComputedStyle(source, target){
    if (!source || !target || source.nodeType !== 1 || target.nodeType !== 1) return;
    var computed = window.getComputedStyle(source);
    var style = target.getAttribute('style') || '';
    for (var i = 0; i < SNAPSHOT_STYLE_PROPS.length; i++){
      var prop = SNAPSHOT_STYLE_PROPS[i];
      var value = computed.getPropertyValue(prop);
      if (value) style += prop + ':' + value + ';';
    }
    // SVG loaded through <img> may not fetch network resources, so any
    // remaining http(s) url() (background-image etc.) can stall or blank the
    // whole foreignObject paint. Neutralize them; the element keeps its
    // computed box + background-color.
    style = style.replace(/url\\((['"]?)https?:[^)]*\\)/gi, 'none');
    target.setAttribute('style', style);
  }
  var BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  function inlineImageSource(source){
    var src = source.currentSrc || source.src || '';
    if (src.indexOf('data:') === 0) return src;
    try {
      var c = document.createElement('canvas');
      c.width = Math.max(1, source.naturalWidth || 1);
      c.height = Math.max(1, source.naturalHeight || 1);
      var cx = c.getContext('2d');
      if (!cx) return BLANK_IMG;
      cx.drawImage(source, 0, 0);
      return c.toDataURL('image/png');
    } catch (_) {
      // Cross-origin image without CORS taints the canvas — keep the box,
      // drop the pixels, so one hotlinked image can't sink the capture.
      return BLANK_IMG;
    }
  }
  function syncElementState(source, target){
    var tag = source.tagName ? source.tagName.toLowerCase() : '';
    if (tag === 'img') target.setAttribute('src', inlineImageSource(source));
    if (tag === 'input' || tag === 'textarea') target.setAttribute('value', source.value || '');
    if (tag === 'canvas') {
      try {
        var img = document.createElement('img');
        img.setAttribute('src', source.toDataURL('image/png'));
        img.setAttribute('style', target.getAttribute('style') || '');
        target.parentNode && target.parentNode.replaceChild(img, target);
      } catch (_) {}
    }
  }
  function inlineSnapshotStyles(originalRoot, cloneRoot){
    copyComputedStyle(originalRoot, cloneRoot);
    syncElementState(originalRoot, cloneRoot);
    var originals = originalRoot.querySelectorAll('*');
    var clones = cloneRoot.querySelectorAll('*');
    var count = Math.min(originals.length, clones.length, 3500);
    for (var i = 0; i < count; i++){
      copyComputedStyle(originals[i], clones[i]);
      syncElementState(originals[i], clones[i]);
    }
    var scripts = cloneRoot.querySelectorAll('script');
    for (var s = scripts.length - 1; s >= 0; s--) scripts[s].remove();
    var links = cloneRoot.querySelectorAll('link[rel~="stylesheet"], link[rel~="preload"], link[rel~="preconnect"]');
    for (var l = links.length - 1; l >= 0; l--) links[l].remove();
    var styles = cloneRoot.querySelectorAll('style');
    for (var st = 0; st < styles.length; st++) {
      styles[st].textContent = (styles[st].textContent || '')
        .replace(/@import[^;]+;/gi, '')
        .replace(/@font-face\\s*\\{[^}]*\\}/gi, '');
    }
  }
  function pruneHiddenSnapshotNodes(originalRoot, cloneRoot){
    var originals = originalRoot.querySelectorAll('*');
    var clones = cloneRoot.querySelectorAll('*');
    var count = Math.min(originals.length, clones.length);
    var removals = [];
    for (var i = 0; i < count; i++){
      var original = originals[i];
      var clone = clones[i];
      if (!original || !clone || !clone.parentNode) continue;
      var computed = window.getComputedStyle(original);
      if (computed && (computed.display === 'none' || computed.visibility === 'hidden')) {
        removals.push(clone);
      }
    }
    for (var r = removals.length - 1; r >= 0; r--){
      if (removals[r].parentNode) removals[r].parentNode.removeChild(removals[r]);
    }
  }
  function waitForImages(){
    var imgs = Array.prototype.slice.call(document.images || []);
    return Promise.all(imgs.map(function(img){
      if (img.complete) return Promise.resolve();
      return new Promise(function(resolve){
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  }
  function scrollOffset(){
    var doc = document.documentElement;
    var body = document.body;
    return {
      x: Math.max(window.scrollX || 0, doc ? doc.scrollLeft || 0 : 0, body ? body.scrollLeft || 0 : 0),
      y: Math.max(window.scrollY || 0, doc ? doc.scrollTop || 0 : 0, body ? body.scrollTop || 0 : 0)
    };
  }
  function escapeAttribute(value){
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function snapshotBackgroundColor(){
    try {
      var probe = window.getComputedStyle(document.body || document.documentElement);
      var bg = probe && probe.backgroundColor || '';
      if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return '#ffffff';
      return bg;
    } catch (_) { return '#ffffff'; }
  }
  // After painting, sample the canvas: a uniform (single-color) bitmap means
  // the foreignObject rasterizer painted nothing — Chromium frequently refuses
  // to paint <foreignObject> HTML loaded via <img>. Treating that as an honest
  // 'empty-render' error (instead of shipping the background-only frame) lets
  // the host fall back / surface a real failure rather than a silent black PNG.
  function canvasLooksBlank(ctx, cw, ch){
    try {
      var data = ctx.getImageData(0, 0, cw, ch).data;
      var step = Math.max(4, Math.floor((cw * ch) / 4096)) * 4;
      var first = null, samples = 0;
      for (var i = 0; i + 3 < data.length; i += step){
        samples++;
        if (!first){ first = [data[i], data[i+1], data[i+2], data[i+3]]; continue; }
        if (Math.abs(data[i]-first[0]) > 6 || Math.abs(data[i+1]-first[1]) > 6 ||
            Math.abs(data[i+2]-first[2]) > 6 || Math.abs(data[i+3]-first[3]) > 6) return false;
      }
      return samples > 8;
    } catch (_) { return false; }
  }
  // Rasterize the current view (or the whole document, when opts.full) via an
  // SVG <foreignObject>. Returns a Promise so it can be reused by both the
  // od:snapshot message handler AND the export-capture bridge (image export /
  // PDF) — the foreignObject path is fast and never blocks on external
  // image network loads the way a DOM-cloning rasterizer does.
  function captureSnapshot(opts){
    opts = opts || {};
    return new Promise(function(resolve, reject){
      var w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
      var h = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
      var dpr = window.devicePixelRatio || 1;
      var bgColor = snapshotBackgroundColor();
      var docW = Math.max(w, document.documentElement.scrollWidth || 0, document.body ? document.body.scrollWidth : 0);
      var docH = Math.max(h, document.documentElement.scrollHeight || 0, document.body ? document.body.scrollHeight : 0);
      var full = !!opts.full;
      var capW = full ? docW : w;
      var capH = full ? docH : h;
      var clone = document.documentElement.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      inlineSnapshotStyles(document.documentElement, clone);
      pruneHiddenSnapshotNodes(document.documentElement, clone);
      var scroll = full ? { x: 0, y: 0 } : scrollOffset();
      var cloneBody = clone.querySelector('body');
      var rootStyle = clone.getAttribute('style') || '';
      var bodyStyle = cloneBody ? cloneBody.getAttribute('style') || '' : '';
      var bodyContent = cloneBody ? cloneBody.innerHTML : clone.innerHTML;
      var wrapperStyle = rootStyle + bodyStyle +
        'margin:0;position:relative;left:' + (-scroll.x) + 'px;top:' + (-scroll.y) + 'px;' +
        'width:' + docW + 'px;height:' + docH + 'px;overflow:visible;';
      var html = '<div xmlns="http://www.w3.org/1999/xhtml" style="' + escapeAttribute(wrapperStyle) + '">' + bodyContent + '</div>';
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + capW + '" height="' + capH + '" viewBox="0 0 ' + capW + ' ' + capH + '">' +
        '<foreignObject x="0" y="0" width="' + docW + '" height="' + docH + '">' +
        html +
        '</foreignObject></svg>';
      var img = new Image();
      img.onload = function(){
        try {
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.floor(capW * dpr));
          canvas.height = Math.max(1, Math.floor(capH * dpr));
          var ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('no 2d context');
          ctx.scale(dpr, dpr);
          // Opaque base so a transparent (un-painted) raster never flattens to
          // pure black in clipboards / PNG viewers.
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, capW, capH);
          ctx.drawImage(img, 0, 0, capW, capH);
          if (canvasLooksBlank(ctx, canvas.width, canvas.height)) {
            reject(new Error('empty-render'));
            return;
          }
          resolve({ dataUrl: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height });
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err && err.message || err)));
        }
      };
      img.onerror = function(){ reject(new Error('snapshot image failed')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  // Exposed so the export-capture bridge (same document) can reuse this renderer.
  window.__odCaptureSnapshot = function(opts){
    return waitForImages().then(function(){ return captureSnapshot(opts || {}); });
  };
  window.addEventListener('message', function(ev){
    var data = ev && ev.data;
    if (!data || data.type !== 'od:snapshot' || !data.id) return;
    window.__odCaptureSnapshot({ full: !!data.full }).then(function(res){
      window.parent.postMessage({ type: 'od:snapshot:result', id: String(data.id), dataUrl: res.dataUrl, w: res.w, h: res.h }, '*');
    }, function(err){
      window.parent.postMessage({ type: 'od:snapshot:result', id: String(data.id), error: String(err && err.message || err) }, '*');
    });
  });
})();</script>`;

function injectBeforeBodyEnd(html: string, injection: string): string {
  const match = /<\/body\s*>/i.exec(html);
  if (!match) return html + injection;
  return html.slice(0, match.index) + injection + html.slice(match.index);
}

/** Idempotently inject the `od:snapshot` bridge into an HTML document. */
export function injectSnapshotBridge(html: string): string {
  if (html.includes(SNAPSHOT_BRIDGE_MARKER)) return html;
  return injectBeforeBodyEnd(html, SNAPSHOT_BRIDGE_SCRIPT);
}
