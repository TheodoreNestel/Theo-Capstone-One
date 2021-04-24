//DOM elements 

const user1Container = $("#user1_data");

const user2Container = $("#user2_data");

const user2Form = $("#user_form")

const vsForm = $("#vs_form")



const vsGameDetail = $("#game-detail-vs")




//this function grabs the inital account ingo based on a user's name and region
async function fetchRiotData(region, username){

    const res = await axios.post("/api/get_user_profile" , {region , username})

    if(res.data.err){
        
        return false;
    }
    
    return res.data[0];
}
//this function lets us mimick jquery to grab dom elements and is used above for that purpose
function $(selector){
  const elements =  document.querySelectorAll(selector);
  return elements.length > 1 ? elements : elements[0];
}


//helper for champions imgs
function getChampionName(id){
    const data = window.championData.find(d=>d.id == id);
    
    return data.name;
}
//helper function for spell imgs
function getSpellName(id){
    const data = window.spellData.find(d=>d.id == id);
    
    return data.Spellname
}

//this is the function that will display the data once gathered and formatted 
function displayData(data,container,region){

let userWin = ""

console.log(data)



container.innerHTML = ""


container.innerHTML = `<div class="profile">
        <div class="profile__picture">


            <img src="http://ddragon.leagueoflegends.com/cdn/11.8.1/img/profileicon/${data.AccountInfo.profileIconId}.png">
            <span class="profile__level">${data.AccountInfo.summonerLevel}</span>

        </div>
        <div class="profile__content">

            <h3>${data.AccountInfo.name}</h3>
            <h4>${region}</h4>
        </div>
        </div>


        <div class="match-history">

        ${data.matches.map((match)=>{ 
            
                   return `
            <div class="match ${match.data.playerInfo.currentUser.user.win}">
                <div class="match__game-info">
                <h4> duration :${match.data.gameInfo.gameDuration}m</h4>
                <h4>Gamemode :${match.data.gameInfo.gamemode}</h4>
                <hr>
                <h4>${match.data.playerInfo.currentUser.user.win}</h4>
                </div>

                <div class="match__player-info">
                    <div class="match__player-imgs">

                        <img class="champion-img" src="http://ddragon.leagueoflegends.com/cdn/11.8.1/img/champion/${getChampionName(match.data.playerInfo.currentUser.user.champion)}.png">
                        <img src="https://ddragon.leagueoflegends.com/cdn/11.8.1/img/spell/${getSpellName(match.data.playerInfo.currentUser.user.spell1)}.png">
                        <img src="https://ddragon.leagueoflegends.com/cdn/11.8.1/img/spell/${getSpellName(match.data.playerInfo.currentUser.user.spell2)}.png">
                    
                    </div>
                        <h5>${getChampionName(match.data.playerInfo.currentUser.user.champion)}</h5>
                </div>

                <div class="match__match-stats">
                    <h4> ${match.data.playerInfo.currentUser.user.kills} / <span>${match.data.playerInfo.currentUser.user.deaths}</span> / ${match.data.playerInfo.currentUser.user.assists}</h4>
                    <h5>kda</h5>
                    
                </div>

                <div class="match__match-info">
                <div>
                        <h4>Champion Lv :${match.data.playerInfo.currentUser.user.champLv}</h4>
                        <h4>Creep Score :${match.data.playerInfo.currentUser.user.creepScore}</h4>
                        <h4>Total damage done :${match.data.playerInfo.currentUser.user.totalDamageDealt}</h4>
                    
                </div>

                </div>
            </div>
            ` 
}).join("")}
            
        </div>`


   
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////


//this function grabs a user's matches and looks up the id's then gets the info from those matches 
async function getMatchInfo(region , matchId ,username){ 

    
    const res = await axios.post("/api/get_match" , {region , matchId});



        let playerMatchId;
        let summonerName;
        let blueTeam = [];
        let redTeam = [];
        let winners = []
        let gameDetailRes = {}
        let currentUser = {}


        const playerProfiles = res.data[0].gameInfo.participantIdentities.map((player)=>{

            summonerName = player.player.summonerName;
             playerMatchId = player.participantId;


           

             if(username.toUpperCase().split(" ").join("") === player.player.summonerName.toUpperCase().split(" ").join("")){ // I need to make this not case sensituve
                
                currentUser["user"] = {

                    "username":username,

                    "playerMatchId": playerMatchId,
                }

             }
             

             return{

                 "username":username,
                 "playerMatchId": playerMatchId,

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
                player["champLv"] = res.data[0].gameInfo.participants[i].stats.champLevel;
                player["spell1"] = res.data[0].gameInfo.participants[i].spell1Id;
                player["spell2"] = res.data[0].gameInfo.participants[i].spell2Id;


                
            }
            if(currentUser.user.playerMatchId === res.data[0].gameInfo.participants[i].participantId){
                currentUser.user["win"] = res.data[0].gameInfo.participants[i].stats.win;
                currentUser.user["champion"] = res.data[0].gameInfo.participants[i].championId;
                currentUser.user["kills"] = res.data[0].gameInfo.participants[i].stats.kills;
                currentUser.user["assists"] = res.data[0].gameInfo.participants[i].stats.assists;
                currentUser.user["deaths"] = res.data[0].gameInfo.participants[i].stats.deaths;
                currentUser.user["totalDamageDealt"] = res.data[0].gameInfo.participants[i].stats.totalDamageDealt;
                currentUser.user["creepScore"] = res.data[0].gameInfo.participants[i].stats.totalMinionsKilled;
                currentUser.user["champLv"] = res.data[0].gameInfo.participants[i].stats.champLevel;
                currentUser.user["spell1"] = res.data[0].gameInfo.participants[i].spell1Id;
                currentUser.user["spell2"] = res.data[0].gameInfo.participants[i].spell2Id;

            }

        })
    
        playerProfiles.forEach((player)=>{

            if(player.team === 100){

                blueTeam.push(player)
            }
            else if(player.team === 200){

                redTeam.push(player)
            }
            if(player.win === true){
                winners.push(player.summonerName)
                currentUser.user["win"] = "win";
            }
            if(player.win === false){
                currentUser.user["win"] = "loss";
            }

        })
        
     gameDetailRes = {

        "gameInfo":{
                    "gamemode":res.data[0].gameInfo.gameMode,
                    "gameDuration":Number((res.data[0].gameInfo.gameDuration/60).toFixed(1)),
                    "season":res.data[0].gameInfo.seasonId
                },
        "playerInfo":{

            "blueTeam":{
                "players":blueTeam
            },

            "redTeam":{
                "players":redTeam
            },

            "winners":winners,
            "currentUser":currentUser


        }
        

    }

    
    
    return gameDetailRes;

}

//this function is used to display an error if a summoner cant be found with the user name provided 
function displayError(container){

    


container.innerHTML = ""

//console.log(data)

container.innerHTML = `<div class="profile">
        <div class="profile__picture">


            <img src="static/no_pfp.jpeg">
            <span class="profile__level">No data found</span>

        </div>
        <div class="profile__content">

            <h3>User Cannot be Found</h3>
            <h4>Region N/A</h4>
            <h3>Please go back to the home page and try again</h3>
        </div>
        </div>


        `


   
  
}   

//this here will add data and then call displayData with the gathered data 
async function populateData(region , username , container){
    const data = await fetchRiotData(region ,username);

    if(!data){
        return displayError(container)
    }

    const matches = data.MatchHistory.matches.slice(0,10)
    

    const matchPromises = matches.map(match=>{
        const m = getMatchInfo(region, match.gameId, username)
        m.then(res => match.data = res)
        return m
    
    })

    await Promise.all(matchPromises)

    

    displayData({AccountInfo:data.AccountInfo,matches,region},container,window.user.region);

}

//this event listener is what loads the signedin user's info and send that data to the proper functions so the 
//api calls can be made 
window.addEventListener("load", function(){

    populateData(window.user.region, window.user.username , user1Container);

});
//this event listener watches the "additional" user form so it can grab that data and make the proper calls 
user2Form.addEventListener("submit", async function(evt){

    evt.preventDefault()

   const region = document.getElementById("region").value;
   const username = document.getElementById("username").value;

   //console.log(region)

   populateData(region , username , user2Container);
   
})

 
 //test function for console.log stuff 

 //champions lol hahah dont look at this ever ty <3 
 //those two objects are used to turn keys from the api into name so we can use riot's data tool datadragon 

 window.championData = [
    {
        "id": "266",
        "name": "Aatrox"
    },
    {
        "id": "103",
        "name": "Ahri"
    },
    {
        "id": "84",
        "name": "Akali"
    },
    {
        "id": "12",
        "name": "Alistar"
    },
    {
        "id": "32",
        "name": "Amumu"
    },
    {
        "id": "34",
        "name": "Anivia"
    },
    {
        "id": "1",
        "name": "Annie"
    },
    {
        "id": "523",
        "name": "Aphelios"
    },
    {
        "id": "22",
        "name": "Ashe"
    },
    {
        "id": "136",
        "name": "AurelionSol"
    },
    {
        "id": "268",
        "name": "Azir"
    },
    {
        "id": "432",
        "name": "Bard"
    },
    {
        "id": "53",
        "name": "Blitzcrank"
    },
    {
        "id": "63",
        "name": "Brand"
    },
    {
        "id": "201",
        "name": "Braum"
    },
    {
        "id": "51",
        "name": "Caitlyn"
    },
    {
        "id": "164",
        "name": "Camille"
    },
    {
        "id": "69",
        "name": "Cassiopeia"
    },
    {
        "id": "31",
        "name": "Chogath"
    },
    {
        "id": "42",
        "name": "Corki"
    },
    {
        "id": "122",
        "name": "Darius"
    },
    {
        "id": "131",
        "name": "Diana"
    },
    {
        "id": "119",
        "name": "Draven"
    },
    {
        "id": "36",
        "name": "DrMundo"
    },
    {
        "id": "245",
        "name": "Ekko"
    },
    {
        "id": "60",
        "name": "Elise"
    },
    {
        "id": "28",
        "name": "Evelynn"
    },
    {
        "id": "81",
        "name": "Ezreal"
    },
    {
        "id": "9",
        "name": "Fiddlesticks"
    },
    {
        "id": "114",
        "name": "Fiora"
    },
    {
        "id": "105",
        "name": "Fizz"
    },
    {
        "id": "3",
        "name": "Galio"
    },
    {
        "id": "41",
        "name": "Gangplank"
    },
    {
        "id": "86",
        "name": "Garen"
    },
    {
        "id": "150",
        "name": "Gnar"
    },
    {
        "id": "79",
        "name": "Gragas"
    },
    {
        "id": "104",
        "name": "Graves"
    },
    {
        "id": "887",
        "name": "Gwen"
    },
    {
        "id": "120",
        "name": "Hecarim"
    },
    {
        "id": "74",
        "name": "Heimerdinger"
    },
    {
        "id": "420",
        "name": "Illaoi"
    },
    {
        "id": "39",
        "name": "Irelia"
    },
    {
        "id": "427",
        "name": "Ivern"
    },
    {
        "id": "40",
        "name": "Janna"
    },
    {
        "id": "59",
        "name": "JarvanIV"
    },
    {
        "id": "24",
        "name": "Jax"
    },
    {
        "id": "126",
        "name": "Jayce"
    },
    {
        "id": "202",
        "name": "Jhin"
    },
    {
        "id": "222",
        "name": "Jinx"
    },
    {
        "id": "145",
        "name": "Kaisa"
    },
    {
        "id": "429",
        "name": "Kalista"
    },
    {
        "id": "43",
        "name": "Karma"
    },
    {
        "id": "30",
        "name": "Karthus"
    },
    {
        "id": "38",
        "name": "Kassadin"
    },
    {
        "id": "55",
        "name": "Katarina"
    },
    {
        "id": "10",
        "name": "Kayle"
    },
    {
        "id": "141",
        "name": "Kayn"
    },
    {
        "id": "85",
        "name": "Kennen"
    },
    {
        "id": "121",
        "name": "Khazix"
    },
    {
        "id": "203",
        "name": "Kindred"
    },
    {
        "id": "240",
        "name": "Kled"
    },
    {
        "id": "96",
        "name": "KogMaw"
    },
    {
        "id": "7",
        "name": "Leblanc"
    },
    {
        "id": "64",
        "name": "LeeSin"
    },
    {
        "id": "89",
        "name": "Leona"
    },
    {
        "id": "876",
        "name": "Lillia"
    },
    {
        "id": "127",
        "name": "Lissandra"
    },
    {
        "id": "236",
        "name": "Lucian"
    },
    {
        "id": "117",
        "name": "Lulu"
    },
    {
        "id": "99",
        "name": "Lux"
    },
    {
        "id": "54",
        "name": "Malphite"
    },
    {
        "id": "90",
        "name": "Malzahar"
    },
    {
        "id": "57",
        "name": "Maokai"
    },
    {
        "id": "11",
        "name": "MasterYi"
    },
    {
        "id": "21",
        "name": "MissFortune"
    },
    {
        "id": "62",
        "name": "MonkeyKing"
    },
    {
        "id": "82",
        "name": "Mordekaiser"
    },
    {
        "id": "25",
        "name": "Morgana"
    },
    {
        "id": "267",
        "name": "Nami"
    },
    {
        "id": "75",
        "name": "Nasus"
    },
    {
        "id": "111",
        "name": "Nautilus"
    },
    {
        "id": "518",
        "name": "Neeko"
    },
    {
        "id": "76",
        "name": "Nidalee"
    },
    {
        "id": "56",
        "name": "Nocturne"
    },
    {
        "id": "20",
        "name": "Nunu"
    },
    {
        "id": "2",
        "name": "Olaf"
    },
    {
        "id": "61",
        "name": "Orianna"
    },
    {
        "id": "516",
        "name": "Ornn"
    },
    {
        "id": "80",
        "name": "Pantheon"
    },
    {
        "id": "78",
        "name": "Poppy"
    },
    {
        "id": "555",
        "name": "Pyke"
    },
    {
        "id": "246",
        "name": "Qiyana"
    },
    {
        "id": "133",
        "name": "Quinn"
    },
    {
        "id": "497",
        "name": "Rakan"
    },
    {
        "id": "33",
        "name": "Rammus"
    },
    {
        "id": "421",
        "name": "RekSai"
    },
    {
        "id": "526",
        "name": "Rell"
    },
    {
        "id": "58",
        "name": "Renekton"
    },
    {
        "id": "107",
        "name": "Rengar"
    },
    {
        "id": "92",
        "name": "Riven"
    },
    {
        "id": "68",
        "name": "Rumble"
    },
    {
        "id": "13",
        "name": "Ryze"
    },
    {
        "id": "360",
        "name": "Samira"
    },
    {
        "id": "113",
        "name": "Sejuani"
    },
    {
        "id": "235",
        "name": "Senna"
    },
    {
        "id": "147",
        "name": "Seraphine"
    },
    {
        "id": "875",
        "name": "Sett"
    },
    {
        "id": "35",
        "name": "Shaco"
    },
    {
        "id": "98",
        "name": "Shen"
    },
    {
        "id": "102",
        "name": "Shyvana"
    },
    {
        "id": "27",
        "name": "Singed"
    },
    {
        "id": "14",
        "name": "Sion"
    },
    {
        "id": "15",
        "name": "Sivir"
    },
    {
        "id": "72",
        "name": "Skarner"
    },
    {
        "id": "37",
        "name": "Sona"
    },
    {
        "id": "16",
        "name": "Soraka"
    },
    {
        "id": "50",
        "name": "Swain"
    },
    {
        "id": "517",
        "name": "Sylas"
    },
    {
        "id": "134",
        "name": "Syndra"
    },
    {
        "id": "223",
        "name": "TahmKench"
    },
    {
        "id": "163",
        "name": "Taliyah"
    },
    {
        "id": "91",
        "name": "Talon"
    },
    {
        "id": "44",
        "name": "Taric"
    },
    {
        "id": "17",
        "name": "Teemo"
    },
    {
        "id": "412",
        "name": "Thresh"
    },
    {
        "id": "18",
        "name": "Tristana"
    },
    {
        "id": "48",
        "name": "Trundle"
    },
    {
        "id": "23",
        "name": "Tryndamere"
    },
    {
        "id": "4",
        "name": "TwistedFate"
    },
    {
        "id": "29",
        "name": "Twitch"
    },
    {
        "id": "77",
        "name": "Udyr"
    },
    {
        "id": "6",
        "name": "Urgot"
    },
    {
        "id": "110",
        "name": "Varus"
    },
    {
        "id": "67",
        "name": "Vayne"
    },
    {
        "id": "45",
        "name": "Veigar"
    },
    {
        "id": "161",
        "name": "Velkoz"
    },
    {
        "id": "254",
        "name": "Vi"
    },
    {
        "id": "234",
        "name": "Viego"
    },
    {
        "id": "112",
        "name": "Viktor"
    },
    {
        "id": "8",
        "name": "Vladimir"
    },
    {
        "id": "106",
        "name": "Volibear"
    },
    {
        "id": "19",
        "name": "Warwick"
    },
    {
        "id": "498",
        "name": "Xayah"
    },
    {
        "id": "101",
        "name": "Xerath"
    },
    {
        "id": "5",
        "name": "XinZhao"
    },
    {
        "id": "157",
        "name": "Yasuo"
    },
    {
        "id": "777",
        "name": "Yone"
    },
    {
        "id": "83",
        "name": "Yorick"
    },
    {
        "id": "350",
        "name": "Yuumi"
    },
    {
        "id": "154",
        "name": "Zac"
    },
    {
        "id": "238",
        "name": "Zed"
    },
    {
        "id": "115",
        "name": "Ziggs"
    },
    {
        "id": "26",
        "name": "Zilean"
    },
    {
        "id": "142",
        "name": "Zoe"
    },
    {
        "id": "143",
        "name": "Zyra"
    }
]

 

window.spellData = [
    {
        "id": "21",
        "Spellname": "SummonerBarrier"
    },
    {
        "id": "1",
        "Spellname": "SummonerBoost"
    },
    {
        "id": "14",
        "Spellname": "SummonerDot"
    },
    {
        "id": "3",
        "Spellname": "SummonerExhaust"
    },
    {
        "id": "4",
        "Spellname": "SummonerFlash"
    },
    {
        "id": "6",
        "Spellname": "SummonerHaste"
    },
    {
        "id": "7",
        "Spellname": "SummonerHeal"
    },
    {
        "id": "13",
        "Spellname": "SummonerMana"
    },
    {
        "id": "30",
        "Spellname": "SummonerPoroRecall"
    },
    {
        "id": "31",
        "Spellname": "SummonerPoroThrow"
    },
    {
        "id": "11",
        "Spellname": "SummonerSmite"
    },
    {
        "id": "39",
        "Spellname": "SummonerSnowURFSnowball_Mark"
    },
    {
        "id": "32",
        "Spellname": "SummonerSnowball"
    },
    {
        "id": "12",
        "Spellname": "SummonerTeleport"
    }
]