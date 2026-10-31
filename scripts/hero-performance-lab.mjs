import http from "node:http";
const base = Number(process.argv[2] || 3101);
const upstreamPort = Number(process.argv[3] || 3001);
const probe = `<script>(()=>{const m={videoPlaying:null,firstFrame:null,posterReady:null,lcp:null,cls:0,events:[]};const publish=()=>{let o=document.getElementById('hero-performance');if(!o){o=document.createElement('script');o.type='application/json';o.id='hero-performance';document.body?.append(o)}o.textContent=JSON.stringify({...m,now:performance.now(),paint:performance.getEntriesByType('paint').map(e=>e.toJSON()),resources:performance.getEntriesByType('resource').map(e=>e.toJSON()),navigation:performance.getEntriesByType('navigation')[0]?.toJSON()})};try{new PerformanceObserver(l=>{for(const e of l.getEntries())m.lcp={time:e.startTime,url:e.url,size:e.size};publish()}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){m.cls+=e.value;(m.shifts??=[]).push({value:e.value,sources:e.sources.map(s=>({node:s.node?.outerHTML?.slice(0,180),before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))})}}).observe({type:'layout-shift',buffered:true})}catch{}document.addEventListener('playing',e=>{if(e.target.tagName==='VIDEO'&&m.videoPlaying===null){m.videoPlaying=performance.now();m.events.push(['playing',m.videoPlaying]);e.target.requestVideoFrameCallback?.(()=>{m.firstFrame=performance.now();publish()});publish()}},true);document.addEventListener('load',e=>{if(e.target.matches?.('.campaign-poster img')){m.posterReady=performance.now();publish()}},true);document.addEventListener('DOMContentLoaded',()=>{let i=document.querySelector('.campaign-poster img');if(i?.complete&&i.naturalWidth&&!m.posterReady)m.posterReady=performance.now();publish();setInterval(publish,500)})})();</script>`;
for (const [offset, rate, latency] of [
  [0, 9_000_000 / 8, 60],
  [1, 1_600_000 / 8, 150],
]) {
  const queues = new Map();
  let credit = 0,
    turn = 0;
  setInterval(() => {
    credit = Math.min(credit + rate * 0.02, rate * 0.04);
    const entries = [...queues];
    if (entries.length) turn = (turn + 1) % entries.length;
    for (let i = 0; i < entries.length; i++) {
      const [res, q] = entries[(i + turn) % entries.length];
      if (res.destroyed) {
        queues.delete(res);
        continue;
      }
      if (q.buffers.length && credit >= 1) {
        const b = q.buffers[0],
          n = Math.min(b.length, Math.floor(credit), 16384);
        res.write(b.subarray(0, n));
        credit -= n;
        if (n === b.length) q.buffers.shift();
        else q.buffers[0] = b.subarray(n);
      }
      if (q.ended && !q.buffers.length) {
        res.end();
        queues.delete(res);
      }
    }
  }, 20);
  http
    .createServer((req, res) => {
      if (process.argv[4] === "fail-video" && req.url.includes(".mp4")) {
        res.writeHead(503, {
          "content-type": "video/mp4",
          "cache-control": "no-store",
        });
        res.end();
        return;
      }
      const url = new URL(req.url, "http://localhost");
      const upstream = http.request(
        {
          host: "127.0.0.1",
          port: upstreamPort,
          path: req.url,
          headers: {
            ...req.headers,
            host: "127.0.0.1:" + upstreamPort,
            "accept-encoding": "identity",
          },
        },
        (r) => {
          const headers = { ...r.headers };
          delete headers["content-length"];
          delete headers["transfer-encoding"];
          const html = (headers["content-type"] || "").includes("text/html");
          let q = { buffers: [], ended: false };
          const pending = [];
          setTimeout(() => {
            if (res.destroyed) return;
            res.writeHead(r.statusCode, headers);
            queues.set(res, q);
          }, latency);
          r.on("data", (b) => {
            if (html) pending.push(b);
            else q.buffers.push(b);
          });
          r.on("end", () => {
            if (html) {
              let body = Buffer.concat(pending).toString();
              const preload = url.searchParams.get("__preload");
              if (preload)
                body = body.replace(
                  /preload="(?:none|metadata|auto)"/,
                  'preload="' + preload + '"',
                );
              if (url.searchParams.has("__nohydrate"))
                body = body.replace(
                  /<script[^>]*src="[^"]*"[^>]*><\/script>/g,
                  "",
                );
              const prefs = url.searchParams.get("__preference");
              let setup = "";
              if (prefs === "reduced")
                setup =
                  '<script>const originalMatchMedia=window.matchMedia.bind(window);window.matchMedia=q=>q.includes("prefers-reduced-motion")?{matches:true,addEventListener(){},removeEventListener(){}}:originalMatchMedia(q);</script>';
              if (prefs === "save-data")
                setup =
                  '<script>Object.defineProperty(navigator,"connection",{value:{saveData:true,addEventListener(){},removeEventListener(){}}});</script>';
              body = body.replace("<head>", "<head>" + setup + probe);
              q.buffers.push(Buffer.from(body));
            }
            q.ended = true;
          });
        },
      );
      upstream.on("error", () => {
        res.writeHead(502);
        res.end();
      });
      req.pipe(upstream);
    })
    .listen(base + offset, "127.0.0.1", () =>
      console.log(
        JSON.stringify({
          port: base + offset,
          mbps: (rate * 8) / 1e6,
          latencyMs: latency,
          cpu: "unthrottled",
          aggregateBandwidth: true,
        }),
      ),
    );
}
