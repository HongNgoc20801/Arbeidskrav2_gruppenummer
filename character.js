document.addEventListener("DOMContentLoaded", async () =>{
    const characterList = document.getElementById("character_list");

    try{
        const allCharacters = await fetchCharacters();
        renderCharacters(allCharacters,characterList);
    }catch(error){
        console.error("Error fetching Star Wars character:", error);
    }
});

// Fetch all Characters
async function fetchCharacters() {

    let allCharacters =[];
    let nextURL = "https://swapi.dev/api/people";
    while(nextURL){
        const response = await fetch(nextURL);
        const data = await response.json();
        allCharacters = allCharacters.concat(data.results);
        nextURL = data.next;  // get next page URL
    }
    return allCharacters;
}

// Fetch Film 
async function fetchFilmsTitles(filmUrls) {

    const filmTitle = await Promise.all(
        filmUrls.map (async(filmUrl)=>{
            const filmResponse = await fetch(filmUrl);
            const filmData = await filmResponse.json();
            return filmData.title;
        })
    );
    return filmTitle;   
}

// Fetch Species
async function fetchSpecies(speciesUrls) {

    if(speciesUrls.length ===0) return "Unknown";
    const speciesResponse = await fetch(speciesUrls[0]);
    const speciesData = await speciesResponse.json();
    return speciesData.name;    
}

//background color based on Species
function speciesBackgroundColor(species) {
    const speciesColors = {
        "Human": "#FF5733",
        "Wookie": "#3357FF",
        "Droid": "#33FF57",
        "Twi'lek": "#2980B9",
        "Rodian": "#F1C40F",
        "Hutt": "#8E44AD",
        "Unknown": "#e0e0e0",
        "Yoda's species":"#E67E22",
        "Trandoshan":"#1ABC9C",
        "Mon Calamari":"#2ECC71",
        "Ewok":"#3498DB",
        "Sullustan":"#E74C3C",
        "Neimodian":"#34495E",
        "Gungan":" #9B59B6",
        "Toydarian":"#16A085",
        "Dug":"#27AE60",
        "Aleena":"#C0392B",
        "Vulptereen":"#D35400",
        "Xexto":"#7F8C8D",
        "Toong":"#BDC3C7",
        "Cerean":" #2C3E50",
        "Nautolan":" #FF69B4",
        "Zabrak":"#800080",
        "Tholothian":"#00FFFF",
        "Iktotchi":"#FFD700",
        "Quermian":"#DDA0DD",
        "Kel Dor":"#20B2AA",
        "Chagrian":"#8B4513",
        "Geonosian":"#FF4500",
        "Mirialan":"#708090",
        "Clawdite":" #40E0D0",
        "Besalisk":" #556B2F",
        "Kaminoan":"#DC143C",
        "Muun":"#FA8072",
        "Skakoan":" #00FA9A",
        "Togruta":"#4682B4",
        "Kaleesh":"#A52A2A",
        "Pau'an": " #FF8C00"

    };
    return speciesColors[species] || "#ffffff";
}
        
// Render Character Cards
async function renderCharacters(allCharacters, container) {
    for(const character of allCharacters) {
        const characterDiv = document.createElement("div");
        characterDiv.classList.add("characters_card");

        //Fetch additional details
        const[speciesName, filmTitle] = await Promise.all([
            fetchSpecies(character.species),
            fetchFilmsTitles(character.films), 
        ]);

        

         //Populate Character Card
         characterDiv.innerHTML = `
            <h2> ${character.name} </h2>
            <p> <strong> Species : <strong> ${speciesName}</p>
            <p> <strong> Birth Year : <strong> ${character.birth_year}</p>
            <p> <strong> Films : <strong> ${filmTitle.join(",")}</p>
            `

          //Create delete button 
          const deleteButton = document.createElement("button");
          deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
          deleteButton.classList.add("delete-btn");
          deleteButton.addEventListener("click", () => {
             characterDiv.remove();                
          });

          //background Colour
          characterDiv.style.backgroundColor = speciesBackgroundColor(speciesName);





          
          container.appendChild(characterDiv);
          characterDiv.appendChild(deleteButton);

        
    
    }
}

        
         

           
            
           



