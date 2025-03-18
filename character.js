
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

// Function to handle editing a character
async function handleEditCharacter(character,characterDiv){
    const editForm = document.createElement("form");
    editForm.classList.add("edit-form");

    const nameInput =document.createElement("input");
    nameInput.type="text";
    nameInput.value=character.name;
    nameInput.required=true;

    const speciesSelect = document.createElement("select");
    speciesSelect.required=true;

    let speciesData =[];
    try {
        const response =await fetch ("https://swapi.dev/api/species/");
        const data = await response.json();
        speciesData=data.results;

        speciesData.forEach(species=>{
            const option =document.createElement("option");
            option.value=species.url;
            option.textContent=species.name;
            if(character.species.includes(species.url)){
                option.selected=true;
            }
            speciesSelect.appendChild(option);
        });
    } catch (error){
        console.error("Error fetching species:", error);
    }

    const saveButton = document.createElement("button");
    saveButton.type="submit";
    saveButton.textContent="Save";

    const cancelButton = document.createElement("button");
    cancelButton.type="button";
    cancelButton.textContent="Cancel";
    cancelButton.addEventListener("click",() => {
        editForm.remove();
        characterDiv.style.display ="block";
    });

    editForm.appendChild(nameInput);
    editForm.appendChild(speciesSelect);
    editForm.appendChild(saveButton);
    editForm.appendChild(cancelButton);

    editForm.addEventListener("submit",(event) => {
        event.preventDefault();
        character.name=nameInput.value;
        const selectedSpecies = speciesData.find(species=>species.url===speciesSelect.value);
        character.species = selectedSpecies ? selectedSpecies.url : character.species;
        
        characterDiv.querySelector("h2").textContent=character.name;
        characterDiv.querySelector("p:nth-child(2)").innerHTML=`<strong>Species:</strong> ${selectedSpecies ? selectedSpecies.name:"Unknown"}`;

        editForm.remove();
        characterDiv.style.display="block";
        console.log("Character updated:", character);
    });
    characterDiv.style.display="none";
    characterDiv.parentNode.insertBefore(editForm,characterDiv);
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
        
          const editButton =document.createElement("button");
          editButton.innerHTML=`<i class="fa-solid fa-pen"></i>`;
          editButton.classList.add("edit-btn");
          editButton.addEventListener("click",() => handleEditCharacter(character,characterDiv));  
          //Create delete button 
          const deleteButton = document.createElement("button");
          deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
          deleteButton.classList.add("delete-btn");
          deleteButton.addEventListener("click", () => {
             characterDiv.remove();                
          });

          characterDiv.appendChild(editButton);
          characterDiv.appendChild(deleteButton);
          container.appendChild(characterDiv);


        
    
    }
}

