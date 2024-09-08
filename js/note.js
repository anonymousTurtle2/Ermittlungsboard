class Note {
    constructor(x, y, text = "Neue Notiz") {
        this.element = document.createElement('div');
        this.element.className = 'note';
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.innerHTML = `<div class="pin"></div><p contenteditable="true">${text}</p>`;
        this.element.addEventListener('mousedown', this.startDragging.bind(this));
        this.element.addEventListener('dragstart', (e) => e.preventDefault());
    }

    startDragging(e) {
        if (e.target.tagName === 'P') return;
        Board.startDragging(this.element, e);
    }
}