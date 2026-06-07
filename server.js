const { WebSocketServer } = require('ws');

// Spustíme server na porte 8080
const wss = new WebSocketServer({ port: 8080 });

// Bezpečná databáza registrovaných účtov na serveri
const serverAccounts = {
    "AXRSK123": "Gojosatoru123!" // Tvoj hlavný admin účet
};

// Zoznam hráčov na mape
let activePlayers = {};

console.log("⚔️ MEDIEVAL SERVER BEŽÍ NA PORTE 8080 ⚔️");
console.log("Ochrana Matrix Ownera je aktívna. Čakám na bojovníkov...");

wss.on('connection', (ws) => {
    let myUsername = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Overenie prihlásenia a registrácie
            if (data.type === 'auth') {
                const name = data.name.trim().toUpperCase();
                const password = data.password.trim();

                if (data.mode === 'register') {
                    if (serverAccounts[name]) {
                        ws.send(JSON.stringify({ type: 'auth_response', success: false, msg: "Name already taken!" }));
                    } else {
                        serverAccounts[name] = password;
                        ws.send(JSON.stringify({ type: 'auth_response', success: true, msg: "Registered! Click LOGIN." }));
                        console.log(`📝 Nový hráč registrovaný: ${name}`);
                    }
                }

                if (data.mode === 'login') {
                    if (serverAccounts[name] && serverAccounts[name] === password) {
                        myUsername = name;
                        
                        activePlayers[name] = {
                            name: name,
                            x: 2000, y: 2000,
                            angle: 0,
                            health: 100,
                            isAdmin: (name === 'AXRSK123') // Server nekompromisne určí admina
                        };

                        ws.send(JSON.stringify({ 
                            type: 'auth_response', 
                            success: true, 
                            username: name,
                            isAdmin: activePlayers[name].isAdmin 
                        }));
                        
                        console.log(`👑 Hráč ${name} vstúpil do hry. ${activePlayers[name].isAdmin ? '--- MATRIX OWNER DETECTED ---' : ''}`);
                    } else {
                        ws.send(JSON.stringify({ type: 'auth_response', success: false, msg: "ACCESS DENIED!" }));
                    }
                }
            }

            // Pohyb hráčov
            if (data.type === 'move' && myUsername) {
                if (activePlayers[myUsername]) {
                    activePlayers[myUsername].x = data.x;
                    activePlayers[myUsername].y = data.y;
                    activePlayers[myUsername].angle = data.angle;
                    
                    broadcast({
                        type: 'state',
                        players: activePlayers
                    });
                }
            }

        } catch (e) {
            console.error("Chyba:", e);
        }
    });

    ws.on('close', () => {
        if (myUsername && activePlayers[myUsername]) {
            console.log(`❌ Hráč ${myUsername} sa odpojil.`);
            delete activePlayers[myUsername];
            broadcast({ type: 'state', players: activePlayers });
        }
    });
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(msg);
    });
}