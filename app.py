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
        flash("succesfully logged out") 





@app.route("/signup", methods=["GET","POST"])
def signup():
    """handles the signup form and creates a new user in our db"""
    form = UserAddForm()

    if form.validate_on_submit():
        try: 
            user = User.signup(email = form.email.data , username = form.username.data , password = form.password.data)
            db.session.commit()

    
        except IntegrityError:
            flash("Email already in use", 'danger')
            return render_template('signup_form.html', form = form) 

        login(user) #we pass in the newly commited user object and then redirect home 
        return render_template("index.html") #TODO: bring to actual user page where their data will be 

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
            flash(f"You have succesfully logged in {user.username}") # we flash them a message 
            return redirect("/")#TODO: make the page for logged in users 


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
        if user: #if authenticate above returns a user object then we update the user's info in our db 
            user.username = new_username
            user.password = change_password(new_password)
            db.session.add(user)
            db.session.commit()
            return redirect("/")
        
    else:
        return render_template("edit_user.html" , form = form )

        
    


#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



#Routes #####################

@app.route("/")
def not_signed_in_homepage():
    """this serves our homepage when a user goes to our website by default they wont be signed in"""
    #todo add logic to decide which homepage to serve based on the satus of g 
    form = UsernameForm()

    if not g.user:  #if we arent logged in show the default home page
        return render_template("home.html",  form = form )

    return render_template("user_page.html")




#RESTful api routes ***********************

@app.route("/get_user_profile", methods=["POST","GET"])
def get_lol_user():
    """this will make a call to an api to get a user's profile based on the username they provided"""
    #todo grab the data from the main page form that contains the region and username to make our first query 
    #to the riot api to get their account info then from there make a second call to get that user's match history 
    #then serve that data to the user 

    #on the back end we will also store all the data we got back as a local object 

    #inside that new template will be a second form to add a second user from that same region 
    #if another username is run through we run the logic above again with the new username and then display 
    #both user's data side by side 

    #NOTE: a smart thing to do might be having the query be put inside its own function that return the data from the api
    #that way we can call it multiple times 

    #NOTE: if two username are entered both should be stored in objects that can be reached anywhere 
    return render_template("user_page.html")

@app.route("/compare_user")
def compare():
    return #an object that can be added on the user_page.html with data that is compared 

@app.route("/edit_userinfo")
def update():
    return #Add a route that changes the username of the user 

#******************************************


#Helper function not route or api based ################

########################################################

