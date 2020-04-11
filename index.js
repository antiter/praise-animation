let praiseBubble = document.getElementById("praise_bubble");
let last = 0;
function addPraise() {
    const b =Math.floor(Math.random() * 6) + 1;
    const bl =Math.floor(Math.random() * 11) + 1; // bl1~bl11

    let d = document.createElement("div");
    d.className = `bubble b${b} bl${bl}`;
    d.dataset.t = String(Date.now());
    praiseBubble.appendChild(d);
}
setInterval(() => {
    addPraise();
},300)
