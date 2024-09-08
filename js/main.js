document.addEventListener('DOMContentLoaded', () => {
    Board.init();

    const addNoteBtn = document.getElementById('addNoteBtn');
    const connectBtn = document.getElementById('connectBtn');
    const toggleParallaxBtn = document.getElementById('toggleParallaxBtn');

    addNoteBtn.addEventListener('click', () => {
        const x = Math.random() * (window.innerWidth - 150) / Board.scale;
        const y = Math.random() * (window.innerHeight - 100) / Board.scale;
        Board.createNote(x, y);
    });

    connectBtn.addEventListener('click', () => {
        Board.isConnecting = !Board.isConnecting;
        connectBtn.textContent = Board.isConnecting ? "Verbindung abbrechen" : "Verbinden";
        Board.connectStart = null;
    });

    toggleParallaxBtn.addEventListener('click', () => {
        Board.toggleParallax();
        toggleParallaxBtn.textContent = Board.isParallaxActive ? "3D-Effekt: An" : "3D-Effekt: Aus";
    });

    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (Board.isParallaxActive && !ticking) {
            window.requestAnimationFrame(() => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 500;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 500;
                Board.container.style.transform = `rotateX(${2 + yAxis}deg) rotateY(${-3 + xAxis}deg)`;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Create initial notes
    Board.createNote(100, 100, "Verdächtiger A");
    Board.createNote(300, 200, "Tatort");

    Board.drawConnections();
});