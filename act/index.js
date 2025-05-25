/* dynamically import src file f */
let dyn_include = (f) => {
	let head = document.getElementsByTagName("head")[0];
	let tag = document.createElement("script");
	tag.src = f;
	tag.type = "application/javascript";
	head.appendChild(tag);
};

switch (location.pathname) {
case "/room.gw": 
		dyn_include("/src/room.js");
}
