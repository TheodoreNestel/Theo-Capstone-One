from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt


#setups to allow Bcrypt and sqlalchemy to function 
bcrypt = Bcrypt()
db = SQLAlchemy()


# Model ###############

class User(db.Model):

    __tablename__ = 'users'

    #we start with a unique id for each user being incremented automatically 
    id = db.Column(db.Integer , primary_key = True , autoincrement = True)

    #each user needs and email and it must be unique 
    email = db.Column(db.Text, nullable = False, unique = True)

    #this will be used to grab their LoL profile when they log in 
    username = db.Column(db.Text, nullable = False)

    #this is where we will store the password once its hashed 
    password = db.Column(db.Text,nullable = False)

    #######Functions#########

    #a function that will return info on the object 
    def __repr__(self):
        return f"<User #{self.id}: {self.username}, {self.email}>"

    #######class Functions###

    @classmethod
    def signup(cls, username, email, password): # a method for signing up users 
        """Sign up user.

        Hashes password and adds user to system.
        """

        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8') #we grab their password input and hash it 

        user = User( #then we grab the info passed in and slap it into a new User object 
            username=username,
            email=email,
            password=hashed_pwd,
            )

        db.session.add(user) #add if to our db.session
        return user #then we return the user back to app.py 


    @classmethod
    #wowow the bigbois this is the method used to let a user into their account if they provide the correct login details
    def authenticate(cls, email, password): #it takes in the class its in username and then a password 
        """Find user with `email` and `password`.

        This is a class method (call it on the class, not an individual user.) #this is important you call this on class since 
        #we dont know who we're login in yet 
        It searches for a user whose password hash matches this password
        and, if it finds such a user, returns that user object.

        If can't find matching user (or if password is wrong), returns False.
        """

        user = cls.query.filter_by(email=email).first() #filter our db by username and find the first match 

        if user:
            is_auth = bcrypt.check_password_hash(user.password, password) #do the password match for this user?
            if is_auth:
                return user #if its a match return the user 

        return False #otherwise False 




#Finally the logic to connect to our database 

def connect_db(app):
    """Connect this database to provided Flask app.

    You should call this in your Flask app.
    """

    db.app = app
    db.init_app(app)


#a helper function to help us update a user's password 

def change_password(password):

    new_hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')

    return new_hashed_pwd



    

