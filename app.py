from flask.globals import current_app
from flask.templating import render_template_string
from sqlalchemy import exc
from form import UserAddForm
from flask import Flask , render_template , redirect , request ,jsonify , session , g , flash 
import requests
import os  
from models import User , connect_db , db  , change_password
from sqlalchemy.exc import IntegrityError
from form import UserAddForm , UsernameForm , LoginForm , UserDetailForm 





#okay lets get started on this app !!! 

#SET UPS #######################
app = Flask(__name__)

# Get DB_URI from environ variable (useful for production/testing) or,
# if not set there, use development local db.
app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgresql:///lolvs')) #postgres this version of sqlalchemy requires postgresql instead of just postgres
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "it's a secret") #pls change this if this goes into prod


connect_db(app)

CURR_USER = "current_user" #we will slap this in our sessions to see if a user is logged in 

RIOT_API_KEY = "RGAPI-235c0fbb-10ec-4fef-b3f5-64ef2d9b9590" #This will have to be changed every 24h 

################################


#authentication routes $$$$$$$$$$$$$$$
#TODO implement sign up , login / log out features using g and wtform 
@app.before_request 

def add_user_to_g():
 #here is where we add our current user to our g storage bin
    """if user is logged in add the user to flask global : g """
    if CURR_USER in session: #if we see that CURR_USER is our session then we grab our user object 
        g.user = User.query.get(session[CURR_USER]) #this essentially queries by id in the user model 
    
    else:
        g.user = None #if we dont have an id you cant add anything to flask global 


def login(user):
    """log in a user"""

    session[CURR_USER] = user.id #we grab the id from the passed in user and slap it into our session

def do_logout():
    """Logout user."""
    #when this function is called log out the user 
    if CURR_USER in session: #checks to see if there CURR user is in session if it is we can log a user out 

        del session[CURR_USER] #delete the session and flash a bye message 
        flash("succesfully logged out" , "success" ) 





@app.route("/signup", methods=["GET","POST"])
def signup():
    """handles the signup form and creates a new user in our db"""
    form = UserAddForm()

    if form.validate_on_submit():
        try: 
            user = User.signup(email = form.email.data , username = form.username.data , password = form.password.data , region = form.region.data)
            db.session.commit()

    
        except IntegrityError:
            flash("Email already in use", 'danger')
            return render_template('signup_form.html', form = form) 

        login(user) #we pass in the newly commited user object and then redirect home 
        return redirect("/") #TODO: bring to actual user page where their data will be 

    else:
        return render_template("signup_form.html", form=form)


@app.route("/login",methods=["GET","POST"])
def login_form():
    """Handles the login"""
    form = LoginForm()
    if form.validate_on_submit(): #if the form is submitted then 
        user = User.authenticate(form.email.data , form.password.data) # we pass in email and password to out authenticate func
        #located in the user model 
        if user: #if authenticate returns an object we're in ! 
            login(user) #we login that user based on the object sent through by authenticate 
            flash(f"You have succesfully logged in {user.username}" , "success") # we flash them a message 
            return redirect("/")#TODO: make the page for logged in users 
        else:
            flash("invalid credentials please try again" , "warning")


    return render_template("login.html" , form = form )


@app.route("/logout")
def logout():
    """handles logout"""
    #this should log our the user flash a message and then send them back to the homepage 
    do_logout()
    return redirect("/")

@app.route("/edit_info" , methods=["GET","POST"])
def edit_info():
    """lets a user change their account info"""
    
    #TODO: use front end java script to make it possible to change username without changing passwords 


    if not g.user: #makes sure there is a logged in user 
        flash("Access unauthorized.", "danger")
        return redirect("/")

    
    form = UserDetailForm()

    if form.validate_on_submit(): #if the user submits the update form 
        curr_password = form.current_password.data #grab their current password so we can authenticate them 
        user = User.authenticate(g.user.email , curr_password) #get the user object after we make sure they have the correct password
        #then we grab all the data from the form 
        new_username = form.new_username.data
        new_password = form.new_password.data
        new_region = form.new_password.data
        if user: #if authenticate above returns a user object then we update the user's info in our db 
            if new_username:
                user.username = new_username
            if new_password:
                user.password = change_password(new_password)
            if new_region:
                user.region = new_region
            db.session.add(user)
            db.session.commit()
            return redirect("/")
        
    else:
        current_user = User.query.get(g.user.id) #we pass the user object so we can populate the edit page form inputs 
        return render_template("edit_user.html" , form = form,current_user = current_user  )

        
    


#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



#Routes #####################

@app.route("/")
def not_signed_in_homepage():
    """this serves our homepage when a user goes to our website by default they wont be signed in"""
    #todo add logic to decide which homepage to serve based on the satus of g 
    form = UsernameForm()


    
    if g.user:  #if we are logged in show the default home page
        
        username = g.user.username
        region = g.user.region
        id = g.user.id 
        user = {'username':username , 'region':region , 'id':id}

        return render_template("user_page.html" ,user=user , form=form)


    return render_template("home.html" , form = form)


@app.route("/user")
def get_user_not_logged():
    """This route is used to find user's username and serve them a page if they arent logged in """

    form = UsernameForm()

    username = request.args.get("username")
    region = request.args.get("region")
    user = {'username':username,'region':region}

    return render_template("user_page.html" , user=user , form=form)



#RESTful api routes ***********************

@app.route("/api/get_user_profile", methods=["POST","GET"])
def get_lol_user():
    """this will make a call to an api to get a user's profile based on the username they provided
        this will return 100 matches"""

    #using front end magic we will only present 10 to start

    #variables we will need for the query strings 
    end_index = 10 #by default we only want the last 10 games
    begin_index = 0 #by default this is 0 but if we want to load more data we can change this to what end index was before


    region = request.json["region"] #Users have to select which region they're in as the data will differ 
    
    username = request.json["username"]  

    response = {} # we declare our response object before we fill it with the data we need 

    riot_account_resp = requests.get(f"https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{username}?api_key={RIOT_API_KEY}")

    

    if riot_account_resp.status_code == 404:
        response["err"] = {
           "summoner_error" : "summoner not found",
           "summoner": username
        }

        return jsonify(response)

        


    riot_account_id = riot_account_resp.json()["accountId"] #this is a string containing the accountId we will use to pull match history

    #now that we have to accountId we can query for match history 
    riot_account_match_history = requests.get(f"https://{region}.api.riotgames.com/lol/match/v4/matchlists/by-account/{riot_account_id}?api_key={RIOT_API_KEY}")
    #this returns an object with a key of matches and a list of matches objects 

    #for now that is all we need from the back end
    #to make sense of all the data we will use a tool called Datadragon but we will use this on the front end
    
    #lets assemble a response that the front end can make sense of 

    response["AccountInfo"] = riot_account_resp.json()
    response["MatchHistory"] = riot_account_match_history.json()

    #this will create a massive object with all the data from both our calls which will dissect in the front end 
    #will adding assets from the DataDragon tool from riot 

    return  jsonify(response ,201) # return our object with the match data and the account info 


@app.route("/api/get_leaderboards" , methods=["POST","GET"])
def get_leaderboards():
    """Get the current leaderboard"""
    region = request.json["region"] #format: na1 , eun1 
    queue = request.json["queue"] #format: RANKED_FLEX_SR


    response = {}
    leaderboard = requests.get(f"https://{region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/{queue}?api_key={RIOT_API_KEY}")
    response["Leaderboards"] = leaderboard.json()
    return jsonify(response, 201)

@app.route("/api/get_match", methods=["POST","GET"])
def get_match():

    """Return details about a specific match """
    region = request.json["region"] #format: na1 , eun1
    matchId = request.json["matchId"] #this is called GameId in the match history objects

    response = {}
    match_info = requests.get(f"https://{region}.api.riotgames.com/lol/match/v4/matches/{matchId}?api_key={RIOT_API_KEY}")
    response["gameId"] = matchId
    response["gameInfo"] = match_info.json()

    print(region)
    return jsonify(response,201)


#all the routes I will need now exist however I need to fix the way REGION is set 
#Ideally it gets set once by the user at the start and 'were good go 




#******************************************


#Helper function not route or api based ################

########################################################



#TODO 
# - Add error checking if the front end passes a username or values that wont work on the riot api
#return the client an error object that tells them it no work 




