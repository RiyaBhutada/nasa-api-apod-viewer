const resultsNav = document.getElementById("resultsNav");
const favoritesNav = document.getElementById("favoritesNav");
const imagesContainer = document.querySelector(".images-container");
const saveConfirmed = document.querySelector(".save-confirmed");
const loader = document.querySelector(".loader");

// NASA API
const count = 10;
const apiKey = `DEMO_KEY`;
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
let favorites = {};

function showContent(page){
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
    if(page === "results"){
        resultsNav.classList.remove("hidden");
        favoritesNav.classList.add("hidden");
    }else{
        resultsNav.classList.add("hidden");
        favoritesNav.classList.remove("hidden");
    }
    loader.classList.add("hidden");
}

function createDOMNodes(page){
    // Using Objects.array to convert favorites to an array
    const currentArray = page === "results" ? resultsArray : Object.values(favorites);
    // console.log(currentArray);
    currentArray.forEach((result) => {
        // Card Container
        const card = document.createElement("div");
        card.classList.add("card");
        // Link
        const link = document.createElement("a");
        link.href = result.hdurl;
        link.title = "View Full Image";
        link.target = "_blank";

        // Image
        const image = document.createElement("img");
        image.src = result.url;
        image.alt = "NASA Picture Of The Day";
        // Lazy load the image
        image.loading = "lazy";
        image.classList.add("card-img-top");

        // Card Body
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.textContent = result.title;

        const saveText = document.createElement("p");
        saveText.classList.add("clickable");
        if(page === "results"){
            saveText.textContent = "Add to Favorites";
            saveText.setAttribute("onclick", `saveFavorite("${result.url}")`);
        }else{
            saveText.textContent = "Remove Favorite";
            saveText.setAttribute("onclick", `removeFavorite("${result.url}")`);
        }

        const cardText = document.createElement("p");
        cardText.textContent = result.explanation;

        const footer = document.createElement("small");
        footer.classList.add("text-muted");

        const date = document.createElement("strong");
        date.textContent = result.date;

        const copyrightResult = result.copyright === undefined ? "" : result.copyright;
        const copyRight = document.createElement("span");
        copyRight.textContent = ` ${copyrightResult}`;

        // Append
        footer.append(date, copyRight);
        cardBody.append(cardTitle, saveText, cardText, footer);
        link.appendChild(image);
        card.append(link, cardBody);
        imagesContainer.appendChild(card);
    });
}

function updateDOM(page){
    // Get favorites from localStorage
    // When receiving data from local storage, the data is always string, so use parse method to convert to an object
    if(localStorage.getItem("nasaFavorites")){
        favorites = JSON.parse(localStorage.getItem("nasaFavorites"));
    }
    // Removing all items so that the page refreshes when an item is deleted
    imagesContainer.textContent = "";
    createDOMNodes(page);
    showContent(page);
}

// Asynchronous FETCH req
// Get 10 images from NASA API
async function getNasaPictures(){
    // Showing Loader
    loader.classList.remove("hidden");
    try{
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        updateDOM("results");
    }catch(err){
        // Catch err here
    }
}

// Add result to favorites
function saveFavorite(itemUrl){
    resultsArray.forEach(item => {
        if(item.url.includes(itemUrl) && !favorites[itemUrl]){
            favorites[itemUrl] = item;
            // console.log(JSON.stringify(favorites));
            saveConfirmed.hidden = false;
            setTimeout(() => {
                saveConfirmed.hidden = true;
            }, 2000);

            // Set favorites in local storage; we are using stringify to store the object as a string because web server only allows string values to be stored
            // We are using local storage because are data will be stored even after a page refresh
            localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
        }
    });
}

function removeFavorite(itemUrl){
    if(favorites[itemUrl]){
        delete favorites[itemUrl];
        localStorage.setItem("nasaFavorites", JSON.stringify(favorites));
        updateDOM("favorites");
    }
}

getNasaPictures();