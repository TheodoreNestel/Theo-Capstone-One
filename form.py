from flask.app import Flask
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField
from wtforms import validators
from wtforms.fields.core import SelectField
from wtforms.validators import DataRequired, Email, Length , email_validator ,Optional 


REGIONS = [("na1","NA"),("eun1","EUN"),("euw1","EUW"),("jp1","JP"),("kr","KR"),("la1","LA 1"),("la2","LA 2"),("br1","BR"),("oc1","OC"),("tr1","TR"),("ru","RU")]


#this is where we grab the data for our user 
class UserAddForm(FlaskForm):
    """Form for adding users."""

    username = StringField('League of Legends Username', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[Length(min=6)])
    region = SelectField('Region', choices=REGIONS ,validators=[DataRequired()]) 

#this will be used to submit another user for comparison
class UsernameForm(FlaskForm):
    """form for adding another user for comparison"""
    username = StringField('Username', validators=[DataRequired()])
    region = SelectField('Region', choices=REGIONS ,validators=[DataRequired()])

#a form used for login 
class LoginForm(FlaskForm):
    """Login form."""

    email = StringField('E-mail', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[Length(min=6)])

class UserDetailForm(FlaskForm):
    """update user info"""

    new_username = StringField('New LoL Username' ,validators=[Optional()])
    new_password = PasswordField('New Password', validators=[Length(min=6),Optional()])
    current_password = PasswordField('Current Password', validators=[Length(min=6)])
    new_region = SelectField('Region', choices=REGIONS ,validators=[DataRequired() , Optional()])
    
    

