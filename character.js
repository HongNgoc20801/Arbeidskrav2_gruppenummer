document.addEventListener("DOMContentLoaded", async () =>{
    const stat = document.getElementById("character_list");

    let allCharacters =[];
    let nextURL = "https://swapi.dev/api/people";

    try{
        while(nextURL){
            const response = await fetch(nextURL);
            const data = await response.json();
            allCharacters = allCharacters.concat(data.results);
            nextURL = data.next;    // get next page URL
        }

        for(const character of allCharacters) {
            const characterDiv = document.createElement("div");
            characterDiv.classList.add("characters_card");

            // Fetch Films
            const filmTitle = await Promise.all(
                character.films.map (async(filmUrl)=>{
                    const filmResponse = await fetch(filmUrl);
                    const filmData = await filmResponse.json();
                    return filmData.title;
                })
            );

            // Fetch Species
            let speciesName = "Unknown";
            if(character.species.length >0) {
                const speciesResponse = await fetch(character.species[0]);
                const speciesData = await speciesResponse.json();
                speciesName = speciesData.name;

            }

            //Populate Character Card
            characterDiv.innerHTML = `
            <h2> ${character.name} </h2>
            <p> <strong> Birth Year : <strong> ${character.birth_year}</p>
            <p> <strong> Films : <strong> ${filmTitle.join(",")}</p>
            <p> <strong> Species : <strong> ${speciesName}</p>
            `
            stat.appendChild(characterDiv);
        }

    } catch (error){
        console.error("Error fetching Star Wars character:", error);
    }

});