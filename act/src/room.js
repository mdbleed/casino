console.log("room.js loaded");

const id = new URLSearchParams(window.location.search).get("id");
console.log("Room ID:", id);

const pool = document.getElementById('pool');
const handDiv = document.getElementById('hand');

function mkcard(jsonCard, playable) {
	let suit = suits[jsonCard.suit];
	let rank = convertRank(jsonCard.rank);
	let cardDiv = document.createElement("div");
	let playableClass = playable ? "playable" : "";
	cardDiv.className = `card ${suit.name} ${playableClass}`;
	cardDiv.id = `card-${jsonCard.id}`; // Ensure unique ID using card's ID
	cardDiv.innerHTML = `${rank}${suit.sym}`;
	return cardDiv;
}

/* refresh the page content using /end/room.gw to get the room data
 * this is expensive for the server so only call when you need it */
function refresh() {
	fetch(`/end/room.gw?id=${id}`)
		.then(res => {
			if (!res.ok) {
				throw new Error(`Network response was not ok: ${res.statusText}`);
			}
			return res.json();
		})
		.then(jsn => {
			console.log('Received JSON:', jsn);
			if (jsn["status"] !== "OK") {
				throw new Error(`/end/room.gw threw error ${jsn.error}`);
			}
	
			document.getElementById("heading").textContent = jsn.room.name;

			/* if we're waiting for another player, show the join link */
			let join = `/join.gw?id=${jsn.room.id}`;
			console.log("game status: ", jsn.game["status"]);
			document.getElementById("join").innerHTML =
				jsn.game["status"] === "need_player"
				? `join link: <a href="${join}">http://casino.badboy.institute${join}</a>`
				: "";

			/* clear the div so we can append to it */
			handDiv.innerHTML = '';

			/* 
			 * set up the cards
			 */
			jsn.hand.forEach((card, i) => handDiv.appendChild(mkcard(card, true)));
			jsn.pool.forEach((stack, i) => {
				stack.forEach((card, i) => pool.appendChild(mkcard(card, false)));
			});

			let playableCards = handDiv.querySelectorAll('.playable');
			playableCards.forEach((card) => {
				card.addEventListener('click', (e) => {
					e.preventDefault();
					let cardId = card.id;
					console.log(`Card clicked: ${cardId}`);
					// Show list of link with valid plays for this card (i.e. Add to pool is always ok)
					//validmoves is a list of objects, with a action and a title
					validMoves = [{ action: 'addtopool', title: 'Add to Pool' }];
					// Check if the card can be played on any of the stacks, can play if cardrank is equal
					jsn.pool.forEach((stack, i) => {
						if (stack.length > 0) {
							let topCard = stack[stack.length - 1];
							if (card.rank === topCard.rank) {
								validMoves.push({ action: 'addtostack', title: `Match with ${topCard}` });
							}
						}
					});
					let moveList = document.createElement('ul');
					moveList.className = 'move-list';
					validMoves.forEach((move) => {
						let moveItem = document.createElement('li');
						// Create a link for each valid move
						let moveLink = document.createElement('a');
						moveLink.href = '/act/move.gw?action=' + move.action + '&card=' + cardId;
						moveLink.textContent = move.title;
						moveLink.dataset.cardId = cardId; // Store the card ID in the link
						moveItem.appendChild(moveLink);
						moveList.appendChild(moveItem);
					});
					// Append the move list to the card
					card.appendChild(moveList);
					// Add event listener to each move item
					moveList.addEventListener('click', (e) => {
						e.preventDefault();
						let move = e.target.textContent;
						console.log(`Move selected: ${move}`);
						// Perform the move using the playcard function
						playcard(e);
					});
					// Hide the move list when clicking outside
					document.addEventListener('click', (e) => {
						if (!card.contains(e.target)) {
							moveList.remove();
						}
					});
				});
			});
		})
		.catch(err => {
			console.error(`Error fetching room data: ${err}`);
		});
}

/* check and update the last_status variable */
function checkStatus() {
	fetch(`/end/status.gw?id=${id}`)
		.then(res => res.json())
		.then(jsn => {
			if (jsn["status"] === "error") throw Err(`${jsn.message}`);
			let s = jsn.game_status;
			if (last_status !== s) {
				refresh();
				last_status = s;
			}
		})
		.catch(err => {
			console.error(`Error fetching status: ${err}`);
		});
}

function playcard(e) {
	e.preventDefault();
	console.log(e);
	const cardId = e.target.dataset.cardId; // Get the card ID from the clicked link
	const action = e.target.href.split('action=')[1]; // Get the action from the link
	console.log(`Action: ${action}`);
	const card = document.getElementById(cardId);
	if (action === 'addtopool') {
		pool.appendChild(card); // Move card to pool
		card.classList.remove('hidden');
		pool.classList.remove('highlight');	
	} else if (action === 'addtostack') {
		//addToStack(cardId);
	} else {
		console.error(`Unknown action: ${action}`);
	}

	fetch("/act/move.gw", {
		method: "POST",
		body: JSON.stringify({
			card: cardId,
			on: 'pool',
		})
	})
	.then((res) => res.json())
	.then((jsn) => console.log(jsn))
	.then(() => {
		//add message to div id "message" "Waiting for other player..."
		let messageDiv = document.getElementById("message");
		messageDiv.innerHTML = "Waiting for other player...";	
	});
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

let last_status = 'need_player';

refresh();
setInterval(checkStatus, 5000);

