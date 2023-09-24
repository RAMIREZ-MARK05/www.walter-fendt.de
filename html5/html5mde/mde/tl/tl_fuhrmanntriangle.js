// Dreiecks-Labor: Fuhrmann-Dreieck und Fuhrmann-Kreis
// 17.11.2019 - 27.08.2022

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel tl_fuhrmanntriangle_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var color0 = "#ff0000";                                    // Farbe f�r bewegliche Punkte (Ziehen mit der Maus)
var color1 = "#0000ff";                                    // Farbe f�r Hilfslinien
var color2 = "#ff00ff";                                    // Farbe f�r Ergebnis (Hervorhebung)

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2;                                              // Schaltkn�pfe (Neustart, N�chster Schritt)
var ta;                                                    // Textbereich

var A, B, C;                                               // Ecken
var nr;                                                    // Nummer der ausgew�hlten Ecke (1, 2, 3 oder 0)
var a, b, c;                                               // Seitenl�ngen (Pixel)
var alpha, beta, gamma;                                    // Winkelgr��en (Bogenma�)
var step;                                                  // Einzelschritt (0 bis 12)
var U;                                                     // Umkreismittelpunkt
var SP1, SP2, SP3;                                         // S�dpole
var FM1, FM2, FM3;                                         // Ecken des Fuhrmann-Dreiecks
var FM;                                                    // Mittelpunkt des Fuhrmann-Kreises
var H;                                                     // H�henschnittpunkt
var F1, F2, F3;                                            // Fu�punkte der H�hen
var A1, A2, A3;                                            // Ankreismittelpunkte
var T1, T2, T3;                                            // Ber�hrpunkte der Ankreise 
var N;                                                     // Nagel-Punkt

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
  bu1 = getElement("bu1",text01);                          // Schaltknopf (Neustart)
  bu2 = getElement("bu2",text02);                          // Schaltknopf (N�chster Schritt) 
  bu2.disabled = false;                                    // Schaltknopf zun�chst aktiviert
  ta = getElement("ta");                                   // Textbereich
  setText(0);                                              // Text festlegen
  ta.readOnly = true;                                      // Text unver�nderlich
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
  begin(100,300,300,300,180,50);                           // Anfangszustand
  paint();                                                 // Zeichnen
  
  bu1.onclick = reactionReset;                             // Reaktion auf Schaltknopf (Reset)
  bu2.onclick = reactionNext;                              // Reaktion auf Schaltknopf (N�chster Schritt)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  
  } // Ende der Methode start
  
// Textbereich aktualisieren:
// nr ... Index im Array text03 (Erl�uterungen)
  
function setText (nr) {
  var t = text03[nr];                                      // Array der Zeilen der passenden Erl�uterung 
  var s = "";                                              // Neue Zeichenkette (leer)
  for (var i=0; i<t.length; i++) s += t[i]+"\n";           // Zeilen und Zeilenumbr�che hinzuf�gen
  ta.value = s;                                            // Text in den Textbereich �bernehmen
  }
  
// Daten aktualisieren:
// Seiteneffekt a, b, c, alpha, beta, gamma, ..., H, F1, F2, F3
  
function update () {
  a = distancePP(B,C);                                     // Seitenl�nge a (Pixel)
  b = distancePP(C,A);                                     // Seitenl�nge b (Pixel)
  c = distancePP(A,B);                                     // Seitenl�nge c (Pixel)
  alpha = Math.acos((b*b+c*c-a*a)/(2*b*c));                // Winkelgr��e alpha (Bogenma�)
  beta = Math.acos((c*c+a*a-b*b)/(2*c*a));                 // Winkelgr��e beta (Bogenma�)
  gamma = Math.acos((a*a+b*b-c*c)/(2*a*b));                // Winkelgr��e gamma (Bogenma�)
  var sin1 = Math.sin(2*alpha);                            // Sinus von 2 alpha
  var sin2 = Math.sin(2*beta);                             // Sinus von 2 beta
  var sin3 = Math.sin(2*gamma);                            // Sinus von 2 gamma
  U = pointBarycentric(sin1,sin2,sin3);                    // Umkreismittelpunkt 
  SP1 = pointBarycentric(-a*a/(b+c),b,c);                  // S�dpol 1
  SP2 = pointBarycentric(a,-b*b/(c+a),c);                  // S�dpol 2
  SP3 = pointBarycentric(a,b,-c*c/(a+b));                  // S�dpol 3
  FM1 = pointBarycentric(a*a,c*c+b*c-a*a,b*b+b*c-a*a);     // 1. Ecke Fuhrmann-Dreieck
  FM2 = pointBarycentric(c*c+a*c-b*b,b*b,a*a+a*c-b*b);     // 2. Ecke Fuhrmann-Dreieck
  FM3 = pointBarycentric(b*b+a*b-c*c,a*a+a*b-c*c,c*c);     // 3. Ecke Fuhrmann-Dreieck
  var h1 = a*a*Math.cos(alpha)-a*(b+c)*Math.cos(beta-gamma);  // Hilfsgr��e
  var h2 = b*b*Math.cos(beta)-b*(c+a)*Math.cos(gamma-alpha);  // Hilfsgr��e
  var h3 = c*c*Math.cos(gamma)-c*(a+b)*Math.cos(alpha-beta);  // Hilfsgr��e
  FM = pointBarycentric(h1,h2,h3);                         // Mittelpunkt Fuhrmann-Kreis
  var tan1 = Math.tan(alpha);                              // Tangens von alpha
  var tan2 = Math.tan(beta);                               // Tangens von beta
  var tan3 = Math.tan(gamma);                              // Tangens von gamma
  H = pointBarycentric(tan1,tan2,tan3);                    // H�henschnittpunkt
  F1 = pointBarycentric(0,tan2,tan3);                      // Fu�punkt der H�he h_a
  F2 = pointBarycentric(tan1,0,tan3);                      // Fu�punkt der H�he h_b
  F3 = pointBarycentric(tan1,tan2,0);                      // Fu�punkt der H�he h_c
  A1 = pointBarycentric(-a,b,c);                           // 1. Ankreismittelpunkt
  A2 = pointBarycentric(a,-b,c);                           // 2. Ankreismittelpunkt
  A3 = pointBarycentric(a,b,-c);                           // 3. Ankreismittelpunkt
  var tan1H = Math.tan(alpha/2);                           // Tangens von alpha/2
  var tan2H = Math.tan(beta/2);                            // Tangens von beta/2
  var tan3H = Math.tan(gamma/2);                           // Tangens von gamma/2
  T1 = pointBarycentric(0,1/tan2H,1/tan3H);                // Ber�hrpunkt Ankreis 1 - Seite a
  T2 = pointBarycentric(1/tan1H,0,1/tan3H);                // Ber�hrpunkt Ankreis 2 - Seite b
  T3 = pointBarycentric(1/tan1H,1/tan2H,0);                // Ber�hrpunkt Ankreis 3 - Seite c
  N = pointBarycentric(b+c-a,c+a-b,a+b-c);                 // Nagel-Punkt
  }
  
// Anfangszustand:
// (ax,ay) ... Koordinaten der Ecke A
// (bx,by) ... Koordinaten der Ecke B
// (cx,cy) ... Koordinaten der Ecke C
// Seiteneffekt step, A, B, C, nr, a, b, c, alpha, beta, gamma

function begin (ax, ay, bx, by, cx, cy) {
  step = 0;                                                // Einzelschritt
  A = {x: ax, y: ay};                                      // Ecke A
  B = {x: bx, y: by};                                      // Ecke B
  C = {x: cx, y: cy};                                      // Ecke C
  nr = 0;                                                  // Zun�chst keine Ecke ausgew�hlt
  update();                                                // Seitenl�ngen und Winkelgr��en aktualisieren
  }
  
// Reaktion auf Schaltknopf (Neustart):
// Seiteneffekt step

function reactionReset () {
  step = 0;                                                // Einzelschritt
  bu2.disabled = false;                                    // Schaltknopf "N�chster Schritt" aktivieren
  setText(0);                                              // Text f�r Start
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Schaltknopf (N�chster Schritt):
// Seiteneffekt step

function reactionNext () {
  step++;                                                  // N�chster Einzelschritt
  if (step >= 12) bu2.disabled = true;                     // Falls n�tig, Schaltknopf "N�chster Schritt" deaktivieren
  setText(step);                                           // Text f�r den n�chsten Einzelschritt
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Dr�cken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Ber�hrung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (nr > 0) e.preventDefault();                          // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  nr = 0;                                                  // Keine Ecke ausgew�hlt, Zugmodus deaktiviert
  }
  
// Reaktion auf Ende der Ber�hrung:
  
function reactionTouchEnd (e) {             
  nr =0;                                                   // Keine Ecke ausgew�hlt, Zugmodus deaktiviert
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (nr == 0) return;                                     // Abbrechen, falls Zugmodus deaktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (nr == 0) return;                                     // Abbrechen, falls Zugmodus deaktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  } 
  
// Quadrat des Abstands von einem gegebenen Punkt:
// (u,v) ... Gegebene Position (Pixel)
// p ....... Gegebener Punkt
  
function distance2 (u, v, p) {
  var dx = u-p.x, dy = v-p.y;                              // Koordinatendifferenzen
  return dx*dx+dy*dy;                                      // R�ckgabewert
  } 
  
// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt nr

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)  
  var d2Min = distance2(u,v,A);                            // Vorl�ufig minimaler Abstand zur Ecke A
  var n = 1;                                               // Nummer von Ecke A
  var d2New = distance2(u,v,B);                            // Abstand zur Ecke B
  if (d2New < d2Min) {n = 2; d2Min = d2New;}               // Gegebenenfalls minimalen Abstand und Nummer aktualisieren
  d2New = distance2(u,v,C);                                // Abstand zur Ecke C
  if (d2New < d2Min) {n = 3; d2Min = d2New;}               // Gegebenenfalls minimalen Abstand und Nummer aktualisieren
  nr = (d2Min < 400 ? n : 0);                              // Bei zu gro�em Abstand keine Ecke ausgew�hlt
  }
  
// Reaktion auf Bewegung von Maus oder Finger (�nderung):
// u, v ... Bildschirmkoordinaten bez�glich Viewport

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  var v1x = (nr==2?u:B.x)-(nr==1?u:A.x);                   // x-Koordinate des ver�nderten Vektors AB
  var v1y = (nr==2?v:B.y)-(nr==1?v:A.y);                   // y-Koordinate des ver�nderten Vektors AB
  var v2x = (nr==3?u:C.x)-(nr==1?u:A.x);                   // x-Koordinate des ver�nderten Vektors AB
  var v2y = (nr==3?v:C.y)-(nr==1?v:A.y);                   // y-Koordinate des ver�nderten Vektors AB
  var corr = (v1x*v2y-v1y*v2x < 0);                        // Flag f�r Gegenuhrzeigersinn     
  if (corr && nr == 1) {A.x = u; A.y = v;}                 // Falls A gezogen, Koordinaten von A aktualisieren
  if (corr && nr == 2) {B.x = u; B.y = v;}                 // Falls B gezogen, Koordinaten von B aktualisieren
  if (corr && nr == 3) {C.x = u; C.y = v;}                 // Falls C gezogen, Koordinaten von C aktualisieren
  update();                                                // Seitenl�ngen und Winkelgr��en aktualisieren
  paint();                                                 // Neu zeichnen
  }
  
//-------------------------------------------------------------------------------------------------

// Abstand zweier Punkte:
// p1, p2 ... Gegebene Punkte

function distancePP (p1, p2) {
  var dx = p2.x-p1.x, dy = p2.y-p1.y;                      // Koordinatendifferenzen
  return Math.sqrt(dx*dx+dy*dy);                           // R�ckgabewert
  }
  
// Punkt, gegeben durch baryzentrische Koordinaten:
// (u,v,w) ... Baryzentrische Koordinaten

function pointBarycentric (u, v, w) {
  var px = (u*A.x+v*B.x+w*C.x)/(u+v+w);
  var py = (u*A.y+v*B.y+w*C.y)/(u+v+w);
  return {x: px, y: py};
  }
  
//-------------------------------------------------------------------------------------------------
  
// Neuer Grafikpfad (Standardwerte):
// c ... Linienfarbe (optional, Defaultwert schwarz)

function newPath (c) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = (c?c:"#000000");                       // Linienfarbe
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
     
// Punkt zeichnen:
// p ... Gegebener Punkt
// c ... Farbe
// n ... Name (optional)

function drawPoint (p, c, n) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(p.x,p.y,2.5,0,2*Math.PI,true);                   // Kreis vorbereiten
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.fill();                                              // Kreis ausf�llen
  ctx.stroke();                                            // Kreisrand zeichnen
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  if (n) ctx.fillText(n,p.x+5,p.y+4);                      // Beschriftung, falls gew�nscht
  }  
  
// Ecke des gegebenen Dreiecks hervorheben:
// p ... Gegebener Punkt
// n ... Name (optional)

function drawVertex (p, n) {
  drawPoint(p,color0,n);                                   // Punkt zeichnen (ausgef�llter Kreis)
  }
    
// Verbindungsgerade zweier Punkte zeichnen:
// p1, p2 ... Gegebene Punkte
// c ........ Farbe (optional, Defaultwert schwarz)
  
function drawLinePP (p1, p2, c) {
  var dx = p2.x-p1.x, dy = p2.y-p1.y;                      // Koordinatendifferenzen
  var d = Math.sqrt(dx*dx+dy*dy);                          // Abstand der gegebenen Punkte
  if (d == 0) return;                                      // Abbrechen, falls Gerade nicht definiert
  dx *= 1000/d; dy *= 1000/d;                              // Verbindungsvektor ausreichender L�nge 
  newPath(c?c:"#000000");                                  // Neuer Grafikpfad
  ctx.moveTo(p1.x-dx,p1.y-dy);                             // Anfangspunkt
  ctx.lineTo(p2.x+dx,p2.y+dy);                             // Weiter zum Endpunkt
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Verbindungsstrecke zweier Punkte zeichnen:
// p1, p2 ... Gegebene Punkte
// c ........ Farbe (optional, Defaultwert schwarz)
  
function drawSegmentPP (p1, p2, c) {
  newPath(c?c:"#000000");                                  // Neuer Grafikpfad
  ctx.moveTo(p1.x,p1.y);                                   // Anfangspunkt
  ctx.lineTo(p2.x,p2.y);                                   // Weiter zum Endpunkt
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Kreis:
// m ... Mittelpunkt
// p ... Punkt auf dem Kreis
// c ... Farbe (optional, Defaultwert schwarz)

function drawCircleMP (m, p, c) {
  newPath(c);                                              // Neuer Grafikpfad
  var r = distancePP(m,p);                                 // Radius
  ctx.arc(m.x,m.y,r,0,2*Math.PI,true);                     // Kreis vorbereiten
  ctx.stroke();                                            // Kreis zeichnen
  }
  
// Ausgef�lltes Dreieck:
// p1, p2, p3 ... Ecken
// c ............ F�llfarbe
  
function triangle (p1, p2, p3, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(p1.x,p1.y);                                   // Anfangspunkt (1. Ecke)
  ctx.lineTo(p2.x,p2.y);                                   // Weiter zur 2. Ecke
  ctx.lineTo(p3.x,p3.y);                                   // Weiter zur 3. Ecke
  ctx.closePath();                                         // Zur�ck zur 1. Ecke
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.fill();                                              // Dreieck ausf�llen
  }
  
// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  ctx.font = FONT;                                         // Zeichensatz
  triangle(A,B,C,"#ffffff");                               // Ausgef�lltes Dreieck
  drawLinePP(B,C);                                         // Seite a (verl�ngert) 
  drawLinePP(C,A);                                         // Seite b (verl�ngert)
  drawLinePP(A,B);                                         // Seite c (verl�ngert)
  drawCircleMP(U,A,color1);                                // Umkreis
  if (step == 4) drawSegmentPP(SP1,FM1,color1);            // Hilfslinie f�r Achsenspiegelung
  if (step == 5) drawSegmentPP(SP2,FM2,color1);            // Hilfslinie f�r Achsenspiegelung
  if (step == 6) drawSegmentPP(SP3,FM3,color1);            // Hilfslinie f�r Achsenspiegelung
  if (step >= 7) drawSegmentPP(FM2,FM3,color2);            // 1. Seite Fuhrmann-Dreieck
  if (step >= 7) drawSegmentPP(FM3,FM1,color2);            // 2. Seite Fuhrmann-Dreieck
  if (step >= 7) drawSegmentPP(FM1,FM2,color2);            // 3. Seite Fuhrmann-Dreieck
  if (step >= 8) drawCircleMP(FM,FM1,color2);              // Fuhrmann-Kreis
  if (step == 9) drawSegmentPP(A,F1,color1);               // H�he zu a
  if (step == 9) drawSegmentPP(B,F2,color1);               // H�he zu b
  if (step == 9) drawSegmentPP(C,F3,color1);               // H�he zu c
  if (step == 10) drawSegmentPP(A,T1,color1);              // 1. Ecktransversale f�r Nagel-Punkt 
  if (step == 10) drawSegmentPP(B,T2,color1);              // 2. Ecktransversale f�r Nagel-Punkt
  if (step == 10) drawSegmentPP(C,T3,color1);              // 3. Ecktransversale f�r Nagel-Punkt
  if (step == 10) drawCircleMP(A1,T1,color1);              // Ankreis gegen�ber A 
  if (step == 10) drawCircleMP(A2,T2,color1);              // Ankreis gegen�ber B
  if (step == 10) drawCircleMP(A3,T3,color1);              // Ankreis gegen�ber C
  if (step == 12) drawSegmentPP(H,N,color1);               // Verbindungsstrecke H�henschnittpunkt - Nagel-Punkt 
  drawVertex(A,vertex1);                                   // Ecke A 
  drawVertex(B,vertex2);                                   // Ecke B
  drawVertex(C,vertex3);                                   // Ecke C
  if (step <= 8) drawPoint(U,color1);                      // Umkreismittelpunkt
  if (step >= 1 && step <= 6) drawPoint(SP1,color1);       // S�dpol zu Seite a
  if (step >= 2 && step <= 6) drawPoint(SP2,color1);       // S�dpol zu Seite b
  if (step >= 3 && step <= 6) drawPoint(SP3,color1);       // S�dpol zu Seite c
  if (step >= 4) drawPoint(FM1,color2);                    // 1. Ecke Fuhrmann-Dreieck
  if (step >= 5) drawPoint(FM2,color2);                    // 2. Ecke Fuhrmann-Dreieck
  if (step >= 6) drawPoint(FM3,color2);                    // 3. Ecke Fuhrmann-Dreieck
  if (step >= 8) drawPoint(FM,color2,fuhrmannpoint);       // Mittelpunkt Fuhrmann-Kreis
  if (step == 9 || step >= 11) drawPoint(H,color1,orthocenter); // H�henschnittpunkt
  if (step >= 10) drawPoint(N,color1,nagelpoint);          // Nagel-Punkt
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

