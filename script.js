const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: 0,
    maxZoom: 2,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    zoomSnap: 0,
    scrollWheelZoom: true,
    zoomDelta: 0,
    wheelPxPerZoomLevel: 100,
    maxBoundsViscosity: 1
});

let imageUrl = 'afd.jpeg';
let img = new Image();
let mapWidth, mapHeight, bounds;
let clickableAreas = [];
let currentPopup = null;
let isUpdatingRectangles = false;
let popupJustOpened = false;

img.onload = function() {
    const imgWidth = this.width;
    const imgHeight = this.height;
    const aspectRatio = imgWidth / imgHeight;

    if (window.innerWidth / window.innerHeight > aspectRatio) {
        mapWidth = window.innerWidth;
        mapHeight = mapWidth / aspectRatio;
    } else {
        mapHeight = window.innerHeight;
        mapWidth = mapHeight * aspectRatio;
    }

    bounds = [[0, 0], [mapHeight, mapWidth]];
    focusbounds = [[0, 0], [mapHeight+200, mapWidth]];
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);
    L.imageOverlay(imageUrl, bounds).addTo(map);
    fetch('content.json')
        .then(response => response.json())
        .then(data => {
            clickableAreas = [
                {
                    bounds: [[0.73, 0.263], [0.78, 0.303]],
                    title: data.einprozent.title,
                    content: data.einprozent.content
                },
                {
                    bounds: [[0.745, 0.385], [0.8, 0.425]],
                    title: data.destiftung.title,
                    content: data.destiftung.content
                },
                {
                    bounds: [[0.65, 0.335], [0.7, 0.375]],
                    title: data.compact.title,
                    content: data.compact.content
                }
            ];
            updateRectangles();
        })
        .catch(error => console.error('Error loading content:', error));

    setupControls();
};
img.src = imageUrl;

function updateRectangles() {
    if (isUpdatingRectangles) return;
    isUpdatingRectangles = true;

    map.eachLayer(layer => {
        if (layer instanceof L.Rectangle) {
            map.removeLayer(layer);
        }
    });

    clickableAreas.forEach(area => {
        const pixelBounds = [
            [area.bounds[0][0] * mapHeight, area.bounds[0][1] * mapWidth],
            [area.bounds[1][0] * mapHeight, area.bounds[1][1] * mapWidth]
        ];

        const rectangle = L.rectangle(pixelBounds, {
            color: 'rgba(0,0,0,0)',
            fillColor: 'rgba(255,255,255,0.1)',
            weight: 1
        }).addTo(map);

        const popupContent = `
            <div class="info-card">
                <span class="close-btn">×</span>
                <h2>${area.title}</h2>
                <p>${area.content}</p>
            </div>
        `;

        rectangle.on('click', function(e) {
            if (currentPopup) {
                map.closePopup(currentPopup);
                currentPopup = null;
            }
            else {
                currentPopup = L.popup({
                    closeButton: false,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'custom-popup'
                })
                    .setLatLng(e.latlng)
                    .setContent(popupContent)
                    .openOn(map);

                gsap.from(currentPopup._container, {duration: 0.5, scale: 0.5, opacity: 0, ease: "back.out(1.7)"});

                popupJustOpened = true;
                setTimeout(() => {
                    popupJustOpened = false;
                }, 100);

                e.originalEvent.stopPropagation();
            }
        });

        rectangle.on('mouseover', function (e) {
            this.setStyle({
                fillColor: 'rgba(255,255,255,0.1)'
            });
        });

        rectangle.on('mouseout', function (e) {
            this.setStyle({
                fillColor: 'rgba(255,255,255,0.3)'
            });
        });
    });

    isUpdatingRectangles = false;
}

function setupControls() {
    console.log("Running setupControls");
    map.dragging.enable();

    const originalOnDragStart = map.dragging._onDragStart;
    map.dragging._onDragStart = function(e) {
        if (e.originalEvent.button === 2 && map.getZoom() > map.getMinZoom()) {
            originalOnDragStart.call(this, e);
        }
    };

    map.getContainer().addEventListener('contextmenu', (e) => e.preventDefault());

    function checkZoomLevel() {
        /*if (map.getZoom() <= map.getMinZoom()+0.1) {
            map.flyToBounds(focusbounds, {
                duration: 1,
                easeLinearity: 0.5
            });
        }*/
    }

    map.on('zoomend', checkZoomLevel);

    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });

    map.on('zoomend dragend', function() {
        updateRectangles();
    });
}

document.addEventListener('click', function(e) {
    if (popupJustOpened) return;

    if (currentPopup && currentPopup.isOpen()) {
        const popupElement = currentPopup.getElement();
        if (popupElement && !popupElement.contains(e.target)) {
            map.closePopup(currentPopup);
            currentPopup = null;
        }
    }
});

// Event-Listener für den Schließen-Button
document.addEventListener('click', function(e) {
    if(e.target.classList.contains('close-btn')) {
        if (currentPopup && currentPopup.isOpen()) {
            map.closePopup(currentPopup);
            currentPopup = null;
        }
    }
});

document.getElementById('reset-btn').addEventListener('click', function() {
    map.fitBounds(bounds);
});