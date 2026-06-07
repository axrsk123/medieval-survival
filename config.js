// ==========================================
// 1. ZÍSKANIE HTML PRVKOV (UI / HUD)
// ==========================================
// Tieto riadky prepoja JavaScript s prvkami (plátno, texty, tlačidlá), ktoré máš v game.html

const canvas = document.getElementById('gameCanvas');           // Hlavné plátno, kde sa vykresľuje celá hra
const ctx = canvas.getContext('2d');                            // Nástroj (kontext) na kreslenie do hlavného plátna
const previewCanvas = document.getElementById('previewCanvas');   // Malé plátno pre náhľad postavy v obchode
const pCtx = previewCanvas.getContext('2d');                    // Nástroj na kreslenie do náhľadového plátna

// Prepojenie textových polí a ukazovateľov na obrazovke
const coordsUi = document.getElementById('coords');             // Ukazovateľ súradníc X a Y
const invWoodUi = document.getElementById('inv-wood');           // Text pre množstvo dreva v inventári
const invGoldUi = document.getElementById('inv-gold');           // Text pre množstvo zlata v inventári
const invMeatUi = document.getElementById('inv-meat');           // Text pre množstvo mäsa v inventári
const hudHunger = document.getElementById('hud-hunger');         // Grafická lišta hladu (oranžový pásik)
const hudCosmetic = document.getElementById('hud-cosmetic');     // Text zobrazujúci nasadené brnenie/štít

// Prvky prihlasovacej a registračnej obrazovky
const loginScreen = document.getElementById('login-screen');     // Celá čierna úvodná obrazovka
const usernameInput = document.getElementById('username-input'); // Políčko, kam zadávaš meno hrdinu
const passwordInput = document.getElementById('password-input'); // Políčko, kam zadávaš heslo účtu
const loginBtn = document.getElementById('login-btn');           // Tlačidlo na prihlásenie (LOGIN)
const registerBtn = document.getElementById('register-btn');     // Tlačidlo na vytvorenie účtu (REGISTER)

// Ostatné dôležité okná a UI prvky
const playerTitleUi = document.getElementById('player-title');   // Nadpis survivalu vľavo hore
const ownerMenuUi = document.getElementById('owner-menu');       // Tajné menu pre vývojára/admina
const cosmeticShopUi = document.getElementById('cosmetic-shop'); // Okno kráľovského obchodu s brnením
const colorInputUi = document.getElementById('cosmetic-color-input'); // Výber farby (Dye picker) v obchode

// ==========================================
// 2. STAVOVÉ PREMENNÉ HRY
// ==========================================
// Tieto premenné sledujú aktuálny stav a režim, v ktorom sa hra nachádza

let gameActive = false;         // Určuje, či hra beží (true = hráš na mape, false = si v menu)
let enteringPassword = false;    // Pomocný prepínač, či systém overuje admina
let tempUsername = "";          // Dočasná premenná pre meno pred úspešným prihlásením
let previewRotation = 0;        // Uhol otočenia postavičky v obchode (zabezpečuje plynulé točenie)

// ==========================================
// 3. NASTAVENIA SVETA A OVLÁDANIA
// ==========================================
// Parametre mapy a herných periféri