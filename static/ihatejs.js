//DOM elements 

const user1Container = $("#user1_data");

const user2Container = $("#user2_data");

const user2Form = $("#user_form")

const vsForm = $("#vs_form")



async function fetchRiotData(region, username){
    const res = await axios.post("/api/get_user_profile" , {region , username})
    
    return res.data[0];
}

function $(selector){
  const elements =  document.querySelectorAll(selector);
  return elements.length > 1 ? elements : elements[0];
}



async function displayDataUser1(){

    const data = await fetchRiotData(window.user.region , window.user.username);

    console.log(data);




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
    </tbody>
  </table> `;

   const matches = data.MatchHistory.matches.map((match,i)=> {
       if(i > 10 ){
           return ""
       }
    return `<tr>
    <td>${match.champion}</td>
    <td>${match.queue}</td>
    <td>${match.gameId}</td>
    
            </tr>`

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
    </tbody>
  </table> `;

   const matches = data.MatchHistory.matches.map((match,i)=> {
       if(i > 10 ){
           return ""
       }
    return `<tr>
    <td>${match.champion}</td>
    <td>${match.queue}</td>
    <td>${match.gameId}</td>
            </tr>`

    })
    user2Container.querySelector("tbody").insertAdjacentHTML("afterBegin" , matches.join(""))
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

