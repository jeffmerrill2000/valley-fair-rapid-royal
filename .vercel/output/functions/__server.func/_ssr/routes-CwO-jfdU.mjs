import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CwO-jfdU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var audio = null;
function unlockAudio() {
	if (typeof window === "undefined") return;
	if (!audio) audio = new AudioContext();
	if (audio.state === "suspended") audio.resume();
}
function beep(freq, at, dur, type, gain) {
	if (!audio) return;
	const osc = audio.createOscillator();
	const amp = audio.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	amp.gain.setValueAtTime(gain, at);
	amp.gain.exponentialRampToValueAtTime(1e-4, at + dur);
	osc.connect(amp);
	amp.connect(audio.destination);
	osc.start(at);
	osc.stop(at + dur + .02);
}
function playCue(kind, muted) {
	if (muted || !audio) return;
	const t = audio.currentTime;
	const wobble = .94 + Math.random() * .12;
	if (kind === "catch") {
		beep(520 * wobble, t, .08, "triangle", .06);
		beep(780 * wobble, t + .05, .1, "sine", .05);
	} else if (kind === "gold") {
		beep(660 * wobble, t, .08, "triangle", .07);
		beep(880 * wobble, t + .06, .1, "sine", .06);
		beep(1170 * wobble, t + .12, .14, "sine", .05);
	} else if (kind === "miss") {
		beep(140, t, .16, "sine", .07);
		beep(90, t + .04, .18, "triangle", .05);
	} else {
		beep(440, t, .12, "triangle", .06);
		beep(330, t + .1, .14, "triangle", .05);
		beep(220, t + .22, .22, "sine", .05);
	}
}
var STORAGE = "orchard-drop-v1";
var LIVES = 3;
var PAL = {
	skyTop: "#8ecae6",
	skyMid: "#f3e7cf",
	sun: "#f6d56b",
	hillFar: "#8fb56a",
	hillNear: "#6ea15a",
	grass: "#4f8a45",
	grassDark: "#3d6e36",
	bark: "#5c3a24",
	leaf: "#2d6a3a",
	apple: "#c23b22",
	appleDark: "#8e2416",
	gold: "#e2b133",
	goldDark: "#b8860b",
	cream: "#f6efe2",
	ink: "#2a2118"
};
function loadSave() {
	try {
		const raw = localStorage.getItem(STORAGE);
		if (!raw) return {
			best: 0,
			mute: false
		};
		const parsed = JSON.parse(raw);
		if (parsed.version !== 1) return {
			best: 0,
			mute: false
		};
		return {
			best: Math.max(0, Number(parsed.best) || 0),
			mute: Boolean(parsed.mute)
		};
	} catch {
		return {
			best: 0,
			mute: false
		};
	}
}
function writeSave(best, mute) {
	localStorage.setItem(STORAGE, JSON.stringify({
		version: 1,
		best,
		mute
	}));
}
var Orchard = class {
	phase = "ready";
	score = 0;
	best = 0;
	lives = LIVES;
	combo = 0;
	mute = false;
	reduced = false;
	width = 390;
	height = 700;
	apples = [];
	bits = [];
	floaters = [];
	clouds = [];
	trauma = 0;
	time = 0;
	spawn = 0;
	hitstop = 0;
	nextId = 1;
	onHud;
	constructor(onHud) {
		this.onHud = onHud;
		const saved = loadSave();
		this.best = saved.best;
		this.mute = saved.mute;
		this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.seedClouds();
		this.emit();
	}
	hud() {
		return {
			phase: this.phase,
			score: this.score,
			best: this.best,
			lives: this.lives,
			combo: this.combo,
			mute: this.mute
		};
	}
	emit() {
		this.onHud(this.hud());
	}
	seedClouds() {
		this.clouds = [
			{
				x: 40,
				y: 70,
				w: 120,
				s: 8
			},
			{
				x: 220,
				y: 110,
				w: 160,
				s: 12
			},
			{
				x: 480,
				y: 54,
				w: 90,
				s: 6
			}
		];
	}
	resize(width, height) {
		this.width = Math.max(280, width);
		this.height = Math.max(420, height);
	}
	toggleMute() {
		this.mute = !this.mute;
		writeSave(this.best, this.mute);
		this.emit();
	}
	start() {
		this.phase = "play";
		this.score = 0;
		this.lives = LIVES;
		this.combo = 0;
		this.apples = [];
		this.bits = [];
		this.floaters = [];
		this.trauma = 0;
		this.spawn = .15;
		this.hitstop = 0;
		this.emit();
	}
	pointer(x, y) {
		if (this.phase !== "play") {
			this.start();
			return;
		}
		let best = null;
		let bestD = Infinity;
		for (const apple of this.apples) {
			if (apple.phase !== "fall") continue;
			const dx = x - apple.x;
			const dy = y - apple.y;
			const dist = Math.hypot(dx, dy);
			if (dist <= apple.r * 1.15 && dist < bestD) {
				best = apple;
				bestD = dist;
			}
		}
		if (best) this.catch(best);
	}
	difficulty() {
		return Math.min(1, this.score / 280);
	}
	catch(apple) {
		apple.phase = "pop";
		apple.t = 0;
		apple.flash = 1;
		this.combo += 1;
		const mult = Math.min(8, this.combo);
		const pts = (apple.kind === "gold" ? 40 : 10) * mult;
		this.score += pts;
		if (this.score > this.best) {
			this.best = this.score;
			writeSave(this.best, this.mute);
		}
		this.hitstop = this.reduced ? 0 : .045;
		this.burst(apple.x, apple.y, apple.kind === "gold" ? PAL.gold : PAL.apple, 14);
		this.floaters.push({
			x: apple.x,
			y: apple.y - apple.r,
			text: `+${pts}`,
			life: .7,
			max: .7,
			gold: apple.kind === "gold" || mult > 1
		});
		playCue(apple.kind === "gold" ? "gold" : "catch", this.mute);
		this.emit();
	}
	miss(apple) {
		apple.phase = "splat";
		apple.t = 0;
		if (this.phase !== "play") return;
		this.combo = 0;
		this.lives -= 1;
		this.trauma = Math.min(1, this.trauma + (this.reduced ? 0 : .45));
		this.burst(apple.x, this.ground(), PAL.appleDark, 10);
		playCue("miss", this.mute);
		if (this.lives <= 0) {
			this.lives = 0;
			this.phase = "over";
			playCue("over", this.mute);
			writeSave(this.best, this.mute);
		}
		this.emit();
	}
	burst(x, y, color, n) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const sp = 40 + Math.random() * 180;
			this.bits.push({
				x,
				y,
				vx: Math.cos(a) * sp,
				vy: Math.sin(a) * sp - 40,
				life: .35 + Math.random() * .35,
				max: .7,
				color,
				r: 2 + Math.random() * 3.5
			});
		}
	}
	ground() {
		return this.height * .86;
	}
	spawnApple(ambient) {
		const d = ambient ? 0 : this.difficulty();
		const gold = !ambient && Math.random() < .08 + d * .05;
		const r = gold ? 22 + Math.random() * 6 : 26 + Math.random() * 12;
		const speed = (ambient ? 90 : 150 + d * 230) * (.82 + Math.random() * .36) * (gold ? 1.22 : 1);
		this.apples.push({
			id: this.nextId++,
			x: r + 12 + Math.random() * Math.max(20, this.width - r * 2 - 24),
			y: -r - 8,
			r,
			vy: speed,
			rot: Math.random() * Math.PI,
			spin: (Math.random() - .5) * 1.4,
			kind: gold ? "gold" : "red",
			phase: "fall",
			t: 0,
			flash: 0,
			sway: Math.random() * Math.PI * 2
		});
	}
	step(dt) {
		const capped = Math.min(dt, .05);
		this.time += capped;
		if (this.hitstop > 0) {
			this.hitstop -= capped;
			this.ageJuice(capped);
			return;
		}
		const playing = this.phase === "play";
		const d = this.difficulty();
		const interval = playing ? 1.05 - d * .68 : 1.35;
		this.spawn += capped;
		const cap = playing ? 9 : 4;
		if (this.spawn >= interval && this.apples.length < cap) {
			this.spawn = 0;
			this.spawnApple(!playing);
		}
		const ground = this.ground();
		for (const apple of this.apples) {
			apple.t += capped;
			apple.flash = Math.max(0, apple.flash - capped * 8);
			if (apple.phase === "fall") {
				apple.y += apple.vy * capped;
				apple.x += Math.sin(this.time * 1.3 + apple.sway) * 22 * capped;
				apple.rot += apple.spin * capped;
				const minX = apple.r;
				const maxX = this.width - apple.r;
				if (apple.x < minX) apple.x = minX;
				if (apple.x > maxX) apple.x = maxX;
				if (apple.y + apple.r * .35 >= ground) {
					if (playing) this.miss(apple);
					else {
						apple.phase = "splat";
						apple.t = 0;
					}
				}
			}
		}
		this.apples = this.apples.filter((apple) => {
			if (apple.phase === "pop") return apple.t < .22;
			if (apple.phase === "splat") return apple.t < .28;
			return true;
		});
		this.ageJuice(capped);
		this.trauma = Math.max(0, this.trauma - capped * (this.reduced ? 6 : 1.6));
		for (const cloud of this.clouds) {
			cloud.x += cloud.s * capped;
			if (cloud.x - cloud.w > this.width + 40) cloud.x = -cloud.w;
		}
	}
	ageJuice(dt) {
		for (const bit of this.bits) {
			bit.life -= dt;
			bit.x += bit.vx * dt;
			bit.y += bit.vy * dt;
			bit.vy += 420 * dt;
		}
		this.bits = this.bits.filter((bit) => bit.life > 0);
		for (const floater of this.floaters) {
			floater.life -= dt;
			floater.y -= 36 * dt;
		}
		this.floaters = this.floaters.filter((floater) => floater.life > 0);
	}
	draw(ctx) {
		const { width: w, height: h } = this;
		const shake = this.reduced ? 0 : this.trauma * this.trauma;
		const ox = shake * 12 * Math.sin(this.time * 46);
		const oy = shake * 8 * Math.cos(this.time * 37);
		ctx.clearRect(0, 0, w, h);
		ctx.save();
		ctx.translate(ox, oy);
		const sky = ctx.createLinearGradient(0, 0, 0, h);
		sky.addColorStop(0, PAL.skyTop);
		sky.addColorStop(.55, PAL.skyMid);
		sky.addColorStop(1, PAL.grass);
		ctx.fillStyle = sky;
		ctx.fillRect(-20, -20, w + 40, h + 40);
		ctx.fillStyle = PAL.sun;
		ctx.beginPath();
		ctx.arc(w * .78, h * .16, Math.min(54, w * .08), 0, Math.PI * 2);
		ctx.fill();
		for (const cloud of this.clouds) this.drawCloud(ctx, cloud);
		this.hill(ctx, h * .62, PAL.hillFar, .08);
		this.hill(ctx, h * .7, PAL.hillNear, .12);
		this.tree(ctx, w * .08, h * .78, .85);
		this.tree(ctx, w * .92, h * .8, 1);
		const ground = this.ground();
		ctx.fillStyle = PAL.grass;
		ctx.fillRect(-20, ground, w + 40, h - ground + 30);
		ctx.fillStyle = PAL.grassDark;
		ctx.fillRect(-20, ground, w + 40, 8);
		for (const apple of this.apples) this.drawApple(ctx, apple);
		for (const bit of this.bits) {
			ctx.globalAlpha = Math.max(0, bit.life / bit.max);
			ctx.fillStyle = bit.color;
			ctx.beginPath();
			ctx.arc(bit.x, bit.y, bit.r, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
		}
		ctx.font = "800 22px 'Nunito Sans', sans-serif";
		ctx.textAlign = "center";
		for (const floater of this.floaters) {
			ctx.globalAlpha = Math.max(0, floater.life / floater.max);
			ctx.fillStyle = floater.gold ? PAL.goldDark : PAL.ink;
			ctx.fillText(floater.text, floater.x, floater.y);
			ctx.globalAlpha = 1;
		}
		ctx.restore();
	}
	hill(ctx, y, color, amp) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(-20, this.height);
		ctx.lineTo(-20, y);
		const steps = 8;
		for (let i = 0; i <= steps; i++) {
			const x = (this.width + 40) * (i / steps) - 20;
			const wave = Math.sin(i * 1.3) * this.height * amp;
			ctx.lineTo(x, y + wave);
		}
		ctx.lineTo(this.width + 20, this.height);
		ctx.closePath();
		ctx.fill();
	}
	tree(ctx, x, y, scale) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale, scale);
		ctx.fillStyle = PAL.bark;
		ctx.fillRect(-10, -70, 20, 90);
		ctx.fillStyle = PAL.leaf;
		ctx.beginPath();
		ctx.arc(0, -100, 48, 0, Math.PI * 2);
		ctx.arc(-32, -72, 32, 0, Math.PI * 2);
		ctx.arc(34, -68, 30, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	drawCloud(ctx, cloud) {
		ctx.fillStyle = "rgba(246, 239, 226, 0.85)";
		const { x, y, w } = cloud;
		ctx.beginPath();
		ctx.ellipse(x, y, w * .45, w * .22, 0, 0, Math.PI * 2);
		ctx.ellipse(x - w * .28, y + 6, w * .28, w * .16, 0, 0, Math.PI * 2);
		ctx.ellipse(x + w * .26, y + 8, w * .3, w * .17, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	drawApple(ctx, apple) {
		let scaleX = 1;
		let scaleY = 1;
		let alpha = 1;
		if (apple.phase === "pop") {
			const k = apple.t / .22;
			scaleX = 1 + k * .45;
			scaleY = 1 + k * .45;
			alpha = 1 - k;
		} else if (apple.phase === "splat") {
			const k = apple.t / .28;
			scaleX = 1.35;
			scaleY = .45;
			alpha = 1 - k;
		} else {
			const stretch = 1 + Math.min(.12, apple.vy / 2800);
			scaleX = 1 / stretch;
			scaleY = stretch;
		}
		ctx.save();
		ctx.translate(apple.x, apple.y);
		ctx.rotate(apple.phase === "fall" ? apple.rot * .25 : 0);
		ctx.scale(scaleX, scaleY);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = "rgba(42, 33, 24, 0.16)";
		ctx.beginPath();
		ctx.ellipse(0, apple.r * .85, apple.r * .7, apple.r * .22, 0, 0, Math.PI * 2);
		ctx.fill();
		const gold = apple.kind === "gold";
		const grd = ctx.createRadialGradient(-apple.r * .3, -apple.r * .35, apple.r * .2, 0, 0, apple.r);
		grd.addColorStop(0, gold ? "#ffe7a0" : "#e86a4a");
		grd.addColorStop(.7, gold ? PAL.gold : PAL.apple);
		grd.addColorStop(1, gold ? PAL.goldDark : PAL.appleDark);
		ctx.fillStyle = grd;
		ctx.beginPath();
		ctx.arc(0, 0, apple.r, 0, Math.PI * 2);
		ctx.fill();
		if (apple.flash > 0) {
			ctx.fillStyle = `rgba(255,255,255,${apple.flash * .7})`;
			ctx.beginPath();
			ctx.arc(0, 0, apple.r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.fillStyle = "rgba(246, 239, 226, 0.55)";
		ctx.beginPath();
		ctx.ellipse(-apple.r * .32, -apple.r * .32, apple.r * .22, apple.r * .14, -.6, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = PAL.bark;
		ctx.lineWidth = Math.max(2, apple.r * .08);
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(0, -apple.r + 1);
		ctx.quadraticCurveTo(apple.r * .15, -apple.r - apple.r * .28, apple.r * .05, -apple.r - apple.r * .42);
		ctx.stroke();
		ctx.fillStyle = PAL.leaf;
		ctx.beginPath();
		ctx.ellipse(apple.r * .28, -apple.r - apple.r * .18, apple.r * .28, apple.r * .14, .8, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
};
function OrchardGame() {
	const canvasRef = (0, import_react.useRef)(null);
	const simRef = (0, import_react.useRef)(null);
	const [live, setLive] = (0, import_react.useState)(false);
	const [hud, setHud] = (0, import_react.useState)({
		phase: "ready",
		score: 0,
		best: 0,
		lives: LIVES,
		combo: 0,
		mute: false
	});
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const sim = new Orchard(setHud);
		simRef.current = sim;
		const fit = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.max(1, Math.round(rect.width * dpr));
			canvas.height = Math.max(1, Math.round(rect.height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			sim.resize(rect.width, rect.height);
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(canvas);
		const publish = () => {
			window.__orchard = {
				get phase() {
					return sim.phase;
				},
				get score() {
					return sim.score;
				},
				get lives() {
					return sim.lives;
				},
				get best() {
					return sim.best;
				},
				apples: () => sim.apples.filter((apple) => apple.phase === "fall").map((apple) => ({
					x: apple.x,
					y: apple.y,
					r: apple.r
				})),
				poke: (x, y) => {
					unlockAudio();
					sim.pointer(x, y);
				}
			};
		};
		publish();
		setLive(true);
		let last = performance.now();
		let frame = 0;
		const loop = (now) => {
			const dt = (now - last) / 1e3;
			last = now;
			sim.step(dt);
			sim.draw(ctx);
			publish();
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			delete window.__orchard;
			simRef.current = null;
		};
	}, []);
	const act = (fn) => {
		const sim = simRef.current;
		if (!sim) return;
		unlockAudio();
		fn(sim);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-cream text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				onPointerDown: (event) => {
					const canvas = canvasRef.current;
					if (!canvas) return;
					const rect = canvas.getBoundingClientRect();
					act((sim) => sim.pointer(event.clientX - rect.left, event.clientY - rect.top));
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl leading-none font-bold tracking-tight sm:text-5xl",
						children: hud.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm font-bold text-ink/80",
						children: ["Best ", hud.best]
					}),
					hud.phase === "play" && hud.combo > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 inline-flex rounded-full bg-gold px-3 py-1 text-sm font-extrabold text-ink",
						children: ["Combo ×", Math.min(8, hud.combo)]
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 rounded-full bg-cream/80 px-3 py-2",
						"aria-label": `${hud.lives} lives left`,
						children: Array.from({ length: LIVES }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-4 w-4 rounded-full ${index < hud.lives ? "bg-apple" : "bg-ink/15"}` }, index))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-ink shadow-sm",
						"aria-label": hud.mute ? "Unmute" : "Mute",
						onPointerDown: (event) => event.stopPropagation(),
						onClick: () => act((sim) => sim.toggleMute()),
						children: hud.mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 20 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 20 })
					})]
				})]
			}),
			hud.phase !== "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 grid place-items-center p-5",
				onClick: () => act((sim) => sim.start()),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "w-full max-w-sm rounded-card bg-cream/95 px-6 py-7 text-center shadow-lg",
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-extrabold tracking-widest text-leaf uppercase",
							children: "Picnic round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-2 text-5xl leading-none font-bold",
							children: "Orchard Drop"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-base leading-relaxed font-semibold text-ink/80",
							children: hud.phase === "over" ? "Three apples hit the grass. That round is done." : "Tap the falling apples before they reach the grass. Gold ones are worth more."
						}),
						hud.phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-display text-3xl font-bold",
							children: [hud.score, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-base font-sans font-bold text-ink/70",
								children: ["best ", hud.best]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm font-bold text-ink/70",
							children: ["Best on this device: ", hud.best]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-6 h-12 w-full rounded-full bg-apple text-base font-extrabold text-cream disabled:opacity-60",
							disabled: !live,
							onClick: () => act((sim) => sim.start()),
							children: hud.phase === "over" ? "Pick again" : "Start picking"
						})
					]
				})
			}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrchardGame, {});
}
//#endregion
export { Home as component };
