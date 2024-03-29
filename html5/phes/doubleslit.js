// Interferenz von Licht am Doppelspalt
// Java-Applet (07.10.2003) umgewandelt
// 24.11.2015 - 17.08.2023

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind in einer eigenen Datei (zum Beispiel doubleslit_de.js) abgespeichert.

// Farben:

var colorBackground1 = "#404040";                          // Hintergrundfarbe Versuchsaufbau
var colorBackground2 = "#ffff00";                          // Hintergrundfarbe Versuchsergebnis
var colorDoubleSlit = "#808080";                           // Farbe f�r Doppelspalt

// Sonstige Konstanten:

var DEG = Math.PI/180;                                     // 1 Grad (Bogenma�)
var MAX = 90;                                              // Maximaler Winkel (Gradma�)
var RAD = 200;                                             // Radius Beobachtungsschirm
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ip1, ip2, ip3;                                         // Eingabefelder
var sl1, sl2, sl3;                                         // Schieberegler
var ch1, ch2;                                              // Auswahlfelder
var op;                                                    // Ausgabefeld
var rb1, rb2;                                              // Radiobuttons

var uM, vM;                                                // Ursprung (Pixel)
var lambda;                                                // Wellenl�nge (m)
var d;                                                     // Spaltabstand (m)
var alpha;                                                 // Winkel (Bogenma�)
var minAlpha;                                              // Winkel f�r verdeckten Teil des Beobachtungsschirms (Bogenma�)
var theta, phi;                                            // Azimut- und H�henwinkel (Bogenma�)
var a1, a2, b1, b2, b3;                                    // Koeffizienten f�r Projektion
var poly1, poly2, poly3;                                   // Arrays f�r Polygonecken

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // R�ckgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfl�che
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  getElement("ip1a",text01);                               // Erkl�render Text (Wellenl�nge)
  ip1 = getElement("ip1b");                                // Eingabefeld (Wellenl�nge)
  getElement("ip1c",nanometer);                            // Einheit (Wellenl�nge)
  sl1 = getElement("sl1");                                 // Schieberegler (Wellenl�nge)
  getElement("ip2a",text02);                               // Erkl�render Text (Spaltabstand)
  ip2 = getElement("ip2b");                                // Eingabefeld (Spaltabstand)
  getElement("ip2c",nanometer);                            // Einheit (Spaltabstand)
  sl2 = getElement("sl2");                                 // Schieberegler (Spaltabstand)
  getElement("ip3a",text03);                               // Erkl�render Text (Winkel)
  ip3 = getElement("ip3b");                                // Eingabefeld (Winkel)
  getElement("ip3c",degree);                               // Einheit (Winkel)
  sl3 = getElement("sl3");                                 // Schieberegler (Winkel)
  getElement("ch1a",text04);                               // Erkl�render Text (Maxima)
  ch1 = getElement("ch1b");                                // Auswahlfeld (Maxima)  
  getElement("ch2a",text05);                               // Erkl�render Text (Minima)
  ch2 = getElement("ch2b");                                // Auswahlfeld (Minima)
  getElement("op1a",text06);                               // Erkl�render Text (relative Intensit�t)
  op = getElement("op1b");                                 // Ausgabefeld (relative Intensit�t)  
  rb1 = getElement("rb1");                                 // Radiobutton (Interferenzmuster)
  getElement("lb1",text07);                                // Erkl�render Text (Interferenzmuster)
  rb2 = getElement("rb2");                                 // Radiobutton (Intensit�tsverteilung)
  getElement("lb2",text08);                                // Erkl�render Text (Intensit�tsverteilung)
  rb1.checked = true;                                      // Zun�chst Interferenzmuster ausgew�hlt
  getElement("author",author);                             // Autor (und �bersetzer)
  
  uM = 210; vM = 200;                                      // Ursprung (Pixel)
  lambda = 600*1e-9;                                       // Startwert Wellenl�nge (m)
  d = 1000*1e-9;                                           // Startwert Spaltabstand (m)
  alpha = 17.5*DEG;                                        // Startwert Winkel (Bogenma�)
  theta = 200*DEG; phi = 40*DEG;                           // Azimut- und H�henwinkel (Bogenma�)
  calcCoeff();                                             // Koeffizienten f�r Projektion berechnen
  setPolygons();                                           // Arrays f�r Polygonecken vorbereiten      
  updateInput(true,true,true);                             // Eingabefelder aktualisieren
  reaction(true);                                          // Berechnungen, Ausgabe, Zeichnen
  focus(ip1);                                              // Fokus f�r erstes Eingabefeld
  
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Wellenl�nge)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Spaltabstand)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Winkel)
  ip1.onblur = reactionBlur;                               // Reaktion auf Verlust des Fokus (Eingabe Wellenl�nge)
  ip2.onblur = reactionBlur;                               // Reaktion auf Verlust des Fokus (Eingabe Spaltabstand)
  ip3.onblur = reactionBlur;                               // Reaktion auf Verlust des Fokus (Eingabe Winkel)
  sl1.onchange = reactionSlider1;                          // Reaktion auf Schieberegler (Wellenl�nge)
  sl1.onclick = reactionSlider1;                           // Reaktion auf Schieberegler (Wellenl�nge)
  sl2.onchange = reactionSlider2;                          // Reaktion auf Schieberegler (Spaltabstand)
  sl2.onclick = reactionSlider2;                           // Reaktion auf Schieberegler (Spaltabstand)
  sl3.onchange = reactionSlider3;                          // Reaktion auf Schieberegler (Winkel)
  sl3.onclick = reactionSlider3;                           // Reaktion auf Schieberegler (Winkel)
  ch1.onchange = reactionSelect1;                          // Reaktion auf Auswahlfeld (Maximum)
  ch1.onclick = reactionSelect1;                           // Reaktion auf Auswahlfeld (Maximum)
  ch2.onchange = reactionSelect2;                          // Reaktion auf Auswahlfeld (Minimum)
  ch2.onclick = reactionSelect2;                           // Reaktion auf Auswahlfeld (Minimum)
  rb1.onclick = reactionRadio;                             // Reaktion auf Radiobutton (Interferenzmuster)
  rb2.onclick = reactionRadio;                             // Reaktion auf Radiobutton (Intensit�tsverteilung)
  } // Ende start
  
// Neuer Eintrag in Auswahlfeld:
// ch ... Auswahlfeld
// w .... Winkel (Bogenma�)
// k .... Ordnung des Maximums oder Minimums

function addNewOption (ch, w, k) {
  if (isNaN(w)) return;                                    // Falls Winkel nicht definiert, abbrechen
  var s = ToString(w/DEG,1,true)+degreeUnicode;            // Zeichenkette (Winkel im Gradma�)
  s += " ("+symbolOrder+" = "+k+")";                       // Ordnung in Klammer hinzuf�gen
  var o = document.createElement("option");                // Neues option-Element
  o.text = s;                                              // Text �bernehmen
  ch.add(o);                                               // Element zum Auswahlfeld hinzuf�gen
  }
      
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt lambda, d, alpha 
  
function reactionEnter (e) {
  var enter = (e.key == "Enter" || e.code == "Enter");     // Flag f�r Enter-Taste
  if (enter) reaction(true);                               // Falls Enter-Taste, Eingabe, Berechnungen, Ausgabe und neu zeichnen                    
  }
  
// Reaktion auf Verlust des Fokus:

function reactionBlur () {
  reaction(true);                                          //  Eingabe, Berechnungen, Ausgabe, neu zeichnen
  }
  
// Fokus f�r Eingabefeld, Cursor am Ende:
// ip ... Eingabefeld
  
function focus (ip) {
  ip.focus();                                              // Fokus f�r Eingabefeld
  var n = ip.value.length;                                 // L�nge der Zeichenkette
  ip.setSelectionRange(n,n);                               // Cursor setzen
  }
  
// Reaktion auf Schieberegler f�r Wellenl�nge:
// Seiteneffekt lambda, d, alpha

function reactionSlider1 () {
  lambda = 1e-8*(38+Number(sl1.value));                    // Wellenl�nge (m)
  updateInput(true,false,false);                           // Eingabefeld aktualisieren
  reaction(true);                                          // Daten �bernehmen, rechnen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Schieberegler f�r Spaltabstand:
// Seiteneffekt lambda, d, alpha

function reactionSlider2 () {
  d = 1e-7*(5+Number(sl2.value));                          // Spaltabstand (m)
  updateInput(false,true,false);                           // Eingabefeld aktualisieren
  reaction(true);                                          // Daten �bernehmen, rechnen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Schieberegler f�r Winkel:
// Seiteneffekt lambda, d, alpha

function reactionSlider3 () {
  alpha = Number(sl3.value)*DEG;                           // Winkel (Bogenma�)
  updateInput(false,false,true);                           // Eingabefeld aktualisieren
  reaction(true);                                          // Daten �bernehmen, rechnen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Auswahlfeld f�r Maxima:
// Seiteneffekt lambda, d, alpha

function reactionSelect1 () {
  var k = ch1.selectedIndex;                               // Ordnung des Maximums
  alpha = Math.asin(k*lambda/d);                           // Winkel (Bogenma�)
  updateInput(false,false,true);                           // Eingabefeld aktualisieren
  reaction(false);                                         // Daten �bernehmen, rechnen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Auswahlfeld f�r Minima:
// Seiteneffekt lambda, d, alpha

function reactionSelect2 () {
  var k = ch2.selectedIndex;                               // Ordnung des Minimums 
  alpha = Math.asin((k+0.5)*lambda/d);                     // Winkel (Bogenma�)
  updateInput(false,false,true);                           // Eingabefeld aktualisieren
  reaction(false);                                         // Daten �bernehmen, rechnen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Radiobuttons:
// Seiteneffekt lambda, d, alpha

function reactionRadio () {
  reaction(false);                                         // Daten �bernehmen, rechnen, Ausgabe, neu zeichnen
  }

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  if (n == 1000) s = "1000";                               // Ausnahme, um "1,00e+3" zu verhindern
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl oder NaN
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // R�ckgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt lambda, d, alpha, Wirkung auf Eingabefelder und Schieberegler

function input () {
  var ae = document.activeElement;                         // Aktives Element
  lambda = 1e-9*inputNumber(ip1,0,true,380,780);           // Wellenl�nge (nm -> m)
  d = 1e-9*inputNumber(ip2,0,true,500,5000);               // Spaltabstand (nm -> m)
  alpha = DEG*inputNumber(ip3,1,true,0,90);                // Winkel (Gradma� -> Bogenma�)
  updateSliders();                                         // Schieberegler aktualisieren
  if (ae == ip1) focus(ip2);                               // Fokus f�r n�chstes Eingabefeld
  if (ae == ip2) focus(ip3);                               // Fokus f�r n�chstes Eingabefeld
  if (ae == ip3) ip3.blur();                               // Fokus abgeben
  }
  
// Aktualisierung der Eingabefelder:
// i1 ... Flag f�r Aktualisierung der Wellenl�nge
// i2 ... Flag f�r Aktualisierung des Spaltabstands
// i3 ... Flag f�r Aktualisierung des Winkels

function updateInput (i1, i2, i3) {
  if (i1) ip1.value = ToString(1e9*lambda,0,true);         // Wellenl�nge (nm)
  if (i2) ip2.value = ToString(1e9*d,0,true);              // Spaltabstand (nm)
  if (i3) ip3.value = ToString(alpha/DEG,1,true);          // Winkel (Grad)
  }
  
// Aktualisierung der Schieberegler:

function updateSliders () {
  sl1.value = Math.round(1e8*lambda-38);                   // Schieberegler Wellenl�nge
  sl2.value = Math.round(1e7*d-5);                         // Schieberegler Spaltabstand
  sl3.value = Math.round(alpha/DEG);                       // Schieberegler Winkel
  }
  
// Auswahlfelder f�r Maxima und Minima aktualisieren:
    
function updateMaxMin () {
  while (ch1.length > 0) ch1.remove(0);                    // Liste der Maxima leeren
  var maxK = Math.floor(d/lambda);                         // Maximale Ordnung eines Maximums
  for (var k=0; k<=maxK; k++)                              // F�r alle Maxima ...
    addNewOption(ch1,Math.asin(k*lambda/d),k);             // Neuen Eintrag zur Liste hinzuf�gen
  ch1.selectedIndex = 0;                                   // Maximum 0. Ordnung ausw�hlen
  while (ch2.length > 0) ch2.remove(0);                    // Liste der Minima leeren
  maxK = Math.floor(d/lambda+0.5);                         // Maximale Ordnung eines Minimums
  for (k=1; k<=maxK; k++)                                  // F�r alle Minima ... 
    addNewOption(ch2,Math.asin((k-0.5)*lambda/d),k);       // Neuen Eintrag zur Liste hinzuf�gen
  ch2.selectedIndex = 0;                                   // Minimum 1. Ordnung ausw�hlen
  }
  
// Aktualisierung des Ausgabefelds:

function updateOutput () {
  op.innerHTML = ToString(intensity(alpha),3,true);        // Relative Intensit�t
  }
  
// Eingabe, Berechnungen, Ausgabe, neu zeichnen:
// mm ... Flag f�r Aktualisierung der Auswahlfelder f�r Maxima/Minima
// Seiteneffekt lambda, d, alpha  
   
function reaction (mm) {
  input();                                                 // Eingabe
  if (mm) updateMaxMin();                                  // Gegebenenfalls Auswahlfelder f�r Maxima/Minima aktualisieren
  updateOutput();                                          // Ausgabe aktualisieren
  paint();                                                 // Neu zeichnen
  }  
  
//-------------------------------------------------------------------------------------------------

// Koeffizienten f�r Projektion:
// Seiteneffekt a1, a2, b1, b2, b3
  
function calcCoeff () {
  a1 = -Math.sin(theta); a2 = Math.cos(theta);
  b1 = -Math.sin(phi)*a2; b2 = Math.sin(phi)*a1; b3 = Math.cos(phi);
  }
  
// Berechnung der waagrechten Bildschirmkoordinate:
// x, y, z ... R�umliche Koordinaten
  
function screenU (x, y) {
  return uM+a1*x+a2*y;
  }
  
// Berechnung der senkrechten Bildschirmkoordinate:
// x, y, z ... R�umliche Koordinaten
    
function screenV (x, y, z) {
  return vM-b1*x-b2*y-b3*z;
  }
  
// Setzen einer Polygonecke:
// p ......... Array f�r Polygonecken
// i ......... Index der Ecke
// x, y, z ... R�umliche Koordinaten
    
function setPoint (p, i, x, y, z) {
  p[i] = {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Festlegung der Polygone:
// Seiteneffekt poly1, poly2, poly3, minAlpha
  
function setPolygons () {
  poly1 = new Array(4);                                    // Parallelogramm f�r Doppelspalt
  setPoint(poly1,0,0,50,50);                               // Ecke links oben
  setPoint(poly1,1,0,-50,50);                              // Ecke rechts oben
  setPoint(poly1,2,0,-50,-50);                             // Ecke rechts unten
  setPoint(poly1,3,0,50,-50);                              // Ecke links unten
  poly2 = new Array(4*MAX+2);                              // Polygon f�r Beobachtungsschirm
  for (var i=0; i<=2*MAX; i++) {                           // F�r alle Ecken ...
    var w = (i-MAX)*DEG;                                   // Winkel (Bogenma�)
    var cos = RAD*Math.cos(w), sin = RAD*Math.sin(w);      // Trigonometrische Werte
    setPoint(poly2,i,cos,sin,50);                          // Ecke am oberen Rand
    setPoint(poly2,4*MAX+1-i,cos,sin,-50);                 // Entsprechende Ecke am unteren Rand
    }
  minAlpha = Math.atan(a2/a1);                             // Winkel f�r verdeckten Teil (Bogenma�)
  var i0 = Math.round(-minAlpha/DEG);                      // Entsprechender Index 
  poly3 = new Array((MAX-i0+1)*2);                         // Polygon f�r verdeckten Teil des Beobachtungsschirms
  for (i=0; i<=MAX-i0; i++) {                              // F�r alle Ecken ...
    w = (i-MAX)*DEG;                                       // Winkel (Bogenma�)
    cos = RAD*Math.cos(w); sin = RAD*Math.sin(w);          // Trigonometrische Werte
    setPoint(poly3,i,cos,sin,50);                          // Ecke am oberen Rand
    setPoint(poly3,2*(MAX-i0)+1-i,cos,sin,-50);            // Entsprechende Ecke am unteren Rand
    }
  }
  
// Berechnung der (relativen) Intensit�t:
// x ... Winkel (Bogenma�)
// R�ckgabewert zwischen 0 und 1
  
function intensity (x) {
  var c = d*2*Math.PI/lambda;                              // Hilfsgr��e
  return (1+Math.cos(c*Math.sin(x)))/2;                    // R�ckgabewert
  }
  
// Hilfsroutine: Multiplikation mit 256, Umwandlung in zweistellige Hexadezimalzahl (Zeichenkette)
// z ... Gegebene Zahl

function toHex (z) {
  if (z < 0) z = 0;                                        // Negative Zahl korrigieren
  if (z > 1) z = 1;                                        // Zahl �ber 1 korrigieren
  var n = Math.floor(256*z);                               // Multiplikation mit 256
  var hex = n.toString(16);                                // Umwandlung in Hexadezimalzahl (Zeichenkette)
  if (hex.length < 2) hex = "0"+hex;                       // Falls einstellig, f�hrende Null hinzuf�gen
  if (hex.length > 2) hex = "ff";                          // Zu gro�e Hexadezimalzahl verhindern
  return hex;                                              // R�ckgabewert
  }
  
// Berechnung der RGB-Darstellung (Algorithmus von Bruton):
// lambda ... Wellenl�nge (m)
// relInt ... relative Intensit�t (0 bis 1, optional, Defaultwert 1)
// R�ckgabewert: Zeichenkette im Format "#rrggbb"
    
function rgb (lambda, relInt) {
  lambda *= 1e9;                                           // Umrechnung in nm
  if (relInt == undefined) relInt = 1;                     // Gegebenenfalls Defaultwert f�r relInt verwenden
  var r1 = 0, g1 = 0, b1 = 0;                              // Rot-, Gr�n- und Blau-Anteil (jeweils 0 bis 1)
  if (lambda >= 380 && lambda < 440) {
    r1 = (440-lambda)/60; g1 = 0; b1 = 1;
    }
  else if (lambda < 490) {
    r1 = 0; g1 = (lambda-440)/50; b1 = 1;
    }
  else if (lambda < 510) {
    r1 = 0; g1 = 1; b1 = (510-lambda)/20;
    }
  else if (lambda < 580) {
    r1 = (lambda-510)/70; g1 = 1; b1 = 0;
    }
  else if (lambda < 645) {
    r1 = 1; g1 = (645-lambda)/65; b1 = 0;
    }
  else if (lambda <= 780) {
    r1 = 1; g1 = 0; b1 = 0;
    }
  var f = 0;                                               // Faktor f�r Abschw�chung am Rand
  if (lambda >= 380 && lambda < 420) 
    f = 0.3+0.7*(lambda-380)/40;
  else if (lambda < 700)
    f = 1;
  else if (lambda <= 780)
    f = 0.3+0.7*(780-lambda)/80;
  var gamma = 0.8;                                         // Exponent
  var r2 = relInt*Math.pow(f*r1,gamma);                    // Rot-Anteil unter Ber�cksichtigung der Intensit�t
  var g2 = relInt*Math.pow(f*g1,gamma);                    // Gr�n-Anteil unter Ber�cksichtigung der Intensit�t
  var b2 = relInt*Math.pow(f*b1,gamma);                    // Blau-Anteil unter Ber�cksichtigung der Intensit�t
  return "#"+toHex(r2)+toHex(g2)+toHex(b2);                // R�ckgabewert
  }

//-------------------------------------------------------------------------------------------------
  
// Neuer Pfad mit Standardwerten:
// w ... Liniendicke (optional, Defaultwert 1)

function newPath(w) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)
// w ........ Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (w) ctx.lineWidth = w;                                // Liniendicke festlegen, falls angegeben
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // L�nge
  if (length == 0) return;                                 // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // L�nge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt f�r Pfeilspitze         
  var h = 0.5*w+3.5;                                       // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.moveTo(x1,y1);                                       // Anfangspunkt
  if (length < 5) ctx.lineTo(x2,y2);                       // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                                // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                            // Linie zeichnen
  if (length < 5) return;                                  // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                                         // Neuer Pfad f�r Pfeilspitze
  ctx.lineWidth = 1;                                       // Liniendicke zur�cksetzen
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Wei�er Markierungspfeil (20 Pixel lang, nach unten):
// (x,y) ... Anfangspunkt (Pixel)
    
function arrowDown (x, y) {
  ctx.strokeStyle = "#ffffff";                             // Linienfarbe wei�
  arrow(x,y,x,y+20);                                       // Pfeil zeichnen
  }
  
// Ausgef�lltes Rechteck:
// x ... Abstand vom linken Rand (Pixel)
// y ... Abstand vom oberen Rand (Pixel)
// w ... Breite (Pixel)
// h ... H�he (Pixel)
// c ... F�llfarbe
// r ... Flag f�r Rand (optional, Defaultwert false)

function rectangle (x, y, w, h, c, r) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)                            
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausf�llen
  if (r) ctx.strokeRect(x,y,w,h);                          // Falls gew�nscht, Rand zeichnen
  }
    
// Ausgef�llter Kreis mit schwarzem Rand:
// (x,y) ... Mittelpunkt (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe

function circle (x, y, r, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausf�llen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... F�llfarbe
// b ... Flag f�r Rand

function drawPolygon (p, c, b) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // F�r alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Grafikpfad hinzuf�gen
  ctx.closePath();                                         // Zur�ck zum Ausgangspunkt
  ctx.fill();                                              // Polygon ausf�llen
  if (b) ctx.stroke();                                     // Falls gew�nscht, Rand zeichnen   
  }
  
// Linker Teil des Beobachtungsschirms (von vorne gesehen):
  	
function screenLeft () {
  drawPolygon(poly2,"#000000",true);                       // Ausgef�lltes Polygon (schwarz)
  for (var i=-360; i<=360; i++) {                          // F�r alle Indizes ...
    var w = i*DEG/4;                                       // Winkel (-90� bis +90�, Abstand 0,25�, Bogenma�)
  	var x = RAD*Math.cos(w), y = RAD*Math.sin(w);          // R�umliche Koordinaten  
  	var u = screenU(x,y), v = screenV(x,y,0);              // Zugeh�rige Bildschirmkoordinaten (Pixel)
  	var c = rgb(lambda,intensity(w));                      // RGB-Codierung im Format "#rrggbb"
  	line(u,v-1.5,u,v+1.5,c,1.5);                           // Teil des Interferenzmusters
  	}
  x = RAD*Math.cos(alpha); y = RAD*Math.sin(alpha);        // R�umliche Koordinaten f�r Markierungspfeile
  u = screenU(x,y); v = screenV(x,y,35);                   // Zugeh�rige Bildschirmkoordinaten (Pixel)
  arrowDown(u,v);                                          // Linker Markierungspfeil
  if (-alpha > minAlpha) {                                 // Falls rechter Markierungspfeil sichtbar ...
    u = screenU(x,-y); v = screenV(x,-y,35);               // Bildschirmkoordinaten (Pixel)
    arrowDown(u,v);                                        // Rechter Markierungspfeil
    }
  }
  
// Rechter Teil des Beobachtungsschirms (von hinten gesehen):
  	  
function screenRight () {
  drawPolygon(poly3,"#000000",true);                       // Ausgef�lltes Polygon (schwarz)
  var x = RAD*Math.cos(minAlpha);                          // x-Koordinate f�r Grenze des sichtbaren Teils
  var y = RAD*Math.sin(minAlpha);                          // y-Koordinate f�r Grenze des sichtbaren Teils
  var u = screenU(x,y);                                    // Zugeh�rige waagrechte Bildschirmkoordinate (Pixel)
  ctx.fillStyle = colorBackground1;                        // Hintergrundfarbe als F�llfarbe
  ctx.fillRect(u,0,10,300);                                // M�gliche Ungenauigkeiten verdecken
  }
  	  
// Strahlen f�r die Maxima (nach dem Doppelspalt):
  	
function raysMaxima () {
  var maxK = Math.floor(d/lambda);                         // Maximale Ordnung eines Maximums
  for (var k=-maxK; k<=maxK; k++) {                        // F�r alle Maxima (links und rechts) ...
  	var w = Math.asin(k*lambda/d);                         // Winkel (Bogenma�)
  	var x = RAD*Math.cos(w), y = RAD*Math.sin(w);          // R�umliche Koordinaten
  	var u = screenU(x,y), v = screenV(x,y,0);              // Zugeh�rige Bildschirmkoordinaten (Pixel)
  	line(uM,vM,u,v,rgb(lambda),2);                         // Lichtstrahl zeichnen
  	}
  }
  
// Doppelspalt:
  	
function doubleSlit () {
  drawPolygon(poly1,colorDoubleSlit,true);                 // Ausgef�lltes Parallelogramm mit Rand
  var f = 2e-6;                                            // Hilfsgr��e
  var u0 = Math.max(screenU(0,-d/f),uM+1);                 // Waagrechte Bildschirmkoordinate f�r rechten Spalt
  var v0 = screenV(0,-d/f,-20);                            // Senkrechte Bildschirmkoordinate f�r rechten Spalt (unten)
  var v1 = screenV(0,-d/f,20);   	                       // Senkrechte Bildschirmkoordinate f�r rechten Spalt (oben) 
  line(u0,v0,u0,v1);                                       // Rechter Spalt
  u0 = Math.min(screenU(0,d/f),uM-1);                      // Waagrechte Bildschirmkoordinate f�r linken Spalt
  v0 = screenV(0,d/f,-20);                                 // Senkrechte Bildschirmkoordinate f�r linken Spalt (unten)
  v1 = screenV(0,d/f,20);  	                               // Senkrechte Bildschirmkoordinate f�r linken Spalt (oben)
  line(u0,v0,u0,v1); 	                                   // Linker Spalt
  }
  
// Lichtstrahl vor dem Doppelspalt:
  	
function rayBefore () {
  var u = screenU(-200,0), v = screenV(-200,0,0);          // Koordinaten Lichtquelle (Pixel)
  line(uM,vM,u,v,rgb(lambda),4);                           // Lichtstrahl zeichnen
  }
  
// Horizontale Achse (Winkel):
// (u,v) ... Ursprung (Pixel)
// c ....... Farbe
    
function horAxis (u, v, c) {
  ctx.strokeStyle = c;                                     // Farbe �bernehmen
  arrow(u,v,u+190,v,1.5);                                  // Waagrechte Achse rechts (Winkel)
  arrow(u,v,u-190,v,1.5);                                  // Waagrechte Achse links (Winkel)
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  for (var i=-3; i<=3; i++) {                              // F�r alle Ticks im Abstand 30� ...
    var u0 = u+55*i;                                       // Waagrechte Koordinate (Pixel)
    line(u0,v-3,u0,v+3,c);                                 // Tick zeichnen
    var s = ""+Math.abs(i)*30+degreeUnicode;               // Zeichenkette f�r Beschriftung
    ctx.fillText(s,u0,v+18);                               // Tick beschriften
    }
  }
  
// Interferenzmuster:
      
function patternInterference () {
  var uM = width/2, vM = 360;                              // Mittelpunkt Interferenzmuster (Pixel)
  var  w = 330;                                            // Breite (Pixel)
  var  pix = w/Math.PI;                                    // Umrechnungsfaktor
  rectangle(20,vM-40,width-40,100,"#000000");              // Hintergrund (schwarz)    
  for (var u=uM-w/2; u<=uM+w/2; u++) {                     // Von links nach rechts ...
    var x = (uM-u)/pix;                                    // Winkel (Bogenma�)
    var c = rgb(lambda,intensity(x));                      // Farbe
    line(u,vM-1.5,u,vM+1.5,c,1.5);                         // Teil des Interferenzmusters
    }
  var i = alpha*pix;                                       // Aktueller Winkel, umgerechnet in Pixel
  arrowDown(uM-i,vM-30);                                   // Linker Pfeil
  arrowDown(uM+i,vM-30);                                   // Rechter Pfeil
  horAxis(uM,vM+30,"#ffffff");                             // Winkelskala (Grad)
  }
  
// Intensit�tsverteilung:
      
function distributionIntensity () {
  var uM = width/2, vM = 410;                              // Ursprung (Pixel)
  horAxis(uM,vM,"#000000");                                // Winkelskala (Grad)
  arrow(uM,vM+5,uM,vM-100,1.5);                            // Senkrechte Achse (Intensit�t)
  var w = 330;                                             // Breite (Pixel)
  var pixX = w/Math.PI, pixY = 80;                         // Umrechnungsfaktoren
  var u = uM-w/2;                                          // Waagrechte Koordinate Anfangspunkt (Pixel)
  var x = -Math.PI/2;                                      // Zugeh�riger Winkel (-90�)
  var y = intensity(x);                                    // Zugeh�rige Intensit�t
  var v = vM-y*pixY;                                       // Senkrechte Koordinate Anfangspunkt (Pixel)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(u,v);                                         // Anfangspunkt f�r Polygonzug
  while (u < uM+w/2) {                                     // Solange rechter Rand noch nicht erreicht ...
  	u++;                                                   // Waagrechte Koordinate erh�hen
  	x = (u-uM)/pixX;                                       // Winkel (Bogenma�) 
  	y = intensity(x);                                      // Relative Intensit�t
  	v = vM-y*pixY;                                         // Senkrechte Koordinate
  	ctx.lineTo(u,v);                                       // Linie zum Polygonzug hinzuf�gen
  	}
  ctx.stroke();  	                                       // Polygonzug zeichnen    
  var du = pixX*alpha;                                     // Waagrechte Koordinate (relativ zum Ursprung, Pixel)
  var v0 = vM-intensity(alpha)*pixY;                       // Senkrechte Koordinate (Pixel)
  circle(uM+du,v0,2.5,"#ff0000");                          // Markierung f�r aktuellen Winkel (rechts)
  circle(uM-du,v0,2.5,"#ff0000");                          // Markierung f�r aktuellen Winkel (links)
  }
    
// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground1;                        // Hintergrundfarbe Versuchsaufbau
  ctx.fillRect(0,0,width,300);                             // Hintergrund ausf�llen
  screenLeft();                                            // Linker Teil des Beobachtungsschirms
  raysMaxima();                                            // Strahlen f�r die Maxima
  screenRight();                                           // Rechter Teil des Beobachtungsschirms
  doubleSlit();                                            // Doppelspalt
  rayBefore();                                             // Lichtstrahl vor dem Doppelspalt   
  ctx.fillStyle = colorBackground2;                        // Hintergrundfarbe Versuchsergebnis
  ctx.fillRect(0,300,width,height-300);                    // Hintergrund ausf�llen
  ctx.font = FONT;                                         // Zeichensatz
  if (rb1.checked) patternInterference();                  // Interferenzmuster
  else distributionIntensity();                            // Intensit�tsverteilung 
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der HTML-Seite Methode start ausf�hren


