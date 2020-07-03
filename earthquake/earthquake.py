#!/usr/bin/env python
# coding: utf-8

# 1. Dependencies
# ----------------------------------
# Import the OS Library
import os
# Import numpy library
import numpy as np
# Import pandas library
import pandas as pd

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
# Import the method used for connecting to DBs
from sqlalchemy import create_engine, func
# Allow us to declare column types
from sqlalchemy import Column, Integer, String, Float
# Import the methods needed to abstract classes into tables
from sqlalchemy.ext.declarative import declarative_base
# Import Session to bind to the DB
from sqlalchemy.orm import Session


from flask import Flask, render_template, jsonify

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

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

# The below code is used to find the cwd and change it as required
# OS command to get the cwd and change the cwd
# ---------------------------------------------
# Get the current wroking directory
# os.getcwd()
# In the path the backward slash (\) needs to be escaped with another backslash (\)
# os.chdir("C:\\Users\\sanji\\Documents\\project\\p2-earthquake-visualization\\earthquake")
# Verify the cwd after the change
# os.getcwd()


# 2. Processing of the data file
# ----------------------------------
# Define the raw data csv file to load, process and later save it to the database
# ----------------------------------------------
earthquake_csv = "static/data/earthquake.csv"

# Read the csv data file into pandas dataframe
# ------------------------------------------------
earthquake_df = pd.read_csv(earthquake_csv, encoding="ISO-8859-1")

# Show just the header
# ------------------------
earthquake_df.head()

# Get the columns in the dataFrame
# ---------------------------------------------------------------
earthquake_df.columns

# Specify the columns that will need to be loaded into the table
# ---------------------------------------------------------------
edited_earthquake_df = earthquake_df[['ID', 'FLAG_TSUNAMI', 'YEAR', 'EQ_PRIMARY', 'INTENSITY', 'COUNTRY', 'STATE', 'LOCATION_NAME', 'LATITUDE', 'LONGITUDE', 'REGION_CODE', 'REGION',
                                      'TOTAL_DEATHS_DESCRIPTION', 'TOTAL_MISSING_DESCRIPTION', 'TOTAL_INJURIES_DESCRIPTION', 'TOTAL_DAMAGE_DESCRIPTION', 'TOTAL_HOUSES_DESTROYED_DESCRIPTION', 'TOTAL_HOUSES_DAMAGED_DESCRIPTION']]

# Show just the header
# ------------------------

edited_earthquake_df.head()

# Get the columns in the dataFrame
# ---------------------------------------------------------------
edited_earthquake_df.columns

# Rename the DataFrame columns
# ---------------------------------
edited2_earthquake_df = edited_earthquake_df.rename(columns={
    'ID': 'id',
    'FLAG_TSUNAMI': 'tsunami_fl',
    'YEAR': 'year',
    'EQ_PRIMARY': 'magnitude',
    'INTENSITY': 'intensity',
    'COUNTRY': 'country',
    'STATE': 'state',
    'LOCATION_NAME': 'location',
    'LATITUDE': 'lat',
    'LONGITUDE': 'lng',
    'REGION_CODE': 'region_cd',
    'REGION': 'region',
    'TOTAL_DEATHS_DESCRIPTION': 'total_deaths_desc',
    'TOTAL_MISSING_DESCRIPTION': 'total_missing_desc',
    'TOTAL_INJURIES_DESCRIPTION': 'total_injuries_desc',
    'TOTAL_DAMAGE_DESCRIPTION': 'total_damage_desc',
    'TOTAL_HOUSES_DESTROYED_DESCRIPTION': 'total_houses_destroyed_desc',
    'TOTAL_HOUSES_DAMAGED_DESCRIPTION': 'total_houses_damaged_desc'
})

edited2_earthquake_df.head()

# 3. Section for the SQLAlchemy/SQLite code
# ----------------------------------
# Create Class - Earthquake
# ---------------------------------------------
# Set an object to utilize the default declarative base in SQL Alchemy
Base = declarative_base()

# Creates Class which will serve as the anchor point for the Table


class Earthquake(Base):
    __tablename__ = 'earthquake'
    id = Column(Integer, primary_key=True)
    tsunami_fl = Column(Integer, nullable=False)
    year = Column(String(10))
    magnitude = Column(Integer)
    intensity = Column(Float)
    country = Column(String(55), nullable=False)
    state = Column(String(55))
    location = Column(String(55))
    lat = Column(Float)
    lng = Column(Float)
    region_cd = Column(String(55), nullable=False)
    region = Column(String(55), nullable=False)
    total_deaths_desc = Column(String(255))
    total_missing_desc = Column(String(255))
    total_injuries_desc = Column(String(255))
    total_damage_desc = Column(String(255))
    total_houses_destroyed_desc = Column(String(255))
    total_houses_damaged_desc = Column(String(255))


# Create Database Connection
# ----------------------------------
conn_string = "sqlite:///static/data/earthquake.sqlite"
engine = create_engine(conn_string, echo=True)
conn = engine.connect()

# Create a "Metadata" Layer that Abstracts the SQL Database
# ----------------------------------
# Create (if not already in existence) the tables associated with our classes.
Base.metadata.create_all(engine)

# Use this to clear out the db
# ----------------------------------
# Base.metadata.drop_all(engine)

# Create a Session Object to Connect to DB
# ----------------------------------
# Session is a temporary binding to our DB
session = Session(bind=engine)

# Export the Dataframe to sqlite database
edited2_earthquake_df.to_sql(
    'earthquake', conn, if_exists='replace', index=False)

# Commit records in database
session.commit()

# Create a new connection to query the data from the database
# use a for loop to display all eth queried records

# 4. Reading the data from the database
#    Update the SQL as required.
# ----------------------------------
with conn as con:
    rs = con.execute("""SELECT * FROM earthquake limit 5;""")
    for row in rs:
        print(row)
# Close the connection when done querying
con.close()


if __name__ == '__main__':
    app.run(debug=True)
