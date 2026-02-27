export function initTreeJS(window: any) {
    function random(min: number, max: number) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function bezier(cp: any, t: number) {
        const p1 = cp[0].mul((1 - t) * (1 - t));
        const p2 = cp[1].mul(2 * t * (1 - t));
        const p3 = cp[2].mul(t * t);
        return p1.add(p2).add(p3);
    }

    function inheart(x: number, y: number, r: number) {
        const z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) - (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
        return z < 0;
    }

    const Point = function (this: any, x: number, y: number) {
        this.x = x || 0;
        this.y = y || 0;
    } as any;

    Point.prototype = {
        clone: function () { return new Point(this.x, this.y); },
        add: function (o: any) { const p = this.clone(); p.x += o.x; p.y += o.y; return p; },
        sub: function (o: any) { const p = this.clone(); p.x -= o.x; p.y -= o.y; return p; },
        div: function (n: number) { const p = this.clone(); p.x /= n; p.y /= n; return p; },
        mul: function (n: number) { const p = this.clone(); p.x *= n; p.y *= n; return p; }
    };

    const Heart = function (this: any) {
        const points = [];
        let x, y, t;
        for (let i = 10; i < 30; i += 0.2) {
            t = i / Math.PI;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
    } as any;

    Heart.prototype = {
        get: function (i: number, scale: number) { return this.points[i].mul(scale || 1); }
    };

    const Seed = function (this: any, tree: any, point: any, scale: number, color: string) {
        this.tree = tree;
        this.heart = {
            point: point, scale: scale || 1, color: color || '#FF0000', figure: new Heart(),
        };
        this.cirle = {
            point: point, scale: scale || 1, color: color || '#FF0000', radius: 5,
        };
    } as any;

    Seed.prototype = {
        draw: function () { this.drawHeart(); this.drawText(); },
        addPosition: function (x: number, y: number) { this.cirle.point = this.cirle.point.add(new Point(x, y)); },
        canMove: function () { return this.cirle.point.y < (this.tree.height + 20); },
        move: function (x: number, y: number) { this.clear(); this.drawCirle(); this.addPosition(x, y); },
        canScale: function () { return this.heart.scale > 0.2; },
        setHeartScale: function (scale: number) { this.heart.scale *= scale; },
        scale: function (scale: number) { this.clear(); this.drawCirle(); this.drawHeart(); this.setHeartScale(scale); },
        drawHeart: function () {
            const ctx = this.tree.ctx; const heart = this.heart;
            const point = heart.point; const color = heart.color; const scale = heart.scale;
            ctx.save(); ctx.fillStyle = color; ctx.translate(point.x, point.y); ctx.beginPath(); ctx.moveTo(0, 0);
            for (let i = 0; i < heart.figure.length; i++) {
                const p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath(); ctx.fill(); ctx.restore();
        },
        drawCirle: function () {
            const ctx = this.tree.ctx; const cirle = this.cirle;
            const point = cirle.point; const color = cirle.color; const scale = cirle.scale; const radius = cirle.radius;
            ctx.save(); ctx.fillStyle = color; ctx.translate(point.x, point.y); ctx.scale(scale, scale); ctx.beginPath(); ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, 0, 2 * Math.PI); ctx.closePath(); ctx.fill(); ctx.restore();
        },
        drawText: function () {
            // Replaced generic 'Come baby' text, instead relying strictly on hearts/visuals or drawing 'sorry'
            const ctx = this.tree.ctx; const heart = this.heart;
            const point = heart.point; const color = heart.color; const scale = heart.scale;
            ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.translate(point.x, point.y); ctx.scale(scale, scale);
            ctx.moveTo(0, 0); ctx.lineTo(15, 15); ctx.lineTo(60, 15); ctx.stroke();
            ctx.moveTo(0, 0); ctx.scale(0.75, 0.75); ctx.font = "14px 'Nunito', sans-serif";
            ctx.fillText("I'm Sorry 🥺", 23, 10); ctx.restore();
        },
        clear: function () {
            const ctx = this.tree.ctx; const cirle = this.cirle;
            const point = cirle.point; const scale = cirle.scale; const radius = 26;
            const w = (radius * scale); const h = w;
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function (x: number, y: number) {
            const ctx = this.tree.ctx;
            const pixel = ctx.getImageData(x, y, 1, 1);
            return pixel.data[3] === 255;
        }
    };

    const Footer = function (this: any, tree: any, width: number, height: number, speed: number) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width; this.height = height; this.speed = speed || 2; this.length = 0;
    } as any;

    Footer.prototype = {
        draw: function () {
            const ctx = this.tree.ctx; const point = this.point;
            const len = this.length / 2;
            ctx.save(); ctx.strokeStyle = 'rgb(35, 31, 32)'; ctx.lineWidth = this.height; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.translate(point.x, point.y); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.lineTo(-len, 0); ctx.stroke(); ctx.restore();
            if (this.length < this.width) { this.length += this.speed; }
        }
    };

    const Tree = function (this: any, canvas: HTMLCanvasElement, width: number, height: number, opt: any) {
        this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.width = width; this.height = height; this.opt = opt || {};
        this.record = {};
        this.initSeed(); this.initFooter(); this.initBranch(); this.initBloom();
    } as any;

    Tree.prototype = {
        initSeed: function () {
            const seed = this.opt.seed || {};
            const x = seed.x || this.width / 2;
            const y = seed.y || this.height / 2;
            const point = new Point(x, y);
            const color = seed.color || '#FF0000';
            const scale = seed.scale || 1;
            this.seed = new Seed(this, point, scale, color);
        },
        initFooter: function () {
            const footer = this.opt.footer || {};
            const width = footer.width || this.width;
            const height = footer.height || 5;
            const speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        },
        initBranch: function () {
            const branchs = this.opt.branch || [];
            this.branchs = [];
            this.addBranchs(branchs);
        },
        initBloom: function () {
            const bloom = this.opt.bloom || {};
            const cache = [];
            const num = bloom.num || 500;
            const width = bloom.width || this.width;
            const height = bloom.height || this.height;
            const figure = this.seed.heart.figure;
            const r = 240;
            for (let i = 0; i < num; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },
        toDataURL: function (type: string) { return this.canvas.toDataURL(type); },
        draw: function (k: string) {
            const s = this; const ctx = s.ctx; const rec = s.record[k];
            if (!rec) return;
            const point = rec.point; const image = rec.image;
            ctx.save(); ctx.putImageData(image, point.x, point.y); ctx.restore();
        },
        addBranch: function (branch: any) { this.branchs.push(branch); },
        addBranchs: function (branchs: any) {
            const s = this; let b, p1, p2, p3, r, l, c;
            for (let i = 0; i < branchs.length; i++) {
                b = branchs[i]; p1 = new Point(b[0], b[1]); p2 = new Point(b[2], b[3]); p3 = new Point(b[4], b[5]);
                r = b[6]; l = b[7]; c = b[8];
                s.addBranch(new Branch(s, p1, p2, p3, r, l, c));
            }
        },
        removeBranch: function (branch: any) {
            const branchs = this.branchs;
            for (let i = 0; i < branchs.length; i++) { if (branchs[i] === branch) { branchs.splice(i, 1); } }
        },
        canGrow: function () { return !!this.branchs.length; },
        grow: function () {
            const branchs = this.branchs;
            for (let i = 0; i < branchs.length; i++) {
                const branch = branchs[i];
                if (branch) { branch.grow(); }
            }
        },
        addBloom: function (bloom: any) { this.blooms.push(bloom); },
        removeBloom: function (bloom: any) {
            const blooms = this.blooms;
            for (let i = 0; i < blooms.length; i++) { if (blooms[i] === bloom) { blooms.splice(i, 1); } }
        },
        createBloom: function (width: number, height: number, radius: number, figure: any, color?: string, alpha?: number, angle?: number, scale?: number, place?: any, speed?: number) {
            let x, y;
            while (true) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
                }
            }
        },
        canFlower: function () { return !!this.blooms.length; },
        flower: function (num: number) {
            const s = this; let blooms = s.bloomsCache.splice(0, num);
            for (let i = 0; i < blooms.length; i++) { s.addBloom(blooms[i]); }
            blooms = s.blooms;
            for (let j = 0; j < blooms.length; j++) { blooms[j].flower(); }
        },
        snapshot: function (k: string, x: number, y: number, width: number, height: number) {
            const ctx = this.ctx;
            const image = ctx.getImageData(x, y, width, height);
            this.record[k] = { image: image, point: new Point(x, y), width: width, height: height };
        },
        setSpeed: function (k: string, speed: number) { this.record[k || "move"].speed = speed; },
        move: function (k: string, x: number, y: number) {
            const s = this; const ctx = s.ctx; const rec = s.record[k || "move"];
            const point = rec.point; const image = rec.image; const speed = rec.speed || 10;
            const width = rec.width; const height = rec.height;
            let i = point.x + speed < x ? point.x + speed : x;
            let j = point.y + speed < y ? point.y + speed : y;
            ctx.save(); ctx.clearRect(point.x, point.y, width, height); ctx.putImageData(image, i, j); ctx.restore();
            rec.point = new Point(i, j); rec.speed = speed * 0.95;
            if (rec.speed < 2) { rec.speed = 2; }
            return i < x || j < y;
        },
        jump: function () {
            const s = this; const blooms = s.blooms;
            if (blooms.length) { for (let i = 0; i < blooms.length; i++) { blooms[i].jump(); } }
            if ((blooms.length && blooms.length < 3) || !blooms.length) {
                const width = this.width; const height = this.height; const figure = this.seed.heart.figure; const r = 240;
                for (let i = 0; i < random(1, 2); i++) {
                    blooms.push(this.createBloom(width / 2 + width, height, r, figure, undefined, 1, undefined, 1, new Point(random(-100, 600), 720), random(200, 300)));
                }
            }
        }
    };

    const Branch = function (this: any, tree: any, point1: any, point2: any, point3: any, radius: number, length: number, branchs: any) {
        this.tree = tree; this.point1 = point1; this.point2 = point2; this.point3 = point3;
        this.radius = radius; this.length = length || 100; this.len = 0; this.t = 1 / (this.length - 1); this.branchs = branchs || [];
    } as any;

    Branch.prototype = {
        grow: function () {
            const s = this; let p;
            if (s.len <= s.length) {
                p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
                s.draw(p); s.len += 1; s.radius *= 0.97;
            } else {
                s.tree.removeBranch(s); s.tree.addBranchs(s.branchs);
            }
        },
        draw: function (p: any) {
            const s = this; const ctx = s.tree.ctx;
            ctx.save(); ctx.beginPath(); ctx.fillStyle = 'rgb(35, 31, 32)'; ctx.shadowColor = 'rgb(35, 31, 32)'; ctx.shadowBlur = 2;
            ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI); ctx.closePath(); ctx.fill(); ctx.restore();
        }
    };

    const Bloom = function (this: any, tree: any, point: any, figure: any, color: string, alpha: number, angle: number, scale: number, place: any, speed: number) {
        this.tree = tree; this.point = point; this.color = color || 'rgb(255,' + random(0, 255) + ',' + random(0, 255) + ')';
        this.alpha = alpha || random(0.3, 1); this.angle = angle || random(0, 360); this.scale = scale || 0.1;
        this.place = place; this.speed = speed; this.figure = figure;
    } as any;

    Bloom.prototype = {
        setFigure: function (figure: any) { this.figure = figure; },
        flower: function () {
            const s = this; s.draw(); s.scale += 0.1;
            if (s.scale > 1) { s.tree.removeBloom(s); }
        },
        draw: function () {
            const s = this; const ctx = s.tree.ctx;
            ctx.save(); ctx.fillStyle = s.color; ctx.globalAlpha = s.alpha; ctx.translate(s.point.x, s.point.y);
            ctx.scale(s.scale, s.scale); ctx.rotate(s.angle);

            // Draw "sorry" instead of a polygon petal to fulfill the "1000x sorry in a heart shape" requirement
            ctx.font = "bold 12px 'Nunito', sans-serif";
            ctx.fillText("sorry", -10, 5);
            ctx.restore();
        },
        jump: function () {
            const s = this; const height = s.tree.height;
            if (s.point.x < -20 || s.point.y > height + 20) {
                s.tree.removeBloom(s);
            } else {
                s.draw(); s.point = s.place.sub(s.point).div(s.speed).add(s.point); s.angle += 0.05; s.speed -= 1;
            }
        }
    };

    window.random = random;
    window.bezier = bezier;
    window.Point = Point;
    window.Tree = Tree;
}
