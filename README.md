# Telepítés

A szkript a legtöbb modern böngészőre telepíthető.<br>

1. Telepítsd a **Violentmonkey** kiegészítőt az alábbi oldalak egyikéről:
    * [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
    * [Google Chrome](https://chromewebstore.google.com/detail/jinjaccalgkegednnccohejagnlnfdag?hl=hu&utm_source=ext_sidebar)
    * [Új Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao)
1. Most már telepítheted a szkriptet. Ehhez [kattints ide](https://github.com/MentalGravis/CMMSLayoutChange/releases/latest/download/CMMSLayoutChange.user.js).
1. A megjelenő oldalon kattints az **Install** gombra.
1. Lépj be a CMMSbe, és használd egészséggel.

# Funkciók

* Az oldalon megjelenített listaelemek számának menüjét balra igazítja
<picture>
<img alt="Listaelem menü" src="img/OldalMéret.png">
</picture><br>

* A munkalapon lévő rubrikák magasságát dinamikusan állítja a szöveg mennyiség alapján
    * Csak nagyjából működik, mert a betűtípus nem mono (bár gondolkodom az átállításon...)
    * Az entereket veszi figyelembe, illetve a folyamatos szöveget 130-al osztja, majd ezek összege alapján állítja át a szövegdobozt.
<picture>
<img alt="Szövegdoboz magassága" src="img/SzövegDobozMagassága.png">
</picture><br>

* Képletöltés funkció
    * Csak a munkalaphoz csatolt mellékletekkel működik, és csak akkor, ha a mezőválasztóban a "Fénykép" oszlop a 3. helyen szerepel (a pipa és a file ikonos oszlop után)
        * Igény esetén átalakítom dinamikusra, hogy ne legyen ez megkötés
    * A gomb csak akkor jelenik meg, amikor ez a Mellékletek fül aktív
    * A képeket jpg formátumban menti, a file nevek {Qszám_sorszám.jpg} formátumúak
    * Az összes képet egymás után lementi (nekem ez a funkció kellett, ha szükséges átalakítom úgy, hogy csak a kijelölt elemeket mentse)
<picture>
<img alt="Képletöltés gomb" src="img/KépLetöltésGomb.png">
</picture><br>
