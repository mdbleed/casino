console.log("room.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    const id = new URLSearchParams(window.location.search).get("id");
    console.log("Room ID:", id);

    if (!id) {
        console.error("ID not found in query string");
        return;
    }
    const pool = document.getElementById('pool');
    const handDiv = document.getElementById('hand');

    if (!handDiv || !pool) {
        console.error('handDiv or pool element not found in DOM');
        return;
    }

    fetch(`/end/room.gw?id=${id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Network response was not ok: ${res.statusText}`);
            }
            return res.json();
        })
        .then(jsn => {
            console.log('Received JSON:', jsn);
            document.getElementById("heading").textContent = jsn.room.name;

            jsn.hand1.forEach((cardData, index) => {
                let suit = suits[cardData.suit];
                let rank = convertRank(cardData.rank);

                let cardDiv = document.createElement("div");
                cardDiv.className = `card ${suit.name}`;
                cardDiv.id = `card-${cardData.id}`; // Ensure unique ID using card's ID
                cardDiv.draggable = true; // Enable draggable
                cardDiv.innerHTML = `${rank}${suit.sym}`;
                cardDiv.addEventListener('dragstart', dragStart);
                console.log('Created card:', cardDiv);
                handDiv.appendChild(cardDiv);
            });

            pool.addEventListener('dragover', dragOver);
            pool.addEventListener('dragenter', dragEnter);
            pool.addEventListener('dragleave', dragLeave);
            pool.addEventListener('drop', drop);
        })
        .catch(err => {
            console.error(`Error fetching room data: ${err}`);
        });
});

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.classList.add('hidden'); // Visual feedback while dragging
    }, 0);
}

function dragOver(e) {
    e.preventDefault(); // Allows drop
}

function dragEnter(e) {
    e.preventDefault();
    pool.classList.add('highlight'); // Add highlight
}

function dragLeave() {
    pool.classList.remove('highlight'); // Remove highlight
}

function drop(e) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);
    pool.appendChild(card); // Move card to pool
    card.classList.remove('hidden');
    pool.classList.remove('highlight');
}

function convertRank(rank) {
    const rankMap = {
        1: 'A',
        11: 'J',
        12: 'Q',
        13: 'K'
    };
    return rankMap[rank] || rank; // Return converted rank or original if not mapped
}

const suits = {
    "C": { name: "clubs", sym: "&#9827;" },
    "S": { name: "spades", sym: "&#9824;" },
    "H": { name: "hearts", sym: "&#9825;" },
    "D": { name: "diamonds", sym: "&#9826;" }
};
