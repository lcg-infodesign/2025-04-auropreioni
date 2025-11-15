let table; //variabile che mi contiene il dataset 
let points = []; //array in cui salvo la posizione x e y di ogni vulcano

let angleStep = 0.88; //mi dice di quanto pian piano si deve aprire la spirale 
let radiusBase = 12; //distanza tra i punti 

//nuova variabile per definire un hover 
let hoveredIndex = -1; 
//metto -1 perchè se con il mouse non sono sopra nulla, mi mette la riga -1
//che non esiste, ma se mettessi 0, mi darebbe la prima 
//CONVENZIONE 

function preload() {
  table = loadTable("vulcani.csv", "csv", "header");
  //carico il dataset 

}

//collegamento con la pagina di dettaglio 
//mousePressed mi permette di fare questa azione ogni volta che clicco 
function mousePressed() {
  // richiamo la funzione hover, ovvero che mi dice se la mia freccetta è sopra a un vulcano 
  if (hoveredIndex !== -1) { //se non è uguale a -1 allora 
    let p = points[hoveredIndex]; // prendo il vulcano su cui sono
    // creo l’URL con un parametro 
    let myUrl = "detail.html?volcanoName=" + encodeURIComponent(p.country);
    // apro la pagina
    window.location.href = myUrl;
  }
}


//SPIRALE 
function spiralLayout() {

  //vedo in console i nomi CORRETTI di come sono salvate le mie colonne
  console.log("Nomicolonne:", table.columns);

  points = [];
  //voglio salvare tutte queste cordinate dentro un array che poi userò per disgenare 
  
  let xC = width/2+100; //centro della spirale = centro del canvas
  let yC = height/2-20; //stessa cosa per la y 

  let rowCount = table.getRowCount(); //numero di rghe del mio dataset
  
  //creo un glifo per ogni riga della tabella, usando un ciclo for 
  for (let i=0; i<rowCount; i++) { 
    
    let row = table.getRow(i); 
    //prende la riga numero i del dataset

    let lastEruption = row.get("Last Known Eruption"); // 
    //salva i codici dell'ultima colonna in una variabile 
    let typeCategoryRaw = row.get("TypeCategory"); 
    //stessa cosa 
    let volcanoNameRaw  = row.get("Volcano Name"); 
    let countryRaw      = row.get("Country");      

    //RIGHE SALVAGENTE (per evitare errori)
    //per prendere tutti i casi 
    let typeCategory = "";
    if (typeCategoryRaw) {
      typeCategory = typeCategoryRaw.trim().toLowerCase();
    }
    let volcanoName = volcanoNameRaw ? volcanoNameRaw.trim() : "Unknown volcano";
    let country     = countryRaw ? countryRaw.trim() : "Unknown country";
    //“Se volcanoNameRaw esiste e ha un valore (vero),
    //allora prendi quel valore e fai .trim() per togliere eventuali spazi.
    //Altrimenti, se non esiste (cioè è undefined o vuoto),
    //metti al suo posto la scritta "Unknown volcano".”

    //potevo usare un if, ma questo me lo rende più compatto 
    //mi evita degli errori 


    //variabili per la SPRIALE 
    let theta = i*angleStep; //angolo rispetto al centro
    //angleStep è la costante per cui ogni volta ruotiamo, i cambia
    let r = radiusBase*Math.sqrt(i); //distanza dal centro
    //radice quadrata di i serve per farla crescere regolare 
    

    //COORDINATE PUNTI 
    //formula matematica 
    let x = xC + r * Math.cos(theta);
    let y = yC + r * Math.sin(theta);

    //uso queste cordinate poi nel draw per disegnare 
    points.push({
      x: x,
      y: y,
      radius: 4, // raggio del disegno
      last: lastEruption, //salvo per dopo 
      //ora ogni p ha anche una proprietà last 
      typeCategory: typeCategory,
      name: volcanoName,
      country: country //aggiungo nuove info legate al punto 
    });

  
  }
}

//FUNZIONE PER DEFINIRE I COLORI 
//la variabile code mi cambia in una di queste possibili variabili 
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

    
    case "P":  return color(149,95,32);     // marrone
    case "Q":  return color(121,85,91);     // siena

  
    case "U":  return color(80, 80, 80);     // grigio
    case "U1": return color(30, 30, 30);     // nero medio
    case "U7": return color(5, 5, 5);     // nero 

    
    case "?":       return color(255, 250, 180);  // giallo chiarissimo
    case "Unknown": return color(230, 230, 230);  // grigio chiarissimo

    // fallback neutro
    default:
      return color(240, 240, 240);
  }
}

//FUNZIONE PER DEFINIRE LA FORMA

//metto due variabili 
function drawShapeForTypeSized(p, s)  {
  let t = (p.typeCategory || "").trim().toLowerCase();

  switch (t) {

    //rettangolo 
    case "stratovolcano":
      rectMode(CENTER); //punto di applicazione non angolo, ma centro 
      rect(p.x, p.y, s * 0.8, s * 1.6);
      break;

    //quadrato
    case "shield volcano":
      rectMode(CENTER); //same di sopra 
      square(p.x, p.y, s * 1.2);
      break;

    //cerchio
    case "caldera":
      circle(p.x, p.y, s * 1.4);
      break;

    //triangolo con base tonda
    case "cone":
      // cono
      beginShape(); //apro la forma con i punti 
      vertex(p.x,         p.y - s * 1.0);
      vertex(p.x - s*0.8, p.y + s * 0.4);
      vertex(p.x + s*0.8, p.y + s * 0.4);
      endShape(CLOSE); //chiudo la forma
    
      break;

    //esagono
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

    //ellisse larga 
    case "maars / tuff ring":
      ellipse(p.x, p.y, s * 1.8, s * 0.9);
      break;

    //rombo
    case "submarine volcano":
      beginShape();
      vertex(p.x,         p.y - s * 0.8);
      vertex(p.x + s*0.8, p.y);
      vertex(p.x,         p.y + s * 0.8);
      vertex(p.x - s*0.8, p.y);
      endShape(CLOSE);
      break;

    //rettangolo orizzontale
    case "subglacial":
      rectMode(CENTER);
      rect(p.x, p.y, s * 1.8, s * 0.6);
      break;

    //croce spessa
    case "other / unknown":
      //in questo caso per lo stroke usa il colore delle funzione sopra 
    const col = colorLastEruption(p.last);
    stroke(col);
    strokeWeight(max(2, s * 0.25)); // scala lo spessore con la dimensione
    strokeCap(ROUND);               // estremità arrotondate = più belle
    line(p.x - s*0.8, p.y - s*0.8, p.x + s*0.8, p.y + s*0.8);
    line(p.x + s*0.8, p.y - s*0.8, p.x - s*0.8, p.y + s*0.8);
    noStroke(); // ripulisci per i disegni successivi
    
    break;

    // fallback se mai capita qualcos'altro
    default:
      circle(p.x, p.y, s * 1.2);
      break;
  }
}

//FUNZIONE BOX INFORMATIVO (contiene nome e paese)
function drawTooltip(volcanoName, country) { 
  let line1 = volcanoName || "Unknown volcano"; 
  let line2 = country || "Unknown country"; 
  //inserisco le due variabili

  textSize(14); //grandezza font
  textAlign(LEFT, TOP); 

  let padding = 10; 
  let lineHeight = textAscent() + textDescent(); // altezza reale della riga
  let w1 = textWidth(line1); //larghezza prima riga
  let w2 = textWidth(line2); //larghezza seconda riga 
  let w = max(w1, w2) + padding * 2; //prendo la massima tra le due e aggiungo un padding 
  let h = lineHeight * 2 + padding * 2 + 4; // altezza del box 
  //altezza linee per due + padding + spazio tra le due righe (4)

  //spostare il la box leggermente dal mouse, come un'etichetta appesa
  let boxX = mouseX + 20; 
  let boxY = mouseY + 5; 

  fill(0, 0, 0, 200); //sfondo scuro 
  noStroke(); 
  rectMode(CORNER);
  rect(boxX, boxY, w, h); //disegno il rettangolo 
  
  //testo dentro bianco 
  fill(255);
 text(line1, boxX + padding, boxY + padding);
 text(line2, boxX + padding, boxY + padding + lineHeight + 4);
  }



function setup() {
  createCanvas(windowWidth, 1200);
  
  spiralLayout();

}

function draw() {
  background (44,44,44); //sfondo

//TITOLO "DATASET VULCANI"
  textFont('Courier New');
  fill(248, 250, 252); // colore testo
  noStroke();
  textAlign(LEFT, TOP);
  textSize(20);
  text("DATASET VULCANI", 20, 20);

  textSize(12);
  text("LEGENDA", 20, 70);

//LEGENDA//
  textSize(14); //dimensione testo legenda 
  fill(240);
  textAlign(LEFT, TOP);
  text("Ultima eruzione", 20, 90);
  text("Tipo di vulcano", 180, 90);

  //COLONNA COLORI//
  let colorY = 115; //y di partenza della colonnina
  let stepY = 20; //spazio tra una riga e l'altra 

  let codes = ["D1", "D2", "D3", "D4", "D5", "D6","D7", "D","P","Q", "U", "U1", "U7", "?", "Unknown"];
  //array con le etichette dei gruppi di eruzione che voglio mostrare 
  //ordine Array uguale ordine di visualizzazione 
  for (let i = 0; i < codes.length; i++) {
    //ciclo per scorrere tutto l'array
  let c = colorLastEruption(codes[i]);
    //pallino accanto
  fill(c);
  noStroke();
  circle(30, colorY + i * stepY, 12);
    //testo//
  fill(240);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(codes[i], 50, colorY + i * stepY);
  }
  

  //COLONNA FORME//
  //variabibili legate alla posizione della colonna nello spazio
  let formY = 115; //y iniziziale//
  let formStepY = 20; //spazio tra una riga e la successiva
  let formX = 180; //x di partenza della colonna 
  
  //caratteristiche del testo 
  textSize(12);
  fill(240);
  textAlign(LEFT, CENTER);

  // array con etichetta e disegno relativo
  //array di coppie 
  let forms = [
  ["Stratovolcano", "rettangolo verticale"],
  ["Shield volcano", "quadrato"],
  ["Caldera", "cerchio"],
  ["Cone", "triangolo + base tonda"],
  ["Crater system", "esagono"],
  ["Maars / Tuff ring", "ellisse bassa"],
  ["Submarine volcano", "rombo"],
  ["Subglacial", "rettangolo orizzontale"],
  ["Other / Unknown", "croce"]
  ];

  //apro un ciclo for per ogni riga dell'array forms
  for (let i = 0; i < forms.length; i++) {
    let fy = formY + i * formStepY; //y della riga (y di partenza + la rigaxpasso)
    let fx = formX+10; //x della forma 

  // disegno una forma 
  fill(220);
  noStroke();
  let p = {x: fx, y: fy, typeCategory: forms[i][0].toLowerCase()}; 
  //fx e fy sono le due variabili che ho decsritto prima che mi definsico la posizione
  //gli dico le forme da prendere 
  //richiamo la funzione che disegna le forme in base alla mia categoria 
  drawShapeForTypeSized(p, 6);
  //6 è la scala (stesso ragionamento dell'hover)

  // etichetta testuale
  fill(240);
  textSize(12);
  text(forms[i][0], fx + 20, fy);
  //etichetta
}





//HOVER PER LEGGERE NOME E PAESE 
  hoveredIndex = -1; // reset della variabile 
  let hoverDistThreshold = 10; // distanza massima in px per considerare "hover"

   for (let i = 0; i < points.length; i++) { //apro un ciclo for 
    let p = points[i];

    // calcolo la distanza tra il mouse e il mio punto relativo al vulcano p 
    let d = dist(mouseX, mouseY, p.x, p.y);

    //se la mia distanza è minore della soglia che ho scritto prima 
    //allora accade qualcosa 
    if (d < hoverDistThreshold) {
      hoveredIndex = i; //salva l'inidice i (numero della riga) e non più -1
      break; // prendo il primo che trovo e basta, poi esco subito dal ciclo 
    }
  }

//DISEGNO DEI VARI VULCANI 

  for (let i = 0; i < points.length; i++) {

    if (i === hoveredIndex) continue; 
    //mi dice che se il mio punto è sotto il mouse di saltarlo, per ora

    let p = points[i];

    let c = colorLastEruption(p.last);
    fill(c);         // applico quel colore
    noStroke();
    drawShapeForTypeSized(p, 6);
  }

  if (hoveredIndex !== -1) { //controllo se è su un vulcano
    //se hoveredIndex non è uguale a -1, allora sto sopra a un punto 
    let p = points[hoveredIndex]; //vulcano su cui sono, non tutte le righe (i) come sopra 

    let c = colorLastEruption(p.last);
    fill(c);
    stroke(255);
    strokeWeight(1.2);
    // versione ingrandita
    drawShapeForTypeSized(p, 30);
    noStroke();

    //etichetta 
    drawTooltip(p.name, p.country);
  }
}
