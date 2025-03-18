document.addEventListener("DOMContentLoaded", async () =>{
    const characterList = document.getElementById("character_list");
    const speciesFilter = document.getElementById("species_type");

    try{
        const allCharacters = await fetchCharacters();

        //Get all species and add to filyer menu
        const uniqueSpecies = new Set();
        for(const character of allCharacters){
            const speciesName = await fetchSpecies(character.species);
            uniqueSpecies.add(speciesName);
        }

        // Update filter-dropdown
        uniqueSpecies.forEach(species =>{
            const option = document.createElement("option");
            option.value = species;
            option.textContent = species;
            speciesFilter.appendChild(option);
        });

        // after filter change
        speciesFilter.addEventListener("change",() =>{
            const selectedSpecies = speciesFilter.value;
            const filteredCharacters = selectedSpecies == "all" ?allCharacters
            : allCharacters.filter(char => char.speciesName === selectedSpecies);
            renderCharacters(filteredCharacters, characterList);
        });

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
const speciesColors = {
    "Unknown":"#ffffff",
    "Human": "#FF5733",
    "Wookie": "#3357FF",
    "Droid": "#33FF57",
    "Twi'lek": "#2980B9",
    "Rodian": "#F1C40F",
    "Hutt": "#8E44AD",
    "Yoda's species":"#E67E22",
    "Trandoshan":"#1ABC9C",
    "Mon Calamari":"#2ECC71",
    "Ewok":"#3498DB"
    };
function getRandomColor(){
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

function speciesBackgroundColor(species){
    if(!speciesColors[species]){
        speciesColors[species] = getRandomColor();
    }
return speciesColors[species];
}
        

        
// Render Character Cards
async function renderCharacters(allCharacters, container) {
    container.innerHTML = "";

    for(const character of allCharacters) {
        const characterDiv = document.createElement("div");
        characterDiv.classList.add("characters_card");

        //Fetch additional details
        const[speciesName, filmTitle] = await Promise.all([
            fetchSpecies(character.species),
            fetchFilmsTitles(character.films), 
        ]);

        // Save species directly in the object for filtering later
        character.speciesName = speciesName;

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

        
         

           
            
           



