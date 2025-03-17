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





          
          container.appendChild(characterDiv);
          characterDiv.appendChild(deleteButton);

        
    
    }
}

        
         

           
            
           



