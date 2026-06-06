// ==========================================
// 0. POISTKY (ZOSÚLADENIE A GLOBÁLNE DATA)
// ==========================================
WORLD_SIZE = 4000;
MAX_RESOURCES = 50;
MAX_ENEMIES = 15;
gameActive = false;
isServerAdmin = false;

if (typeof player === 'undefined') {
    var player = {
        name: "Player", x: 2000, y: 2000, radius: 22, speed: 5, vx: 0, vy: 0, friction: 0.85, angle: 0,
        isAttacking: false, attackTimer: 0, attackDuration: 10, weaponAngle: 0, health: 100, hunger: 100,
        inventory: { wood: 0, gold: 0, meat: 0 }, cosmetic: 'none', cosmeticColor: '#ff2222',
        quests: { boarsKilled: 0, goldCollected: 0 }, isGodMode: false, hasSpeedHack: false, isMindControl: false, controlledMobId: null
    };
}

if (typeof resources === 'undefined') { var resources = []; }
if (typeof enemies === 'undefined') { var enemies = []; }
if (typeof keys === 'undefined') { var keys = { w: false, a: false, s: false, d: false }; }
if (typeof mouse === 'undefined') { var mouse = { x: 0, y: 0, screenX: 0, screenY: 0 }; }
if (typeof camera === 'undefined') { var camera = { x: 0, y: 0 }; }

Math.getDist = function(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

// ==========================================
// 1. SIEŤ A SERVER
// ==========================================
var socket = new WebSocket('ws://localhost:8080');

socket.onmessage = function(event) {
    try {
        var data = JSON.parse(event.data);
        if (data.type === 'auth_response') {
            alert(data.msg || (data.success ? "ACCESS GRANTED!" : "FAILED"));
            if (data.success) {
                isServerAdmin = data.isAdmin;
                startGame(data.username);
            }
        }
        if (data.type === 'state' && gameActive) {
            window.multiplayerPlayers = data.players;
        }
    } catch(e) {}
};

function startGame(name) {
    player.name = name;
    if (document.getElementById('player-title')) document.getElementById('player-title').textContent = player.name + "'S SURVIVAL";
    if (document.getElementById('login-screen')) document.getElementById('login-screen').style.display = 'none';
    gameActive = true;
    
    setInterval(function() {
        if (gameActive && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'move', x: player.x, y: player.y, angle: player.angle }));
        }
    }, 30);
}

function updateHud() {
    if (document.getElementById('inv-wood')) document.getElementById('inv-wood').textContent = player.inventory.wood;
    if (document.getElementById('inv-gold')) document.getElementById('inv-gold').textContent = player.inventory.gold;
    if (document.getElementById('inv-meat')) document.getElementById('inv-meat').textContent = player.inventory.meat;
    if (document.getElementById('hud-hunger')) document.getElementById('hud-hunger').style.width = player.hunger + "%";
    if (document.getElementById('q-boars-count')) document.getElementById('q-boars-count').textContent = player.quests.boarsKilled + "/3";
    if (document.getElementById('q-gold-count')) document.getElementById('q-gold-count').textContent = player.quests.goldCollected + "/50";
    if (document.getElementById('coords')) document.getElementById('coords').textContent = "X: " + Math.floor(player.x) + ", Y: " + Math.floor(player.y);
}

// ==========================================
// 2. SPAWNER ENTÍT
// ==========================================
if (enemies.length === 0) {
    for(var i=0; i<MAX_ENEMIES; i++) {
        enemies.push({ id: Math.random(), x: Math.random()*WORLD_SIZE, y: Math.random()*WORLD_SIZE, radius: 18, speed: 2.2, health: 30, vx: 0, vy: 0, wanderTimer: 0 });
    }
}
if (resources.length === 0) {
    for(var i=0; i<MAX_RESOURCES; i++) {
        var rX = Math.sin(i) * 10000; var rY = Math.cos(i) * 10000;
        resources.push({ id: i, x: 200 + (Math.abs(rX) % (WORLD_SIZE - 400)), y: 200 + (Math.abs(rY) % (WORLD_SIZE - 400)), type: (rX + rY)%2 > 0 ? 'tree' : 'gold_rock', radius: 30, health: 40, isDestroyed: false });
    }
}

// ==========================================
// 3. OVLÁDANIE A PRIHLASOVANIE
// ==========================================
function handleAuth(mode) {
    var uInput = document.getElementById('username-input');
    var pInput = document.getElementById('password-input');
    if(!uInput || !pInput) return;
    if(socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'auth', mode: mode, name: uInput.value, password: pInput.value }));
    }
}

window.addEventListener('load', function() {
    if(document.getElementById('login-btn')) document.getElementById('login-btn').onclick = function() { handleAuth('login'); };
    if(document.getElementById('register-btn')) document.getElementById('register-btn').onclick = function() { handleAuth('register'); };
});

if(document.getElementById('login-btn')) document.getElementById('login-btn').onclick = function() { handleAuth('login'); };
if(document.getElementById('register-btn')) document.getElementById('register-btn').onclick = function() { handleAuth('register'); };

// ⚡ OŠETRENÉ SÚČASNE PROTI PÁDOM (toLowerCase error vyriešený)
window.addEventListener('keydown', function(e) {
    if (!gameActive || !e.key) return; // Ak kláves nemá hodnotu, ignorujeme
    var k = e.key.toLowerCase();
    if(k in keys) keys[k] = true;
    if(k === 'e' && player.inventory.meat > 0 && player.hunger < 100) {
        player.inventory.meat--; player.hunger = Math.min(100, player.hunger + 30); player.health = Math.min(100, player.health + 15);
    }
    if(k === 'p' && isServerAdmin && document.getElementById('owner-menu')) {
        var m = document.getElementById('owner-menu'); m.style.display = m.style.display === 'block' ? 'none' : 'block';
    }
});

window.addEventListener('keyup', function(e) { 
    if (!gameActive || !e.key) return;
    var k = e.key.toLowerCase(); 
    if(k in keys) keys[k] = false; 
});

window.addEventListener('mousemove', function(e) { mouse.screenX = e.clientX; mouse.screenY = e.clientY; });

if(typeof canvas !== 'undefined' && canvas) {
    canvas.addEventListener('mousedown', function(e) {
        if(!gameActive || player.isAttacking) return;
        player.isAttacking = true; player.attackTimer = player.attackDuration; player.weaponAngle = -Math.PI/3;
        var atkX = player.x + Math.cos(player.angle)*45; var atkY = player.y + Math.sin(player.angle)*45;

        resources.forEach(function(node) {
            if(node.isDestroyed) return;
            if(Math.getDist(atkX, atkY, node.x, node.y) < node.radius + 15) {
                node.health -= 10; if(node.type === 'tree') player.inventory.wood += 4; else player.inventory.gold += 2;
                if(node.health <= 0) node.isDestroyed = true; updateHud();
            }
        });
    });
}

window.toggleCheat = function(type) {
    if(!isServerAdmin) return;
    if(type === 'god') { player.isGodMode = !player.isGodMode; if(player.isGodMode) player.health = 100; }
    if(type === 'speed') { player.hasSpeedHack = !player.hasSpeedHack; player.speed = player.hasSpeedHack ? 15 : 5; }
    if(type === 'resources') { player.inventory.gold += 50000; player.inventory.wood += 50000; updateHud(); }
    if(type === 'mindcontrol') {
        player.isMindControl = !player.isMindControl;
        if(player.isMindControl) {
            var closest = null; var minD = 999999;
            enemies.forEach(function(m) { var d = Math.getDist(player.x, player.y, m.x, m.y); if(d < minD) { minD = d; closest = m; } });
            if(closest) player.controlledMobId = closest.id; else player.isMindControl = false;
        }
    }
};

// ==========================================
// 4. SLUČKA HRY (LOGIKA A GRAFIKA)
// ==========================================
function update() {
    if(gameActive) {
        var ax = 0; var ay = 0;
        if(keys.w) ay -= 1; if(keys.s) ay += 1; if(keys.a) ax -= 1; if(keys.d) ax += 1;
        player.vx += ax * (player.speed * 0.18); player.vy += ay * (player.speed * 0.18);
        player.vx *= player.friction; player.vy *= player.friction; player.x += player.vx; player.y += player.vy;
        updateHud();
    }

    enemies.forEach(function(mob) {
        if(player.isMindControl && player.controlledMobId === mob.id && gameActive) {
            mob.vx = player.vx * 1.2; mob.vy = player.vy * 1.2;
        } else {
            mob.wanderTimer--;
            if(mob.wanderTimer <= 0) { mob.vx = (Math.random()-0.5)*mob.speed; mob.vy = (Math.random()-0.5)*mob.speed; mob.wanderTimer = 100; }
        }
        mob.x += mob.vx; mob.y += mob.vy;
    });

    if(typeof canvas !== 'undefined' && canvas) { camera.x = player.x - canvas.width/2; camera.y = player.y - canvas.height/2; }
    player.angle = Math.atan2((mouse.screenY + camera.y) - player.y, (mouse.screenX + camera.x) - player.x);
    if(player.isAttacking) { player.attackTimer--; if(player.attackTimer <= 0) player.isAttacking = false; }
}

function draw() {
    if(typeof canvas === 'undefined' || !canvas) return;
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if(!gameActive) return;

    ctx.save(); ctx.translate(-camera.x, -camera.y);
    ctx.fillStyle = '#2e4d2e'; ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    resources.forEach(function(n) { if(!n.isDestroyed) { ctx.fillStyle = n.type==='tree'?'#1e3f20':'#7a7a7a'; ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI*2); ctx.fill(); } });
    enemies.forEach(function(m) { ctx.fillStyle = '#6b4423'; ctx.beginPath(); ctx.arc(m.x, m.y, m.radius, 0, Math.PI*2); ctx.fill(); });

    if(window.multiplayerPlayers) {
        Object.keys(window.multiplayerPlayers).forEach(function(id) {
            var p = window.multiplayerPlayers[id];
            if(p.name !== player.name) {
                ctx.save(); ctx.translate(p.x, p.y); ctx.fillStyle = p.isAdmin ? '#8a2323' : '#2b5797'; ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI*2); ctx.fill(); ctx.restore();
            }
        });
    }

    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle); ctx.fillStyle = isServerAdmin ? '#8a2323' : '#2b5797'; ctx.beginPath(); ctx.arc(0, 0, player.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.restore();
}

// Spustenie slučky
if (typeof loopInterval !== 'undefined') clearInterval(loopInterval);
var loopInterval = setInterval(update, 1000 / 60);

function renderLoop() {
    draw();
    requestAnimationFrame(renderLoop);
}
renderLoop();