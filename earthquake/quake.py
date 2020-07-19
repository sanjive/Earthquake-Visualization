#!/usr/bin/env python
# encoding: utf-8

# 1. Dependencies
# ----------------------------------
import os
import json
from flask import Flask, request, render_template, jsonify
import pymongo

# Reference the json data file
data_file = "static/data/quake_cleaned.geojson"

# Create Flask connection "app" variable
app = Flask(__name__)

# Create connection variable to localhost on port 27017
# conn = "mongodb://localhost:27017"
# Use the below connection to connect to the MongoDB in the cloud
# client = pymongo.MongoClient("mongodb+srv://sanmongo:<password>@cluster0.8nfps.mongodb.net/<dbname>?retryWrites=true&w=majority")
# db = client.test ()
conn = "mongodb+srv://sanmongo:M0ng0DB%21%40@cluster0.8nfps.mongodb.net/test?retryWrites=true&w=majority"

#################################################
# Flask Routes
#################################################

@app.route('/')
def home():
  return render_template(
    # name of template
    "index.html"
  )

@app.route('/hello/<name>')
def hello_name(name):
    return 'Hello ' + name + '!'
# Use connection to create a mongo client instance.
client = pymongo.MongoClient(conn)


# The below code is used to find the cwd and change it as required
# OS command to get the cwd and change the cwd
# ---------------------------------------------
# Get the current wroking directory
# os.getcwd()
# In the path the backward slash (\) needs to be escaped with another backslash (\)
# os.chdir("C:\\Users\\sanji\\Documents\\project\\p2-earthquake-visualization\\earthquake")
# Verify the cwd after the change
# os.getcwd()

# Connect to the database "earthquake" (Will create one if not already available).
db = client.earthquake_db

# Drops collection "earthquake", if available (Prevents duplicate records being inserted)
db.earthquake.drop()

# set the collection to "earthquake"
collection = db.earthquake

# Print the Mongo DB and Collection information to the terminal
print('\nConnected to MongoDb Database:', db)
print('\nUsing MongoDb Collection:', collection)

# Loading or Opening the json file
with open(data_file) as file:
    json_file_data = json.load(file)

# load the data from the json data file in to the collection
# If the json data file contains more than one record than use
# insert_many or else if there is one record than use insert_one
if isinstance(json_file_data, list):
    collection.insert_many(json_file_data)
else:
    collection.insert_one(json_file_data)

if __name__ == "__main__":
    app.run(debug=True)
