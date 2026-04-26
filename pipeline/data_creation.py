# https://clinicaltrials.gov/api/v2/studies?query.cond=cancer&pageSize=1000

# uncomment below to download pymongo
# ! pip3 install pymongo
import pymongo
from pymongo import MongoClient
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import requests
import zipfile
import os
import json
# from google.colab import userdata
from pymongo import UpdateOne

# for colab:
# username = userdata.get("MONGO_USER")
# password = userdata.get("MONGO_PASS")

# for local python file:
username = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
if not username or not password:
    raise ValueError("Missing MongoDB credentials. Set MONGO_USER and MONGO_PASS.")

uri = f"mongodb+srv://{username}:{password}@cluster0.fq5xe1i.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri)

db = client["api_studies"]

for collection in client["api_studies"].list_collection_names():
    client["api_studies"][collection].drop()
print("All previous collections cleared.")

for collection in client["synthea"].list_collection_names():
    client["synthea"][collection].drop()
print("All previous collections cleared.")

collection = db["cancer_trials_raw"]
collection.drop()

print("Collection cleared.")

import requests

collection = db["cancer_trials_raw"]

# clear old version first
collection.drop()

base_url = "https://clinicaltrials.gov/api/v2/studies"
params = {
    "query.cond": "cancer",
    "pageSize": 1000
}

response = requests.get(base_url, params=params, timeout=60)
response.raise_for_status()

data = response.json()

studies = data.get("studies", [])

print("Fetched", len(studies), "studies")

if studies:
    collection.insert_many(studies)
    print("Inserted studies into MongoDB")

print("Final count:", collection.count_documents({}))