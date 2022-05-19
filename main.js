"use strict";

(() => {
function absUrl(target) {
	if (target.startsWith("https://") || target.startsWith("http://"))
		return target;
	if (target == null || target.length == 0)
			return "about:blank";
	let src = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0].substring(1);
	let base = new URL(src + "/..").href;
	if (!base.endsWith("/"))
		base += "/";
	return new URL(base + target).href;
}

document.body.innerHTML += `
<div id="container">
	<img id="logo" src="logo.png" />
	<div id="search-bar">
		<input id="text-input" type="text" value="" placeholder="" />
		<div id="search-button">
			<img id="search-icon" src="search.png" />
		</div>
	</div>
	<div id="option-bar">
		<p>Max results: </p>
		<input id="option-max-results" type="number" min="1" max="50" value="10" placeholder="10" />
		<p>Sort by: </p>
		<select id="option-order">
			<option value="date">Date</option>
			<option value="rating">Rating</option>
			<option value="relevance" selected="true">Relevance</option>
			<option value="title">Title</option>
			<option value="viewCount">View Count</option>
		</select>
	</div>
</div>
<iframe id="result-frame" width="1024" height="768" allowfullscreen="true"></iframe>
`;

// load api key
gapi.load("client", () => {
	gapi.client.setApiKey("AIzaSyBqQGSeJZUdI0itB4t-UW21-DOv3Ae1cAk");
	gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(() => console.log("GAPI client loaded for API"), (err) => {
			console.log(err);
			alert("Failed to load GAPI client for API. Use the developer console to get error details.", "Error", "error.png");
		});
});

// load result frame document
let request = new XMLHttpRequest();
request.responseType = "text";
request.open("GET", absUrl("results.html"), true);
request.onload = () => {
let cWidth = window.screen.width; 
let resultDoc = request.responseText;
let resultFrame = document.getElementById("result-frame");
resultFrame.onload = () => {

let rdoc = resultFrame.contentDocument;
let resultContainer = rdoc.getElementById("result-container");
let resultElement = rdoc.getElementsByClassName("result")[0];

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

// correct result frame display
let resizeFrame = () => {
	resultFrame.style.height = rdoc.body.clientHeight + "px";
};
resizeFrame();
new ResizeObserver(resizeFrame).observe(rdoc.body);

document.getElementById("search-button").onclick = (e) => run();
document.getElementById("text-input").onkeydown = (e) => {
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
	let input = document.getElementById("text-input").value;
	let maxResults = correctNumberRange(document.getElementById("option-max-results"), 10, 1, 50);
	let order = document.getElementById("option-order").value;
	if (window != window.top)
		newWindow();
	search(input, maxResults, order);
}

function newWindow() {
	let win = window.open("", "_blank");
	win.focus();
	rdoc = win.document;
	rdoc.write(resultDoc);
	resultContainer = rdoc.getElementById("result-container");
	resultElement = rdoc.getElementsByClassName("result")[0];
}

function createVideoFrame(id) {
	let frame = document.createElement("iframe");
	frame.width = "400";
	frame.height = "300";
	frame.style.position = "relative";
	frame.style.display = "block";
	frame.style.width = "100%";
	frame.style.height = "100%";
	frame.style.border = "none";
	frame.setAttribute("allowfullscreen", "true");
	frame.onload = () => {
		let win = frame.contentWindow;
		let url = new URL("https://youtube.com/embed/" + id);
		try {
			if (win.location.href != url.href)
				win.location = url;
			Object.freeze(win.location);
		} catch (err) {
			// ignore
		}
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

};resultFrame.srcdoc = resultDoc;
};request.send();
})();
