const map = L.map('map',{zoomControl:false}).setView([49.6038,8.2636],16);

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
babykleidung: "Babykleidung (Größe 50–92)",
kinderkleidung: "Kinderkleidung (Größe 98–182)",
erwachsenenkleidung: "Erwachsenenkleidung",
haushalt: "Haushalt",
moebel: "Möbel",
schmuck: "Schmuck",
spielzeug: "Spielzeug",
spielgeraete: "Spielgeräte",
kinderbuecher: "Kinderbücher (0–10 Jahre)",
jugendbuecher: "Jugendbücher (11–17 Jahre)",
erwachsenenbuecher: "Erwachsenenbücher (ab 18)",
sonstiges: "Sonstiges"
};

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
 attribution:'© OpenStreetMap'
}).addTo(map);

fetch("participants.json")
.then(r=>r.json())
.then(data=>{

const artikelSet=new Set();
const markerList=[];

data.forEach(p=>{

Object.entries(p.artikel).forEach(([k,v])=>{
 if(v) artikelSet.add(k);
});

const marker=L.marker([p.latitude,p.longitude],{
icon:L.divIcon({
className:"custom-marker",
html:`<div style="
background:#f59e0b;
color:black;
width:28px;
height:28px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-weight:bold;
">${p.stand_nummer}</div>`
})
}).addTo(map);

const artikel=Object.entries(p.artikel)
 .filter(([k,v])=>v)
 .map(([k])=>artikelNamen[k])
 .join("<br>");

marker.bindPopup(
 "<b>Stand "+p.stand_nummer+"</b><br>"+
 p.verkaufsanschrift+"<br><br>"+artikel
);

marker.artikel=Object.entries(p.artikel)
 .filter(([k,v])=>v)
 .map(([k])=>k);

markerList.push(marker);

});

const select=document.getElementById("artikelFilter");

artikelListe.forEach(a=>{

const stands=data
  .filter(p=>p.artikel[a])
  .map(p=>p.stand_nummer);

const o=document.createElement("option");
o.value=a;

if(stands.length>0){
  const name = artikelNamen[a];
const nummern = stands.join(",");

const count = stands.length;

if(count>0){
  o.textContent = `${artikelNamen[a]} (${count})`;
}else{
  o.textContent = artikelNamen[a];
}
}else{
  o.textContent=artikelNamen[a].padEnd(40," ");
}

select.appendChild(o);

});

select.addEventListener("change",()=>{
const val=select.value;

markerList.forEach(m=>{

const el = m.getElement().querySelector("div");

if(!val){
el.style.background="#f59e0b";
}
else if(m.artikel.includes(val)){
el.style.background="#10b981";
}
else{
el.style.background="#9ca3af";
}

});
});

});