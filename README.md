😣 MTHD 1: Install that code 1 in theme.liquid (or similar) to show the message. Before </body>.

✅ MTHD 2:  Make a code file inside the Asset folder & name it "inspect.js" & enter code 2 in the folder.
Then go to theme.liquid (or similar) & past the code 3 before </body>

---------------------------
---------------------------
---------------------------
Code 1:
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<script src="https://shakilxvs.github.io/inspect/script.js?v=999" defer crossorigin></script>
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
