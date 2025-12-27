// 7TV Badge Viewer Script

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const badgeID = urlParams.get('badgeID');
    const helpElement = document.getElementById('help');
    if (!badgeID) {
        helpElement.style.display = 'flex';
        return { badgeID: null };
    }
    return { badgeID };
}

function getBadge() {
    const { badgeID } = getUrlParams();

    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const badgeDisplayElement = document.getElementById('badge-display');
    const badgeElement = document.getElementById('badge-image');
    const badgeName = document.getElementById('badge-name');

    if (!badgeID) {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        badgeDisplayElement.style.display = 'none';
        badgeElement.style.display = 'none';
        document.title = `7TV Database │ Badge Viewer`;
        return;
    }

    loadingElement.style.display = 'flex';
    errorElement.style.display = 'none';
    badgeDisplayElement.style.display = 'none';
    document.title = `7TV Database │ Loading Badge...`;

    const query = `
        query Paints {
            badges {
                badges {
                    id
                    name
                    description
                    images {
                        url 
                        mime
                        size
                        scale
                        width
                        height
                        frameCount
                    }
                }
            }
        }
    `;

    fetch('https://7tv.io/v4/gql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query: query }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.badges && data.data.badges.badges) {
                const badgeData = data.data.badges.badges.find(badge => badge.id === badgeID);
                if (badgeData) {
                    console.log(`Badge Daten für ${badgeData.name} ID: ${badgeID} ->`);
                    console.log(JSON.stringify(badgeData, null, 2));

                    if (badgeElement && badgeName) {
                        badgeName.textContent = badgeData.name;
                        document.title = `7TV Database │ ${badgeData.name}`;
                        badgeElement.src = `https://cdn.7tv.app/badge/${badgeID}/4x.avif`;
                        badgeElement.style.display = "block";
                        badgeDisplayElement.style.display = "block";
                    }
                } else {
                    console.error('Keine Badge Daten gefunden für ID:', badgeID);
                    showError();
                }
            } else {
                console.error('Keine Badge Daten gefunden');
                showError();
            }
        })
        .catch(error => {
            console.error('getBadge | Fehler beim Fetchen der Badges', error);
            showError();
        })
        .finally(() => {
            loadingElement.style.display = 'none';
        });

    function showError() {
        errorElement.style.display = 'flex';
        if (badgeID) {
            badgeName.textContent = `ID: ${badgeID}`;
        }
        document.title = `7TV Database │ Badge nicht gefunden`;
    }
}

// Initialize on page load
getBadge();

// Add event listeners for the input field and button
document.addEventListener('DOMContentLoaded', function () {
    const badgeInput = document.getElementById('badge-id-input');
    const loadButton = document.getElementById('load-badge-btn');

    if (loadButton) {
        loadButton.addEventListener('click', function () {
            const badgeID = badgeInput?.value.trim();
            if (badgeID) {
                window.location.href = `badge.html?badgeID=${badgeID}`;
            }
        });
    }

    if (badgeInput) {
        badgeInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const badgeID = badgeInput.value.trim();
                if (badgeID) {
                    window.location.href = `badge.html?badgeID=${badgeID}`;
                }
            }
        });
    }
});

