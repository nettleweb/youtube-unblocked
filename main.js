
// use window.screen.width to get display dimensions
// window.innerWidth is not working correctly on mobile phones
let cWidth = window.screen.width; 
let cHeight = window.screen.height;

let errorMsg = document.getElementById("err");
let resultContainer = document.getElementById("result-container");
let resultElement = document.getElementsByClassName("result")[0];

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

errorMsg.innerHTML = "";

// load api key
gapi.load("client", () => {
	gapi.client.setApiKey("AIzaSyBqQGSeJZUdI0itB4t-UW21-DOv3Ae1cAk");
	gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(() => console.log("GAPI client loaded for API"), (err) => {
			// an error occurred
			console.log(err);
			errorMsg.innerHTML = "Error: Failed to load GAPI client for API. Use the developer console to get error details.";
		});
});

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
	// clear results
	resultContainer.innerHTML = "";
	resultContainer.appendChild(errorMsg);

	let input = document.getElementById("text-input").value;
	let maxResults = correctNumberRange(document.getElementById("option-max-results"), 10, 1, 50);
	let order = document.getElementById("option-order").value;

	if (window == window.top) {
		search(input, maxResults, order);
	} else {
		// search directly inside a frame may cause display issues
		// so do it in another window
		newWindow().window.search(input, maxResults, order);
	}
}

function newWindow() {
	let win = window.open("https://www.example.com/", "win1", "height=" + screen.availHeight + ", width=" + screen.availWidth + ", scrollbars=1, resizable=1")
	win.document.documentElement.outerHTML = document.documentElement.outerHTML;
	return win;
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
			try {
				result.result.items.forEach((e, i) => {
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
							let video = document.createElement("embed");
							video.type = "text/plain";
							video.width = 400;
							video.height = 300;
							video.src = "https://youtube.com/embed/" + id;
							video.style.position = "relative";
							video.style.display = "block";
							video.style.width = "100%";
							video.style.height = "100%";
							videoContainer.appendChild(video);
							videoContainer.style.display = "block";
						} else {
							videoContainer.innerHTML = "";
							videoContainer.style.display = "none";
						}
					};
					node.style.display = "block";
					resultContainer.appendChild(node);
				});
			} catch(err) {
				console.log(err);
				errorMsg.innerHTML = "Error: Failed to fetch search results. Use the developer console to get error details.";
			}
		});
	} catch(err) {
		console.log(err);
		errorMsg.innerHTML = "Error: Failed to fetch search results. Use the developer console to get error details.";
	}
}
