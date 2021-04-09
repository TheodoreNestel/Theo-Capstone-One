from sqlalchemy import exc
from form import UserAddForm
from flask import Flask , render_template , redirect , request ,jsonify , session , g , flash 
import requests
import os  
from models import User , connect_db , db 
from sqlalchemy.exc import IntegrityError
from form import UserAddForm , UsernameForm , LoginForm 





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

################################


#authentication routes $$$$$$$$$$$$$$$
#TODO implement sign up , login / log out features using g and wtform 

@app.route("/signup", methods=["GET","POST"])
def signup():
    """handles the signup form and creates a new user in our db"""
    form = UserAddForm()

    if form.validate_on_submit():
        try: 
            user = User.signup(email = form.email.data , username = form.username.data , password = form.password.data)
            db.session.commit()

            #TODO ADD LOGIN 
            return redirect("/")

        except IntegrityError:
            flash("Email already in use", 'danger')
            return render_template('signup_form.html', form = form) 
    else:
        return render_template("signup_form.html", form=form)


@app.route("/login",methods=["GET","POST"])
def login():
    """Handles the login"""
    form = LoginForm()

    return render_template("login.html" , form = form )


@app.route("/logout")
def logout():
    #this should log our the user flash a message and then send them back to the homepage 
    return redirect("/")

#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



#Routes #####################

@app.route("/")
def not_signed_in_homepage():
    """this serves our homepage when a user goes to our website by default they wont be signed in"""
    #todo add logic to decide which homepage to serve based on the satus of g 
    form = UsernameForm()
    return render_template("home.html",  form = form )




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

#******************************************


#Helper function not route or api based ################

########################################################

