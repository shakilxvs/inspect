😣 MTHD 1: Install that code 1 in theme.liquid (or similar) to show the message. Before </body>.

✅ MTHD 2:  Make a code file inside the Asset folder & name it "inspect.js" & enter code 2 in the folder.
Then go to theme.liquid (or similar) & past the code 3 before </body>

---------------------------
---------------------------
---------------------------
Code 1:
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<script src="https://shakilxvs.github.io/inspect/script.js?v=999" defer crossorigin></script>

or

<script>
(async function(){
  const url = 'https://shakilxvs.github.io/inspect/script.js?v=9999';
  try {
    const res = await fetch(url, { cache: 'no-cache', credentials: 'omit' });
    if (!res.ok) throw new Error('fetch failed');
    let code = await res.text();
    code = code.replace(/\/\/# sourceMappingURL=.*$/m, '');
    const wrapped = '(function(){' + code + '\n})();';
    const blob = new Blob([wrapped], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const s = document.createElement('script');
    s.type = 'application/javascript';
    s.defer = true;
    s.crossOrigin = 'anonymous';
    s.src = blobUrl;
    s.setAttribute('data-injected-by', 'blob-loader');
    (document.head || document.documentElement).appendChild(s);
    s.addEventListener('load', function(){ try{ URL.revokeObjectURL(blobUrl); } catch(e){} }, { once: true });
  } catch (e) {
    try {
      const fallback = document.createElement('script');
      fallback.defer = true;
      fallback.crossOrigin = 'anonymous';
      fallback.src = url;
      fallback.setAttribute('data-injected-by', 'direct-fallback');
      (document.head || document.documentElement).appendChild(fallback);
    } catch (err) {}
  }
})();
</script>
-----------------------------------
code 2: 1️⃣
const s = document.createElement('script');
s.src = "https://shakilxvs.github.io/inspect/script.js?v=999";
s.defer = true;
s.crossOrigin = "anonymous";
document.head.appendChild(s);
-----------------------------------
Code 3: 3️⃣
{{ 'inspect.js' | asset_url | script_tag }}
-----------------------------------
Do this: 4️⃣
Add URL to config.js, Remove the Warning
Remove URL from config.js to show the Warning
