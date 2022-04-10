let cWidth = window.innerWidth;
let cHeight = window.innerHeight;
let rContainer = document.getElementById("result-container");
let errorMsg = document.getElementById("err");
let resultContainer = document.getElementById("result-container");
let resultElement = document.getElementsByClassName("result")[0];

// correct display
if (cWidth > 768) {
	rContainer.style.width = "768px";
	rContainer.style.marginLeft = "auto";
	rContainer.style.marginRight = "auto";
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

	let params = {
		"part": "snippet",
		"type": "video",
		"order": order,
		"maxResults": maxResults,
		"q": input
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
					node.style.display = "block";
					node.onclick = (e) => {
						let videoContainer = node.getElementsByClassName("video-container")[0];
						if (videoContainer.style.display == "none") {
							let video = document.createElement("embed");
							video.type = "text/plain";
							video.width = 400;
							video.height = 300;
							video.src = "https://youtube.com/embed/" + id;
							videoContainer.appendChild(video);
							videoContainer.style.display = "block";
						} else {
							videoContainer.innerHTML = "";
							videoContainer.style.display = "none";
						}
					};
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