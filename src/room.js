console.log("room.js loaded");

function moveCard(cardElement) {
    // Get the pile element
    const pile = document.getElementById('pile');

    // Remove the card from the player's hand
    cardElement.parentNode.removeChild(cardElement);

    // Add the card to the pile
    pile.appendChild(cardElement);
}

let GET = new URLSearchParams(window.location.search);
let id = GET.get("id");

let room = fetch(`/end/room.gw?id=${id}`)
	.then((res) => res.json())
	.then((jsn) => {
		console.log(jsn);
	})
	.catch((err) => console.log(`error fetching room data: ${err}`));
