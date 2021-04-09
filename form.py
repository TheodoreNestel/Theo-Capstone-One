from flask.app import Flask
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField
from wtforms.validators import DataRequired, Email, Length , email_validator


#this is where we grab the data for our user 
class UserAddForm(FlaskForm):
    """Form for adding users."""

    username = StringField('League of Legends Username', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[Length(min=6)])

#this will be used to submit another user for comparison
class UsernameForm(FlaskForm):
    """form for adding another user for comparison"""
    username = StringField('Username', validators=[DataRequired()])

#a form used for login 
class LoginForm(FlaskForm):
    """Login form."""

    email = StringField('E-mail', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[Length(min=6)])


