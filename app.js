const map = L.map('map',{zoomControl:false}).setView([49.6038,8.2636],16);

// Karte
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
 attribution:'© OpenStreetMap'
}).addTo(map);

// Standort
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position){
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    L.circleMarker([lat,lon],{
      radius:8,
      color:"#2563eb",
      fillColor:"#2563eb",
      fillOpacity:1
    })
    .addTo(map)
    .bindPopup("📍 Sie sind hier");
  });
}

// Artikel-Liste
const artikelListe = [
"babykleidung",
"kinderkleidung",
"erwachsenenkleidung",
"haushalt",
"moebel",
"schmuck",
"spielzeug",
"spielgeraete",
"kinderbuecher",
"jugendbuecher",
"erwachsenenbuecher",
"sonstiges"
];

const artikelNamen = {
babykleidung: "Babykleidung",
kinderkleidung: "Kinderkleidung",
erwachsenenkleidung: "Erwachsenenkleidung",
haushalt: "Haushalt",
moebel: "Möbel",
schmuck: "Schmuck und Sammlungen",
spielzeug: "Spielzeug",
spielgeraete: "Spielgeräte/-fahrzeuge",
kinderbuecher: "Kinderbücher",
jugendbuecher: "Jugendbücher",
erwachsenenbuecher: "Erwachsenenbücher",
sonstiges: "Sonstiges"
};

// Normalisierung (wichtig!)
function normalize(text){
  return text
    .toLowerCase()
    .replace(/ä/g,"ae")
    .replace(/ö/g,"oe")
    .replace(/ü/g,"ue")
    .replace(/ß/g,"ss")
    .trim();
}

// Daten laden
fetch("participants.json?x=" + Date.now())
.then(r => r.json())
.then(data => {

const select = document.getElementById("artikelFilter");

// Dropdown
select.innerHTML = '<option value="">Welchen Artikel suchen Sie?</option>';

artikelListe.forEach(a => {

  const count = data.filter(p => {
    const artikelArray = p.artikel
      ? p.artikel.split(",").map(x => normalize(x))
      : [];

    return artikelArray.includes(normalize(artikelNamen[a]));
  }).length;

  const option = document.createElement("option");
  option.value = normalize(artikelNamen[a]);

  if(count > 0){
    option.textContent = `${artikelNamen[a]} (${count})`;
  } else {
    option.textContent = artikelNamen[a];
  }

  select.appendChild(option);

});

// Marker
const markerList = [];

data.forEach(p => {

  const artikelArray = p.artikel
    ? p.artikel.split(",").map(x => normalize(x))
    : [];

  if(p.lat && p.lon){

console.log("Marker Position:", p.stand, p.lat, p.lon);

   const lat = parseFloat(p.lat);
   const lon = parseFloat(p.lon);

const marker = L.marker([lat, lon], {
  icon: L.divIcon({
    className: "",
    html: `<div style="
      background:#f59e0b;
      color:black;
      width:30px;
      height:30px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:bold;
      font-size:14px;
      border:2px solid white;
    ">
      ${p.stand}
    </div>`
  })
}).addTo(map);
       
    const artikelText = artikelArray
      .map(a => {
        const key = Object.keys(artikelNamen).find(k => normalize(artikelNamen[k]) === a);
        return artikelNamen[key] || a;
      })
      .join("<br>");

   const url = "https://www.google.com/maps/dir/?api=1"
  + "&origin=Current+Location"
  + "&destination=" + encodeURIComponent(p.adresse);
    
marker.bindPopup(
  "<b>Stand "+p.stand+"</b><br>"+
  p.adresse+
  "<br><br>"+
  artikelText+
  "<br><br>"+
  "<a target='_blank' href='" + url + "'>📍 Route starten</a>"
);

    marker.artikel = artikelArray;

    markerList.push(marker);
  }

});

// Filter
select.addEventListener("change",()=>{

const val = normalize(select.value);

markerList.forEach(m => {

  const el = m.getElement().querySelector("div");

  if(!val){
    el.style.background = "#f59e0b"; // orange
  }
  else if(m.artikel.includes(val)){
    el.style.background = "#10b981"; // grün
  }
  else{
    el.style.background = "#9ca3af"; // grau
  }

});

});

console.log("Geladene Datensätze:", data.length);
console.log("Erstellte Marker:", markerList.length);

});