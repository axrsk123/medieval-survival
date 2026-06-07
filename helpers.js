// Pomocná funkcia na prispôsobenie veľkosti plátna podľa okna prehliadača
function resizeCanvas() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Matematická funkcia na výpočet vzdialenosti medzi dvoma bodmi (Pytagorova veta)
Math.getDist = function(x1, y1, x2, y2) { 
    let dx = x1 - x2; 
    let dy = y1 - y2; 
    return Math.sqrt(dx*dx + dy*dy); 
};

// Načítanie uloženého postupu z pamäte prehliadača (podľa mena hráča)
function loadProfile(name) {
    player.name = name.toUpperCase();
    const saved = localStorage.getItem(`dbb_save_${player.name}`);
    if (saved) {
        const d = JSON.parse(saved);
        player.inventory.wood = d.wood || 0;
        player.inventory.gold = d.gold || 0;
        player.inventory.meat = d.meat || 0;
        player.cosmetic = d.cosmetic || 'none';
        player.cosmeticColor = d.cosmeticColor || '#ff2222';
        player.quests = d.quests || { boarsKilled: 0, goldCollected: 0 };
    }
    colorInputUi.value = player.cosmeticColor;
    updateHud();
}

// Uloženie surovín a questov do pamäte prehliadača
function saveProfile() {
    if (!gameActive) return;
    const data = { 
        wood: player.inventory.wood, 
        gold: player.inventory.gold, 
        meat: player.inventory.meat, 
        cosmetic: player.cosmetic, 
        cosmeticColor: player.cosmeticColor, 
        quests: player.quests 
    };
    localStorage.setItem(`dbb_save_${player.name}`, JSON.stringify(data));
}

// Funkcia, ktorá na plátno nakreslí vybraný štít, rohy alebo plášť
function renderCosmeticItem(targetCtx, x, y, angle, type, colorHex) {
    if (type === 'none') return;
    targetCtx.save();
    targetCtx.translate(x, y); 
    targetCtx.rotate(angle);   
    targetCtx.fillStyle = colorHex;
    targetCtx.strokeStyle = '#111';
    targetCtx.lineWidth = 3;

    if (type === 'round_shield') {
        targetCtx.beginPath(); targetCtx.arc(-15, 10, 12, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
        targetCtx.fillStyle = '#cca300'; targetCtx.beginPath(); targetCtx.arc(-15, 10, 4, 0, Math.PI * 2); targetCtx.fill();
    } 
    else if (type === 'kite_shield') {
        targetCtx.save(); targetCtx.translate(-16, 12); targetCtx.rotate(Math.PI / 4);
        targetCtx.beginPath(); targetCtx.moveTo(0, -12); targetCtx.lineTo(10, -6); targetCtx.lineTo(6, 6); targetCtx.lineTo(0, 14); targetCtx.lineTo(-6, 6); targetCtx.lineTo(-10, -6); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke();
        targetCtx.restore();
    } 
    else if (type === 'spikes') {
        for (let i = -1; i <= 1; i += 2) {
            targetCtx.beginPath(); targetCtx.moveTo(i*18, -12); targetCtx.lineTo(i*26, -24); targetCtx.lineTo(i*10, -18); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke();
        }
    } 
    else if (type === 'cape') {
        targetCtx.globalAlpha = 0.85;
        targetCtx.beginPath(); targetCtx.moveTo(-16, -4); targetCtx.lineTo(-32, -18); targetCtx.lineTo(-32, 18); targetCtx.lineTo(-16, 4); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke();
    } 
    else if (type === 'horns') {
        targetCtx.fillStyle = '#fff';
        targetCtx.beginPath(); targetCtx.arc(14, -12, 5, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke();
        targetCtx.beginPath(); targetCtx.arc(14, 12, 5, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke();
    }
    targetCtx.restore();
}