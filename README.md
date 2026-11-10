# Evoluce – co-op roguelike, kde se nepřátelé učí tvůj styl

**Sólo:** otevři `index.html` (potřebuje internet kvůli three.js).
**Multiplayer / lobby (až 4):** `npm install && npm start`, všichni otevřou `http://localhost:3000`. V menu je seznam lobby s vyhledáváním, pole pro heslo a tlačítka **JOIN** (připojit k vybrané lobby), **CREATE** (vytvořit; název vezme z vyhledávacího pole, heslo z pole hesla, prázdné = bez hesla) a **LEAVE** (opustit). Hesla se na serveru ukládají jen jako hash (scrypt), zadávání je omezené proti zkoušení. **Hru počítá server** (každé lobby má vlastní izolovanou instanci herní logiky, stejný kód jako v prohlížeči); klienti posílají jen vstupy a vykreslují snímky ~20×/s. Hostitel lobby má pravomoci (start, vyhazování, hlášení), ale nic nepočítá, takže jeho odchod ani výpadek nezpůsobí chybu simulace. Solo hra běží lokálně v prohlížeči. **Trvalé:** zákazy a hlášení patří hostiteli (podle anonymního ID) a přežijí zánik lobby i restart serveru (složka `data/`), AI (neuronová síť, síň slávy) se učí ze všech her na serveru. Hráčské profily (jméno, barva, postava, zbraň) se zobrazují v lobby i ve hře nad hráči. **Chat:** v lobby má vlastní okno, ve hře se otevře klávesou Enter (Enter odešle, Esc zavře); zprávy zprostředkovává server, posledních 50 dostane každý nově příchozí. **Vyhazování:** hostitel má v lobby u každého hráče tlačítko „Vyhodit“, nebo napíše `/kick jméno`; **Hlasování o vyhození:** od 3 hráčů může kterýkoli ne-hostitel navrhnout vyhození (tlačítko „Hlasovat o vyhození“ nebo `/votekick jméno`); hlasuje se tlačítky, `/yes` `/no` nebo klávesami Y / N, vyhodí se při většině všech hráčů kromě obviněného (30 s, po neúspěchu 60 s pauza pro stejného hráče, hostitele nelze vyhodit hlasováním). **Ztlumení:** „Ztlumit“ u hráče nebo `/mute jméno` skryje jeho chat jen tobě a **trvale** (i v dalších lobby; server každému hráči přidělí anonymní stálé ID odvozené od ID prohlížeče, takže ztlumení nevyžaduje jméno; seznam ztlumených najdeš v menu a můžeš ho tam zrušit). **Hlášení:** tlačítko „Nahlásit“ nebo `/report jméno důvod` pošle hostiteli soukromé hlášení s posledními zprávami hráče; hostitel je vidí v lobby s tlačítky Vyhodit / Ztlumit. Vyhozený se do téže lobby už nepřipojí (ban podle anonymního ID prohlížeče, platí do zániku lobby).

**AI tvůrce příšer:** každá vlna jedna až dvě zcela nové příšery (geny: tělo, pohyb, útok, schopnost, velikost, rychlost, životy, poškození, barva). Evoluční algoritmus druhy hodnotí (způsobené poškození, přežití, jak dobře kontrují styl hráčů), slabé nechá vyhynout a nové druhy křižuje, mutuje a vymýšlí. Hlavním tvůrcem je **vlastní neuronová síť** (`js/ai/nn.js`, 7→16→101): na vstupu má tvůj styl hry a číslo vlny, na výstupu rozdělení pravděpodobností genů příšery (včetně pravidel mozku) a parametrů strategie. Učí se posilovaným učením (REINFORCE) ze skutečných výsledků – kolik poškození příšery způsobily a jak dlouho přežily – a váhy se ukládají mezi běhy. Evoluční algoritmus zůstává jako doplněk (25 % nových druhů) kvůli rozmanitosti.

**Samohra:** v menu je tlačítko „Trénovat AI samohrou“ – síť se bez vykreslování učí na simulovaných hráčích (kempař, kiter, bojovník…), takže se hra začne přizpůsobovat dřív, než ji vůbec zahraješ. V menu je i graf vývoje odměny návrháře.

**LLM je oddělený volitelný plugin** (`js/plugins/llm.js` + `server/llm.js`, jen s `ANTHROPIC_API_KEY`, Node 18+). Smaž je a hra běží beze změny.

**Mozky a strategie (AI „přepisuje kód“):** každá příšera má mozek – krátký seznam pravidel „když [situace] → [akce]“ (např. *hráč na mě míří → uhni*). Evoluční AI pravidla přidává, maže, prohazuje a kříží mezi druhy. Navíc vymýšlí týmové strategie (Kleště, Příliv, Návnada…) a každou vlnu nasadí dvě. Pravidla běží v malém, omezeném interpretu – AI (ani LLM) nikdy nespouští vlastní JavaScript, takže je to bezpečné i v multiplayeru; všechno od LLM se ověřuje seznamem povolených hodnot. Na konci běhu hra vypíše, co se AI „naučila naprogramovat“.

**Nastavení (Esc nebo tlačítko v menu):** předvolby grafiky (Nízká/Střední/Vysoká) i jednotlivé volby – záře, stíny, filmový efekt, odrazy prostředí, stopy na podlaze, rozlišení, hustota částic, zorné pole, jas, FPS. Všechny klávesy jdou přemapovat (včetně dashe, přepínání zbraní a volitelné klávesy střelby), jde změnit tlačítko střelby myší a vrátit výchozí hodnoty. V sólo hře se při otevřeném nastavení hra pozastaví. Vše se ukládá v prohlížeči. Nastavení jde uložit do až 6 pojmenovaných **profilů** (nový profil je kopie aktuálního, jde přejmenovat, smazat a přepínat) a **exportovat / importovat** do souboru JSON (jeden profil nebo všechny) nebo **sdílet krátkým kódem** (`EVO1-…`): „Vytvořit kód z profilu“ → „Kopírovat“, kamarád kód vloží a dá „Načíst kód“. Kód má kontrolní součet, takže překlep se pozná. Import se vždy ověří a ořeže na povolené hodnoty, takže cizí soubor nemůže nastavení rozbít.

**Zvuk a efekty:** každá zbraň má vlastní syntetizovaný zvuk i efekt (záblesky a světlo z hlavně, nábojnice, paprsek railgunu, plameny, kouř, výbuchy, spáleniny a stopy po zabitých příšerách na podlaze), prostorové panorama podle polohy a adaptivní hudba, která s napětím zrychluje a zesiluje. Zvuk jde vypnout v menu.

**Grafika:** fyzikálně založené materiály s odlesky prostředí, normálová a drsnostní mapa podlahy, měkké stíny, bloom a závěrečné filmové zpracování (vinětace, zrno, chromatická vada). Úroveň „Vysoká“ zapíná vše; shader se při chybě sám vypne.

**Paměť AI:** nejlepší druhy, strategie a poslední styl hráče se po každém běhu ukládají v prohlížeči (host je ukládá u sebe). Další běh začíná s potomky nejúspěšnějších druhů a AI už tvůj styl zhruba zná. V menu jde paměť vymazat.

**Bossové a esence:** každá 5. vlna přivede bosse – nejúspěšnější druh vyvinutý AI v obří verzi. Po každém běhu dostaneš Esenci (podle vlny, skóre a bossů) a v menu za ni kupuješ trvalá vylepšení (životy, poškození, rychlost, extra karta při výběru, bonus esence). Ukládá se v prohlížeči.

Ovládání (výchozí; vše jde přemapovat): WASD pohyb, myš míření, držení tlačítka střelba, mezerník = dash (úhyb s krátkou nezranitelností), 1–4 = přepnutí zbraně.

**Postavy a zbraně:** každá z 10 postav má pevnou zbraň (Střelec – Blaster, Tank – Brokovnice, Stíhač – Kulomet, Průzkumník – Railgun, Granátník – Raketomet, Žhář – Plamenomet a chladné: Rytíř – Meč, Berserker – Kladivo, Lovec – Kopí, Zabiják – Dýky). Chladné zbraně zasahují v oblouku / kruhu / řadě, odhazují nepřátele, Meč a Kladivo odráží nepřátelské střely, Dýky léčí. **AI se na ně adaptuje:** pozná, že hraješ zblízka, a posílá ostnaté nepřátele (zraní tě při úderu), střelce mimo dosah a taktiku „útok a ústup“; evoluční AI i neuronová síť vymýšlejí druhy s genem „ostny“. Dříve: **Výběr zbraní:** v menu zvlášť vybereš postavu (životy, rychlost) a zbraň: Blaster, Brokovnice, Kulomet, Railgun, Plamenomet, Raketomet (výbuch zasáhne okolí). Při výběru vylepšení se může objevit karta „Nová zbraň“ – můžeš nosit až 4 zbraně a přepínat je klávesami 1–4.

**Režisér obtížnosti:** po každé vlně hra změří, kolik životů hráči ztratili, a upraví počet příšer i sílu nových druhů, aby hra zůstala napínavá, ale vyhratelná (cíl ≈ 35 % ztracených životů za vlnu). V menu jde nastavit i „Síla AI“. Aktuální napětí vidíš v HUD.

```
evoluce/
├─ index.html · server.js · package.json
├─ css/        base · hud · overlay
└─ js/
   ├─ main.js
   ├─ core/      utils · state · options · audio · input · game · loop
   ├─ net/       net            (klient WebSocketu)
   ├─ world/     scene · fx · view   (bloom, stíny, efekty, 3D pohled)
   ├─ ai/        brain · genome · strategy · nn · evolution · behavior · memory   (tvůrce příšer)
   ├─ plugins/   llm   (volitelné)
   ├─ entities/  player · enemies · projectiles
   ├─ systems/   profile · waves · hazards · update
   └─ ui/        hud
```
