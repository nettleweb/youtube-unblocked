"use strict";

(() => {
// load api key
gapi.load("client", () => {
	gapi.client.setApiKey("AIzaSyBqQGSeJZUdI0itB4t-UW21-DOv3Ae1cAk");
	gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(() => console.log("GAPI client loaded for API"), (err) => {
			console.log(err);
			alert("Failed to load GAPI client for API. Use the developer console to get error details.", "Error", "error.png");
		});
});

let cWidth = document.body.clientWidth;
let resultContainer = document.getElementById("result-container");
let resultElement = document.getElementsByClassName("result")[0];
let textInput = document.getElementById("text-input");
let searchButton = document.getElementById("search-button");
let optionMaxResults = document.getElementById("option-max-results");
let optionOrder = document.getElementById("option-order");

// correct display
if (cWidth < 800) {
	resultContainer.style.width = "100%";
	if (cWidth < 500) {
		document.getElementById("container").style.width = "100%";
		if (cWidth < 400) {
			let logo = document.getElementById("logo");
			logo.style.width = "100%";
			logo.style.height = logo.clientWidth / 4 * 3;
		}
	}
}

searchButton.onclick = () => run();
textInput.onkeydown = (e) => {
	if (e.keyCode == 13) // enter
		run();
};

function correctNumberRange(element, def, min, max) {
	let val = element.value;
	if (val == null || val == "")
		return element.value = def.toString();

	let nVal = parseInt(val);
	if (nVal < min)
		return element.value = min.toString();
	else if (nVal > max)
		return element.value = max.toString();
	else return element.value;
}

function run() {
	resultContainer.innerHTML = "";
	let input = textInput.value;
	let maxResults = correctNumberRange(optionMaxResults, 10, 1, 50);
	let order = optionOrder.value;
	search(input, maxResults, order);
}

function createVideoFrame(id) {
	let frame = document.createElement("iframe");
	frame.style.position = "absolute";
	frame.style.display = "block";
	frame.style.width = "100%";
	frame.style.height = "100%";
	frame.style.border = "none";
	frame.setAttribute("allowfullscreen", "true");
	frame.setAttribute("loading", "lazy");
	frame.setAttribute("scrolling", "no");
	frame.onload = () => {
		let url = new URL("https://www.youtube.com/embed/" + id);
		let win = frame.contentWindow;
		if (win.location.href != url.href)
			win.location = url;
		Object.freeze(win.location);
		frame.onload = null;
	};
	return frame;
}

function search(query, limit, order) {
	let params = {
		"part": "snippet",
		"type": "video",
		"order": order,
		"maxResults": limit,
		"q": query
	};

	try {
		gapi.client.youtube.search.list(params).then((result) => {
			let r = [];
			try {
				r = result.result.items;
			} catch(err) {
				console.log(err);
				alert("Failed to fetch search results. Use the developer console to get error details.", "Error");
			}
			r.forEach((e, i) => {
				let id = e.id.videoId;
				let title = e.snippet.title;
				let description = e.snippet.description;
				let publishTime = e.snippet.publishTime;
				let thumbnail = e.snippet.thumbnails.medium;
				let node = resultElement.cloneNode(true);
				node.getElementsByClassName("result-preview")[0].src = thumbnail.url;
				node.getElementsByClassName("result-title")[0].innerHTML = title;
				node.getElementsByClassName("result-description")[0].innerHTML = description;
				node.getElementsByClassName("result-publish-time")[0].innerHTML = publishTime;
				node.getElementsByClassName("result-item")[0].onclick = (e) => {
					let videoContainer = node.getElementsByClassName("video-container")[0];
					if (videoContainer.style.display == "none") {
						videoContainer.appendChild(createVideoFrame(id));
						videoContainer.style.display = "block";
					} else {
						videoContainer.innerHTML = "";
						videoContainer.style.display = "none";
					}
				};
				node.style.display = "block";
				resultContainer.appendChild(node);
			});
		});
	} catch(err) {
		console.log(err);
		alert("Failed to fetch search results. Use the developer console to get error details.", "Error", "error.png");
	}
}

})();
