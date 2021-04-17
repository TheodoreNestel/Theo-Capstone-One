//DOM elements 

const user1Container = $("#user1_data");

const user2Container = $("#user2_data");

const user2Form = $("#user_form")

const vsForm = $("#vs_form")



const vsGameDetail = $("#game-detail-vs")

const User1GameIdArr = []
const User2GameIdArr = []



async function fetchRiotData(region, username){
    const res = await axios.post("/api/get_user_profile" , {region , username})
    
    return res.data[0];
}

function $(selector){
  const elements =  document.querySelectorAll(selector);
  return elements.length > 1 ? elements : elements[0];
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//this also needs some reformating ideally id like to consolidate both these two and the match info together 
//this means probably more data grabbed out of matches and added to the table in a nicer format 
//also I'd like to figure out datadragon so help simplify some of the chaos 

async function displayDataUser1(){

    const data = await fetchRiotData(window.user.region , window.user.username);

    //console.log(data);

    user1Container.innerHTML = `
    <div class="user_profile">
    <h3>${data.AccountInfo.profileIconId}</h3>
    <h3>${data.AccountInfo.name}</h3>
    <h3>${data.AccountInfo.summonerLevel}</h3>
    
    </div>
    
    <table class="table table-sm table-dark">
    <thead>
      <tr>
        <th scope="col">Champion</th>
        <th scope="col">Queue</th>
        <th scope="col">Match Details</th>
      </tr>
    </thead>
    <tbody>
    <!-- this is where the userData/not the match mega details goes -->
    </tbody>
  </table> `;


  //this map is grabbing our ten last games and displaying them 

  //Im going to add the match details as well 
   const matches = data.MatchHistory.matches.map(function(match,i){
       if(i > 10 ){
           return ""
       }

       User1GameIdArr[i] = match.gameId // used to grab each individual game id for the purpose of another api call 
       // we will use this matched to game row to get the game id 

       

       //console.log(allgames)

       

    

    return `<tr data-gameid="${match.gameId}" data-region="${window.user.region}" id="match-data-user-${i}"> 
    <td>${match.champion}</td>
    <td>${match.queue}</td>
    <td>${match.gameId}</td>
    <td><button class="btn btn-secondary detail-button-user"> Get Match Details </button> </td>
            </tr>
            `

    })



    user1Container.querySelector("tbody").insertAdjacentHTML("afterBegin" , matches.join(""))
}





async function displayDataUser2(region, username){

    const data = await fetchRiotData( region, username);

    console.log(data);




    user2Container.innerHTML = `
    <div class="user_profile">
    <h3>${data.AccountInfo.profileIconId}</h3>
    <h3>${data.AccountInfo.name}</h3>
    <h3>${data.AccountInfo.summonerLevel}</h3>
    
    </div>


    <table class="table table-sm table-dark">
    <button class="remove_table">x</button>
    <thead>
      <tr>
      <th scope="col">Champion</th>
      <th scope="col">Queue</th>
      <th scope="col">Match Details</th>
      </tr>
    </thead>
    <tbody>
    <!-- this is where the userData/not the match mega details goes -->
    </tbody>
  </table> `;

   const matches = data.MatchHistory.matches.map((match,i)=> {
       if(i > 10 ){
           return ""
       }

       User2GameIdArr[i] = match.gameId

    return `<tr data-gameid="${match.gameId}" data-region="${region}" id="match-data-vs-${i}">
    <td>${match.champion}</td>
    <td>${match.queue}</td>
    <td><button class="btn btn-secondary detail-button-vs">  Get Match Details  </button> </td>
        
    
    </tr>`

    })

    
    user2Container.querySelector("tbody").insertAdjacentHTML("afterBegin" , matches.join(""))
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////



async function getMatchInfo(region , matchId){

    //im going to use the function to dissect the pieces of data i want to get from this matchInfo object 

    //TODO: grab more data using for loops to make the object that comes out more digestable 
    
    const res = await axios.post("/api/get_match" , {region , matchId});

        
        let playerMatchId;
        let username;
        let blueTeam = [];
        let redTeam = [];


        const playerProfiles = res.data[0].gameInfo.participantIdentities.map((player,i)=>{

             username = player.player.summonerName;
             playerMatchId = player.participantId;
             


             return{
                 "username":username,
                 "playerMatchId": playerMatchId
             };
        })

        playerProfiles.forEach((player,i)=>{

            if(player["playerMatchId"] === res.data[0].gameInfo.participants[i].participantId)
            {
                player["playerDetails"] = res.data[0].gameInfo.participants[i];
                player["team"] = res.data[0].gameInfo.participants[i].teamId;
                player["champion"] =res.data[0].gameInfo.participants[i].championId;
                

                    player["items"] = [
                        res.data[0].gameInfo.participants[i].stats.item0,
                        res.data[0].gameInfo.participants[i].stats.item2,
                        res.data[0].gameInfo.participants[i].stats.item3,
                        res.data[0].gameInfo.participants[i].stats.item4,
                        res.data[0].gameInfo.participants[i].stats.item5,
                        res.data[0].gameInfo.participants[i].stats.item6
                        ];
                player["win"] = res.data[0].gameInfo.participants[i].stats.win;
                player["visionScore"] = res.data[0].gameInfo.participants[i].stats.visionScore;
                player["totalDamageDealt"] = res.data[0].gameInfo.participants[i].stats.totalDamageDealt;
                player["creepScore"] = res.data[0].gameInfo.participants[i].stats.totalMinionsKilled;
                player["kills"] = res.data[0].gameInfo.participants[i].stats.kills;
                player["assists"] = res.data[0].gameInfo.participants[i].stats.assists;
                player["deaths"] = res.data[0].gameInfo.participants[i].stats.deaths;
                player["wardsPlaced"] = res.data[0].gameInfo.participants[i].stats.wardsPlaced;
                
            }

        })
    
        playerProfiles.forEach((player)=>{

            if(player.team === 100){

                blueTeam.push(player)
            }
            else if(player.team === 200){

                redTeam.push(player)
            }
        })
        
    const gameDetailRes = {

        "gameInfo":{
                    "gamemode":res.data[0].gameInfo.gameMode,
                    "gameDuration":res.data[0].gameInfo.gameDuration/60,
                    "season":res.data[0].gameInfo.seasonId
                },
        "playerInfo":{

            "blueTeam":{
                "players":blueTeam
            },
            "redTeam":{
                "players":redTeam
            }

        }
        

    }

    
    //console.log(gameDetailRes)

    return gameDetailRes;

}




async function displayMatchInfo( region , matchId){


    const data = await getMatchInfo(region , matchId)

    console.log(data)


}



window.addEventListener("load",displayDataUser1);

user2Form.addEventListener("submit",function(evt){

    evt.preventDefault()

   const region = document.getElementById("region").value;
   const username = document.getElementById("username").value;
  
   displayDataUser2(region,username);

   vsForm.classList.add("invisible")

  

})


//This is gonna be kinda of scuffed so check in with a real programmer lmao 

 document.addEventListener("click",function(event){

 var element = event.target; 
 if(element.tagName === "BUTTON" && element.classList.contains("remove_table")){
     user2Container.innerHTML =""
 }

 vsForm.classList.remove("invisible")
 })


 //////////
 let shownDetails = []; // I dont know where else to put this variable
 //its used to make sure you can only load one match per click of "show details"
 /////////

 document.addEventListener("click",async function(event){
    var childElement = event.target;
    let gameIndex;
    let gameId;
    let region;
    let gameDetails;
    //probably a better way to do this but I have two if checking to which user is being clicked on 


    //this if checks for click on the User match history
    if(childElement.tagName === "BUTTON" && childElement.classList.contains("detail-button-user")){
        

        parentElement =childElement.parentElement.parentElement;
        region = parentElement.dataset.region
        gameId = parentElement.dataset.gameid
       
        console.log(gameId);
        console.log(region)


        
    

        gameDetails =  await displayMatchInfo(region , gameId)
            //userGameDetail.insertAdjacentHTML("afterend" , gameDetails)
           

    }

    

    //this if check for clicks on the Vs match history 
    if(childElement.tagName === "BUTTON" && childElement.classList.contains("detail-button-vs")){
        

        parentElement =childElement.parentElement.parentElement;
        region = parentElement.dataset.region
        gameId = parentElement.dataset.gameid
       
        console.log(gameId);
        console.log(region)


        
    

        gameDetails =  await displayMatchInfo(region , gameId)
            //userGameDetail.insertAdjacentHTML("afterend" , gameDetails)
           

    }


    
 })

 //test function for console.log stuff 

 

