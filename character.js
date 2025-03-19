document.addEventListener("DOMContentLoaded", async () =>{
    const characterList = document.getElementById("character_list");
    const speciesFilter = document.getElementById("species_type");
    const addCharacterForm = document.getElementById("add_character_form");
    const speciesDropdown = document.getElementById("species");

    try{
        let allCharacters = await fetchCharacters();
        const saveCharacters = loadCharactersFromLocalStorage();
        allCharacters = [...allCharacters, ...saveCharacters];

        console.log("Loaded characters:", allCharacters)

        await populateSpaciesDropdown();

        //Get all species and add to filyer menu
        const uniqueSpecies = new Set();
        for(const character of allCharacters){
            if(!character.speciesName){
                character.speciesName = character.species.length > 0 
                    ?await fetchSpecies(character.species)
                    :"Unknown"
            }
            uniqueSpecies.add(character.speciesName);
        }

        // Update filter-dropdown
        speciesFilter.innerHTML = '<option value="all">All</option>';
        uniqueSpecies.forEach(species =>{
            const option = document.createElement("option");
            option.value = species;
            option.textContent = species;
            speciesFilter.appendChild(option);
        });

        // after filter change
        speciesFilter.addEventListener("change",() =>{
            const selectedSpecies = speciesFilter.value;
            const filteredCharacters = selectedSpecies == "all" ? allCharacters
                : allCharacters.filter(char => char.speciesName === selectedSpecies);
            renderCharacters(filteredCharacters, characterList);
        });

        renderCharacters(allCharacters,characterList);

        addCharacterForm.addEventListener("submit",(e)=>{
            e.preventDefault();
            const name = document.getElementById("name").value;
            const birthYear = document.getElementById("birth_year").value;
            const species = document.getElementById("species").value;
            const films = document.getElementById("films").value.split(",").map(film=>film.trim());

            if (!name || !birthYear || !species){
                alert("Please fill in all fields");
                return;
            }
            const newCharacter = {
                name : name,
                birth_year : birthYear,
                speciesName : species,
                films : [],
                species : [],
            };

            saveCharacterToLocalStorage(newCharacter);
            allCharacters.push(newCharacter);

            // Ensure species list update dynamically
            if (!speciesDropdown.querySelector(`option[value='${species}']`)){
                const newOption = document.createElement("option");
                newOption.value=species;
                newOption.textContent=species;
                speciesDropdown.appendChild(newOption);
            }
            renderCharacters(allCharacters,characterList);
        });
        
    }catch(error){
        console.error("Error fetching Star Wars character:", error);
    }
});

async function populateSpaciesDropdown(){
    const speciesDropdown =document.getElementById("species");
    speciesDropdown.innerHTML="";
    try{
        let speciesList =[];
        let nextURL ="https://swapi.dev/api/species/";
        while(nextURL){
            const response = await fetch(nextURL);
            const data = await response.json();
            speciesList = speciesList.concat(data.results.map(species =>species.name));
            nextURL= data.next;
        }
        speciesList.forEach(species => {
            const option = document.createElement("option");
            option.value=species;
            option.textContent=species;
            speciesDropdown.appendChild(option);
        });
    }catch (error){
        console.error("Error fetching species list:", error);
    }
}

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
    try{
        const filmTitle = await Promise.all(
            filmUrls.map (async(filmUrl)=>{
                try{
                    const filmResponse = await fetch(filmUrl);
                    if (!filmResponse.ok){
                        throw new Error(`Failed to fetch film :${filmUrl}`);
                    }
                    const filmData = await filmResponse.json();
                    return filmData.title;
                }catch(error){
                    console.warn("Failed to fetch film", error.message);
                    return "Unknown Film";
                }
            })
        );
        return filmTitle;

    }catch(error){
        console.error("Failed to fetch films",error);
        return [];
    }

    /* const filmTitle = await Promise.all(
        filmUrls.map (async(filmUrl)=>{
            const filmResponse = await fetch(filmUrl);
            const filmData = await filmResponse.json();
            return filmData.title;
        })
    ); */
    // return filmTitle;   
}

// Fetch Species
async function fetchSpecies(speciesUrls) {

    if(speciesUrls.length ===0) return "Unknown";
    const speciesResponse = await fetch(speciesUrls[0]);
    const speciesData = await speciesResponse.json();
    return speciesData.name;    
}
function saveCharacterToLocalStorage(character){
    let saveCharacters = JSON.parse(localStorage.getItem("characters"))
    if (!Array.isArray(saveCharacters)){
        saveCharacters = [];
    }
    saveCharacters.push(character);
    localStorage.setItem("characters",JSON.stringify(saveCharacters));
}

function loadCharactersFromLocalStorage(){
    return JSON.parse(localStorage.getItem("characters")) || [];
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

function removeCharacterFromLocalStorage(name) {
    let savedCharacters = JSON.parse(localStorage.getItem("characters")) || [];
    savedCharacters = savedCharacters.filter(character => character.name !== name);
    localStorage.setItem("characters", JSON.stringify(savedCharacters));
}

        
// Render Character Cards
async function renderCharacters(allCharacters, container) {
    container.innerHTML = "";

    for (const character of allCharacters){
        const characterDiv = document.createElement("div");
        characterDiv.classList.add("characters_card");

        let speciesName = character.speciesName || "Unknown";
        let filmTitle = [];

        if (character.films && character.films.length>0){
            filmTitle = await fetchFilmsTitles(character.films);
        }

        // Save species directly in the object for filtering later
        character.speciesName = speciesName;


        // Create elements for character card details
        const nameElement = document.createElement("h2");
        nameElement.textContent = character.name;

        const speciesElement = document.createElement("p");
        speciesElement.innerHTML =` <strong> Species : <strong> ${speciesName}`;

        const birthYearElement = document.createElement("p");
        birthYearElement.innerHTML =` <strong> Birth Year : <strong> ${character.birth_year}`;
       

        const filmsElement = document.createElement("p");
        
        filmsElement.innerHTML=`<strong> Films:</strong> ${filmTitle.join(",") || "None"}`;
        //Fetch additional details
        /* const[speciesName, filmTitle] = await Promise.all([
            fetchSpecies(character.species),
            fetchFilmsTitles(character.films), 
        ]);
        */
        //background Colour
        characterDiv.style.backgroundColor = speciesBackgroundColor(speciesName);

        // create edit button
        const editButton = document.createElement("button");
        editButton.innerHTML = `<i class="fa-solid fa-pen"></i>`;
        editButton.classList.add("edit-btn");
        editButton.addEventListener("click", () => {
            const newName = prompt("Enter new name:", character.name);
            const newBirthYear = prompt("Enter new birth year:", character.birth_year);
            const newSpecies = prompt("Enter new species:", speciesName);

            if (newName) nameElement.innerHTML = newName;
            if (newBirthYear) birthYearElement.innerHTML = `<strong>Birth Year:</strong> ${newBirthYear}`;
            if (newSpecies) {
                speciesElement.innerHTML = `<strong>Species:</strong> ${newSpecies}`;
                characterDiv.style.backgroundColor = speciesBackgroundColor(newSpecies);
            }
        });


        //Create delete button 
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", () => {
            characterDiv.remove();
            removeCharacterFromLocalStorage(character.name);
               
        });

       
        characterDiv.appendChild(nameElement);
        characterDiv.appendChild(speciesElement);
        characterDiv.appendChild(birthYearElement);
        characterDiv.appendChild(filmsElement);
        characterDiv.appendChild(editButton);
        characterDiv.appendChild(deleteButton);
        container.appendChild(characterDiv);

        
    
    };
    console.log("Rendered character:", container.innerHTML);
}
