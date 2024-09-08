class Board {
    static init() {
        this.container = document.getElementById('container');
        this.element = document.getElementById('board');
        this.canvas = document.getElementById('threadCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.notes = [];
        this.connections = [];
        this.isConnecting = false;
        this.connectStart = null;
        this.isParallaxActive = false;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.draggedElement = null;

        this.setupEventListeners();
    }

    static setupEventListeners() {
        this.element.addEventListener('wheel', this.handleWheel.bind(this));
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    static createNote(x, y, text) {
        const note = new Note(x, y, text);
        this.element.appendChild(note.element);
        this.notes.push(note);
        return note;
    }

    static startDragging(element, e) {
        this.draggedElement = element;
        const rect = element.getBoundingClientRect();
        this.offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    static handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            this.translateX += deltaX;
            this.translateY += deltaY;

            this.element.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
            this.drawConnections();

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        } else if (this.draggedElement) {
            const x = (e.clientX - this.offset.x - this.translateX) / this.scale;
            const y = (e.clientY - this.offset.y - this.translateY) / this.scale;
            this.draggedElement.style.left = x + 'px';
            this.draggedElement.style.top = y + 'px';
            this.drawConnections();
        }
    }

    static handleMouseDown(e) {
        if (e.button === 2) { // Right mouse button
            e.preventDefault();
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }

    static handleMouseUp(e) {
        if (this.draggedElement) {
            this.draggedElement = null;
        }
        this.isDragging = false;
    }

    static handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY;
        const scaleFactor = 0.95;
        const newScale = delta > 0 ? this.scale * scaleFactor : this.scale / scaleFactor;

        if (newScale > 0.1 && newScale < 5) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const distX = mouseX - this.translateX;
            const distY = mouseY - this.translateY;

            this.translateX = mouseX - distX * (newScale / this.scale);
            this.translateY = mouseY - distY * (newScale / this.scale);

            this.scale = newScale;

            this.element.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
            this.drawConnections();
        }
    }

    static handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drawConnections();
    }

    static drawConnections() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);
        for (let [start, end] of this.connections) {
            this.drawThread(start, end);
        }
        this.ctx.restore();
    }

    static drawThread(start, end) {
        const startX = parseFloat(start.style.left) + start.offsetWidth / 2;
        const startY = parseFloat(start.style.top);
        const endX = parseFloat(end.style.left) + end.offsetWidth / 2;
        const endY = parseFloat(end.style.top);

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);

        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const sag = distance * 0.1;

        const ctrl1X = startX + (endX - startX) / 3;
        const ctrl1Y = Math.max(startY, endY) + sag;
        const ctrl2X = startX + 2 * (endX - startX) / 3;
        const ctrl2Y = Math.max(startY, endY) + sag;

        this.ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
        
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)';
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.stroke();
    }

    static toggleParallax() {
        this.isParallaxActive = !this.isParallaxActive;
        if (!this.isParallaxActive) {
            this.container.style.transform = 'none';
        }
    }
}