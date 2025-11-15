let table;          // conterrà di nuovo il CSV dei vulcani
let volcanoRow;     // la riga specifica del vulcano selezionato 

let volcanoName = "";   // nome del vulcano da usare nel titolo, è una stringa
let infoBoxes = [];     // array con i box informativi (posizione + testi)
let glyphPoint = null;  // oggetto che rappresenta la forma del vulcano

// per la scala dell'elevazione
let minElev = Infinity;     // minimo trovato nel dataset
let maxElev = -Infinity;    // massimo trovato nel dataset

//per fare il pulsante per tornare alla pagina generale 
let backBtnX, backBtnY, backBtnW, backBtnH;

//funzione per caricare il dataset, sempre la solita 
function preload() {
  table = loadTable("vulcani.csv", "csv", "header");
}


function setup() {
  createCanvas(windowWidth, windowHeight);   // canvas a schermo intero
  textFont('Courier New');                   // stesso font della pagina generale
  fill(248, 250, 252);                       // colore testo quasi bianco

  //trovo il minimo e il massimo dell'elevazione 
  //mi serve poi per usare map e deteriminare la dimensione della mia forma
  for (let i = 0; i < table.getRowCount(); i++) { //ciclo for che scorre tutte le mie righe del dataset 
    let row = table.getRow(i); //prendi la riga i
    let elevRaw = row.get("Elevation (m)"); //prendi il contenuto della colonna Elevation per la riga i
    let elev = parseFloat(elevRaw); //converto il testo in numero (anche negatvio) 

    if (!isNaN(elev)) {   // se non è un numero 
      if (elev < minElev) minElev = elev; //se è minore del minimo diventa il minimo 
      if (elev > maxElev) maxElev = elev; //se è maggior del massimo diventa il massimo
    }
  }

  //LEGGO IL PARAMETRO IDX dall'URL
  const params = new URLSearchParams(window.location.search);  
  const idxString = params.get('idx');  // prendo il valore di "idx" come stringa

  //GESTIONE ERRORI SE IDX MANCA 
  // se idx NON è presente nell'URL: messaggio di errore
  if (idxString === null) { //serve per prevenire gli errori 
    background(44, 44, 44); // sfondo grigio scuro
    textAlign(CENTER, TOP);
    textSize(20);
    text("Nessun vulcano selezionato.", width / 2, 40);
    //scritta che mi appare in caso di URL assente 
    return;
  }

  // converto la stringa idxString in numero intero
  const idx = int(idxString);

  // controllo che idx sia dentro ai limiti del numero di righe del CSV
  if (idx < 0 || idx >= table.getRowCount()) {
    //se idx è minore di 0 o maggiore del numero di righe
    //allora dovrà ricomparire il mio messaggio di errore 
    background(44, 44, 44); 
    textAlign(CENTER, TOP);
    textSize(20);
    text("Indice vulcano non valido.", width / 2, 40);
    return;
  }

 //RIGA DEL VULCANO SELEZIONATO 
  volcanoRow = table.getRow(idx); 
  //chiedo al sistema di darmi la riga associata al mio codice idx

  //estraggo i i valori delle colonne che mi servono
  //get: prendo il  valore di quella colonna di quella specifica riga
  let name      = volcanoRow.get("Volcano Name");
  let country   = volcanoRow.get("Country");
  let location  = volcanoRow.get("Location");
  let lat       = volcanoRow.get("Latitude");
  let lon       = volcanoRow.get("Longitude");
  let type      = volcanoRow.get("TypeCategory");
  let status    = volcanoRow.get("Status");
  let lastErupt = volcanoRow.get("Last Known Eruption");
  let elevRaw   = volcanoRow.get("Elevation (m)");  
  let elevValue = parseFloat(elevRaw); //trasformo l'elevazione in numero 

  //SICUREZZA PER NON AVERE ERRORI 
  // pulizia base dei valori, per renderli omogenei 
  //trim leva gli spazi 
  volcanoName = name ? name.trim() : "Unknown volcano";
  country     = country   ? country.trim()   : "Unknown country";
  location    = location  ? location.trim()  : "Unknown location";
  lat         = lat       ? lat.trim()       : "n/a";
  lon         = lon       ? lon.trim()       : "n/a";
  type        = type      ? type.trim()      : "Unknown type";
  status      = status    ? status.trim()    : "Unknown status";
  lastErupt   = lastErupt ? lastErupt.trim() : "Unknown";
  elevValue   = !isNaN(elevValue) ? elevValue : 0;  // se non è un numero, metto 0

  //BOX CON LE INFO 
  //PREPARO le variabili 
  let boxW = 260;     // larghezza box
  let boxH = 70;      // altezza box
  let gapY = 15;      // spazio verticale tra i box

  // coordinate delle due colonne
  // x 
  let col1X = 660;
  let col2X = 960;

  // y di partenza per la prima riga di box
  let startY = 190;

  // riempio l'array infoBoxes con tutti i box
  //ognuno ha una posizione (x: e y:), una larghezza/altezza (w: e h:), un testo "label" che è la mia scirtta e value è il valore 
  infoBoxes = [
    { x: col1X, y: startY + 0 * (boxH + gapY), w: boxW, h: boxH, label: "Country",   value: country },
    { x: col2X, y: startY + 0 * (boxH + gapY), w: boxW, h: boxH, label: "Location",  value: location },
    { x: col1X, y: startY + 1 * (boxH + gapY), w: boxW, h: boxH, label: "Latitude",  value: lat },
    { x: col2X, y: startY + 1 * (boxH + gapY), w: boxW, h: boxH, label: "Longitude", value: lon },
    { x: col1X, y: startY + 2 * (boxH + gapY), w: boxW, h: boxH, label: "Type",      value: type },
    { x: col2X, y: startY + 2 * (boxH + gapY), w: boxW, h: boxH, label: "Status",    value: status },
  ];

  //DIMENSIONE GLIFO IN BASE ALL'ELEVAZIONE 
  let absElev = abs(elevValue);  // prendo il valore assoluto (positivi e negativi trattati allo stesso modo)
  let maxAbsElev = max(abs(minElev), abs(maxElev)); // prendo il massimo assoluto del dataset

  let minSize = 20;// dimensione minima del glifo
  let maxSize = 350;// dimensione massima del glifo

  // map: l'elevazione assoluta tra minSize e maxSize
  let glyphSize = map(absElev, 0, maxAbsElev, minSize, maxSize);
  //con map scalo tutti i valori intermedi automaticamente 

  // preparo il punto/glifo da disegnare
  glyphPoint = {
    x: 280, // posizione X fissa a sinistra
    y: height / 2, // centrato verticalmente
    typeCategory: type.toLowerCase(),   // tipo di vulcano 
    last: lastErupt, // codice di ultima eruzione 
    size: glyphSize // dimensione calcolata
  };

  // posizione e dimensioni del pulsante "Torna alla pagina generale"
backBtnW = 290;
backBtnH = 30;
backBtnX = 930;   // centrato
backBtnY = 600;
}


//FUNZIONE COLORE in base all'ultima eruzione 
//copia e incolla dalla pagina generale 
function colorLastEruption(code) {
  switch (code) {

    case "D1": return color(255, 180, 0);    // giallo scuro
    case "D2": return color(255, 140, 0);    // arancione caldo
    case "D3": return color(255, 90, 0);     // arancio-rosso
    case "D4": return color(230, 40, 0);     // rosso vivo
    case "D5": return color(190, 30, 20);    // rosso profondo
    case "D6": return color(130, 25, 20);    // rosso-mattone
    case "D7": return color(90, 25, 20);     // marrone-rosso scuro
    case "D":  return color(60, 20, 15);     // marrone bruciato

    case "P":  return color(149, 95, 32);    // marrone
    case "Q":  return color(121, 85, 91);    // siena

    case "U":  return color(80, 80, 80);     // grigio
    case "U1": return color(30, 30, 30);     // nero medio
    case "U7": return color(5, 5, 5);        // nero

    case "?":       return color(255, 250, 180);  // giallo chiarissimo
    case "Unknown": return color(230, 230, 230);  // grigio chiarissimo

    default:
      return color(240, 240, 240);           // fallback neutro
  }
}


//FORMA DEL VULCANO 
//stessa anche qui della pagine generale, le copio per usarle 
function drawShapeForTypeSized(p, s) {
  let t = (p.typeCategory || "").trim().toLowerCase();
  //trim serve sempre per renderli tutti omogenei 
  //s è la scala 

  switch (t) {

    case "stratovolcano":
      rectMode(CENTER);
      rect(p.x, p.y, s * 0.8, s * 1.6);
      break;

    case "shield volcano":
      rectMode(CENTER);
      square(p.x, p.y, s * 1.2);
      break;

    case "caldera":
      circle(p.x, p.y, s * 1.4);
      break;

    case "cone":
      beginShape();
      vertex(p.x,         p.y - s * 1.0);
      vertex(p.x - s*0.8, p.y + s * 0.4);
      vertex(p.x + s*0.8, p.y + s * 0.4);
      endShape(CLOSE);
      break;

    case "crater system":
      beginShape();
      vertex(p.x,          p.y - s * 0.8);
      vertex(p.x + s*0.7,  p.y - s * 0.4);
      vertex(p.x + s*0.7,  p.y + s * 0.4);
      vertex(p.x,          p.y + s * 0.8);
      vertex(p.x - s*0.7,  p.y + s * 0.4);
      vertex(p.x - s*0.7,  p.y - s * 0.4);
      endShape(CLOSE);
      break;

    case "maars / tuff ring":
      ellipse(p.x, p.y, s * 1.8, s * 0.9);
      break;

    case "submarine volcano":
      beginShape();
      vertex(p.x,         p.y - s * 0.8);
      vertex(p.x + s*0.8, p.y);
      vertex(p.x,         p.y + s * 0.8);
      vertex(p.x - s*0.8, p.y);
      endShape(CLOSE);
      break;

    case "subglacial":
      rectMode(CENTER);
      rect(p.x, p.y, s * 1.8, s * 0.6);
      break;

    case "other / unknown":
      const col = colorLastEruption(p.last);
      stroke(col);
      strokeWeight(max(2, s * 0.25));
      strokeCap(ROUND);
      line(p.x - s*0.8, p.y - s*0.8, p.x + s*0.8, p.y + s*0.8);
      line(p.x + s*0.8, p.y - s*0.8, p.x - s*0.8, p.y + s*0.8);
      noStroke();
      break;

    default:
      circle(p.x, p.y, s * 1.2);
      break;
  }
}

//DISEGNO LA BOX CON L'INFORMAZIONE 
//creo un'altra funzione che disegna la box 
//questa box l'ho già citata prima quando ho fatto l'array!!!
function drawInfoBox(box, isHover) {
  push(); 

  let baseW = box.w; // larghezza base del box
  let baseH = box.h; // altezza base del box

  let w = baseW;
  let h = baseH;
  let bx = box.x;
  let by = box.y;

  // FUNZIONE HOVER 
  if (isHover) {
    w = baseW * 1.06;
    h = baseH * 1.10;
    // lo sposto un po' per tenerlo centrato
    bx = box.x - (w - baseW) / 2;
    by = box.y - (h - baseH) / 2;
  }

  // sfondo del box
  rectMode(CORNER);
  if (isHover) {
    fill(90, 25, 20);   // rosso 
    stroke(255);  // bianco 
    strokeWeight(1.2);
  } else {
    fill(20);            // grigio molto scuro
    noStroke();
  }
  rect(bx, by, w, h, 8); // disegno il rettangolo

  noStroke(); //disattivo lo stroke per i testi 

  // testi nel box
  let paddingX = 12;
  let paddingY = 10;

  // etichetta in alto, ovvero il nome del box e della colonna del mio dataset 
  fill(180);
  textAlign(LEFT, TOP);
  textSize(12);
  text(box.label.toUpperCase(), bx + paddingX, by + paddingY);

  // valore sotto 
  fill(255);
  textSize(16);
  let textX = bx + paddingX;
  let textY = by + paddingY + 18;
  let textW = w - paddingX * 2;
  let textH = h - paddingY * 2 - 18;
  text(box.value, textX, textY, textW, textH);

  pop(); 
}


function draw() {
  background(44, 44, 44);   // sfondo generale

  // TITOLO (NOME VULCANO)
  textAlign(LEFT, TOP);
  textSize(40);
  let titleX = 660;   // x fissa 
  let titleY = 120;   // y fissa
  text(volcanoName, titleX, titleY);

  //FORMA A SINISTRA 
  if (glyphPoint) {
    push();
    let c = colorLastEruption(glyphPoint.last);  // colore in base allo stato eruttivo
    fill(c); //riempo in base a c
    stroke(255); //controno bianco 
    strokeWeight(1.2); //spessore 
    drawShapeForTypeSized(glyphPoint, glyphPoint.size);  // disegno il glifo grande
    pop();
  }

  // BOX CON LE INFO
  for (let i = 0; i < infoBoxes.length; i++) {
    let box = infoBoxes[i];

    // controllo se il mouse è sopra il box
    //controllo se il mouse è dentro al rettangolo definito da (x, y, x+w, y+h).
    let isHover =
      mouseX >= box.x &&
      mouseX <= box.x + box.w &&
      mouseY >= box.y &&
      mouseY <= box.y + box.h;

    // disegno il box con o senza effetto hover
    drawInfoBox(box, isHover);
  }

  // TESTO SPEIGAZIONI 
  textSize(12);
  textAlign(LEFT, TOP);
  

  text("La dimensione della forma rappresenta", 130, 580);
  text("il valore assoluto dell'elevazione del vulcano (m)", 130, 600);

  //pulsante per tornare alla visione d'insieme 
let hoverBack =
  mouseX >= backBtnX &&
  mouseX <= backBtnX + backBtnW &&
  mouseY >= backBtnY &&
  mouseY <= backBtnY + backBtnH;

// sfondo pulsante
if (hoverBack) {
  fill(121, 85, 91);  // rosino 
  stroke(255); // bianco
  strokeWeight(1.2);
} else {
  fill(20);           // grigio scuro
  noStroke();
}

rect(backBtnX, backBtnY, backBtnW, backBtnH, 8);

// testo del pulsante
noStroke();
fill(255);
textAlign(CENTER, CENTER);
textSize(16);
text("Torna alla visione d'insieme", backBtnX + backBtnW/2, backBtnY + backBtnH/2);



}


function mousePressed() {
  let hoverBack =
    mouseX >= backBtnX &&
    mouseX <= backBtnX + backBtnW &&
    mouseY >= backBtnY &&
    mouseY <= backBtnY + backBtnH;

  if (hoverBack) {
    window.location.href = "index.html"; 
  }
}