# Pipeline

API json -> mongoDB -> modeling

## Data Preparation & Loading into MongoDB

Load in csvs from https://clinicaltrials.gov/api/v2/studies?query.cond=cancer&pageSize=1001


```python
import logging

logging.basicConfig(
    filename="pipeline.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logging.info("Pipeline started")
```


```python
# https://clinicaltrials.gov/api/v2/studies?query.cond=cancer&pageSize=1001

# uncomment below to download pymongo
! pip3 install pymongo
!pip install python-dotenv
import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import requests
import zipfile
import os
import json
# from google.colab import userdata
from pymongo import UpdateOne

logging.info("------Data Preparation------")
```

    Requirement already satisfied: pymongo in /Users/kaylakim/miniconda3/lib/python3.12/site-packages (3.12.0)
    
    [1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m25.0.1[0m[39;49m -> [0m[32;49m26.0.1[0m
    [1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
    Requirement already satisfied: python-dotenv in /Users/kaylakim/miniconda3/lib/python3.12/site-packages (1.0.1)
    
    [1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m25.0.1[0m[39;49m -> [0m[32;49m26.0.1[0m
    [1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m



```python
# for colab:
# username = userdata.get("MONGO_USER")
# password = userdata.get("MONGO_PASS")

# for local python file: uses dotenv from .evn file within root dir ../ 
# (I will not provide my password or user to a public repository. email me please if you'd like access)
load_dotenv()

username = os.getenv("MONGO_USER")
password = os.getenv("MONGO_PASS")
if not username or not password:
    raise ValueError("Missing MongoDB credentials. Set MONGO_USER and MONGO_PASS.")

uri = f"mongodb+srv://{username}:{password}@cluster0.fq5xe1i.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri)

db = client["api_studies"]

logging.info("loaded in mongoDB credentials")
```


```python
# drop from prior entries to make void database
for collection in client["api_studies"].list_collection_names():
    client["api_studies"][collection].drop()
print("All previous collections cleared.")

for collection in client["synthea"].list_collection_names():
    client["synthea"][collection].drop()
print("All previous collections cleared.")

collection = db["cancer_trials_raw"]
collection.drop()

print("Collection cleared.")
logging.info("Collection cleared.")
```

    All previous collections cleared.
    All previous collections cleared.
    Collection cleared.


get the data from the api


```python
import requests

collection = db["cancer_trials_raw"]

# clear old version first again
collection.drop()

# grab API and how many we want for entries
base_url = "https://clinicaltrials.gov/api/v2/studies"
params = {
    "query.cond": "cancer",
    "pageSize": 1001
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

logging.info(f"Final count: {collection.count_documents({})}")


# grab 1 more for 1001+ rubric item point

next_token = data.get("nextPageToken")

if next_token:
    params["pageToken"] = next_token
    params["pageSize"] = 1

    response2 = requests.get(base_url, params=params, timeout=60)
    data2 = response2.json()

    extra_studies = data2.get("studies", [])

    if extra_studies:
        collection.insert_many(extra_studies)
        print("Inserted extra study")

print("Final count:", collection.count_documents({}))

logging.info(f"ADDED 1 MORE ENTRY & Final count: {collection.count_documents({})}")

```

    Fetched 1000 studies
    Inserted studies into MongoDB
    Final count: 1000
    Inserted extra study
    Final count: 1001


got 1001 studies inserted into mongo DB.

## Query


```python
docs = list(collection.find())

rows = []

# `protocolSection`, `statusModule`, `designModule`, `sponsorCollaboratorsModule`, `contactsLocationsModule`, `overallStatus`, `phases`, `enrollmentInfo.count`, `leadSponsor.class`, `locations`, 
for doc in docs:
    protocol = doc.get("protocolSection", {})

    status = protocol.get("statusModule", {})
    design = protocol.get("designModule", {})
    sponsor = protocol.get("sponsorCollaboratorsModule", {})
    contacts = protocol.get("contactsLocationsModule", {})

    # target variable
    overall_status = status.get("overallStatus")

    if overall_status == "COMPLETED":
        success = 1
    elif overall_status in ["TERMINATED", "WITHDRAWN"]:
        success = 0
    else:
        success = None  # ongoing trials

    # features
    phases = design.get("phases", [])
    phase = phases[0] if phases else None

    enrollment = design.get("enrollmentInfo", {}).get("count")

    sponsor_class = sponsor.get("leadSponsor", {}).get("class")

    locations = contacts.get("locations", [])
    location_count = len(locations) if isinstance(locations, list) else 0

    logging.info(f"Queried for `protocolSection`, `statusModule`, `designModule`, `sponsorCollaboratorsModule`, `contactsLocationsModule`, `overallStatus`, `phases`, `enrollmentInfo.count`, `leadSponsor.class`, `locations`")


    # `success`, `phase`, `enrollment`, `sponsor_class`, `location_count`
    rows.append({
        "success": success,
        "phase": phase,
        "enrollmentCount": enrollment,
        "leadSponsorClass": sponsor_class,
        "locationCount": location_count
    })

    logging.info(f"using `success`, `phase`, `enrollment`, `sponsor_class`, `location_count` for modeling")


df = pd.DataFrame(rows)

logging.info("Created df from the modeling features above")

print(df.head())
```

       success   phase  enrollmentCount leadSponsorClass  locationCount
    0      1.0  PHASE1              6.0         INDUSTRY              1
    1      1.0  PHASE2            132.0         INDUSTRY             16
    2      0.0  PHASE1              0.0              NIH              0
    3      NaN      NA            100.0            OTHER              1
    4      1.0  PHASE1             11.0            OTHER              1



```python
# removing entries with no success/failures and is just na
df = df[df["success"].notna()]
print(df.head())

logging.info("rmoved nas from entries where it's na for success")
```

       success   phase  enrollmentCount leadSponsorClass  locationCount
    0      1.0  PHASE1              6.0         INDUSTRY              1
    1      1.0  PHASE2            132.0         INDUSTRY             16
    2      0.0  PHASE1              0.0              NIH              0
    4      1.0  PHASE1             11.0            OTHER              1
    5      1.0  PHASE2             20.0            OTHER              1



```python
# convert to numeric
df["enrollmentCount"] = pd.to_numeric(df["enrollmentCount"], errors="coerce")

# drop missing
df = df.dropna()

# one-hot encode categorical variables
df_encoded = pd.get_dummies(df, columns=["phase", "leadSponsorClass"], drop_first=True)

print(df_encoded.head())

logging.info("converted enrollment to numeric and phase and sponsorclass into one hot encoded")
```

       success  enrollmentCount  locationCount  phase_NA  phase_PHASE1  \
    0      1.0              6.0              1     False          True   
    1      1.0            132.0             16     False         False   
    2      0.0              0.0              0     False          True   
    4      1.0             11.0              1     False          True   
    5      1.0             20.0              1     False         False   
    
       phase_PHASE2  phase_PHASE3  phase_PHASE4  leadSponsorClass_INDUSTRY  \
    0         False         False         False                       True   
    1          True         False         False                       True   
    2         False         False         False                      False   
    4         False         False         False                      False   
    5          True         False         False                      False   
    
       leadSponsorClass_NETWORK  leadSponsorClass_NIH  leadSponsorClass_OTHER  \
    0                     False                 False                   False   
    1                     False                 False                   False   
    2                     False                  True                   False   
    4                     False                 False                    True   
    5                     False                 False                    True   
    
       leadSponsorClass_OTHER_GOV  leadSponsorClass_UNKNOWN  
    0                       False                     False  
    1                       False                     False  
    2                       False                     False  
    4                       False                     False  
    5                       False                     False  


## Solution Analysis & Model Train/Fit


```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix

logging.info("--------MODELING---------")

# train test split (80/20)
X = df_encoded.drop("success", axis=1)
y = df_encoded["success"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

logging.info("done train test split on X and y with target as success")

# mdoel fit and prediction
model = LogisticRegression(max_iter=1001)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

logging.info("fit and predicted with logistic regression")

# accuracy/confusion matrx metrics
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

logging.info(f"accuracy: {accuracy_score(y_test, y_pred)}\nconfusion matrix: {confusion_matrix(y_test, y_pred)}")
```

    Accuracy: 0.7222222222222222
    Confusion Matrix:
     [[ 8 17]
     [ 8 57]]


## Analysis Complexity

cross-validation: (We are cross validating to find the best LogisticRegression model with the best accuracy score f1 or just mean)


```python
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression

logging.info("--------CROSS VALIDATION---------")

# model and fit for accuracy score against the F1 version later
model = LogisticRegression(max_iter=1001)

scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")

print("CV Accuracy scores:", scores)
print("Mean CV accuracy:", scores.mean())

logging.info(f"CV Accuracy scores: {scores}\nMean CV accuracy: {scores.mean()}")
```

    CV Accuracy scores: [0.75555556 0.78888889 0.75555556 0.8        0.76404494]
    Mean CV accuracy: 0.7728089887640449



```python
from sklearn.model_selection import StratifiedKFold, cross_val_score

# cross validation with stratified kfold like taught in ml2
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y, cv=cv, scoring="f1")

print("F1 scores:", scores)
print("Mean F1:", scores.mean())

logging.info(f"F1 scores: {scores}\nMean F1: {scores.mean()}")
```

    F1 scores: [0.85915493 0.86111111 0.85915493 0.83221477 0.82608696]
    Mean F1: 0.8475445383776903


F1 balances precision and recall, especially when classes are imbalanced, which is why the F1 scores may appear to be higher than the cross-validation accuracy scores above. With a mean F1 score around 0.84, this means that there is a strong balance between correctly predicting completed trials and correctly identifying failed trials. This also means that across the 5 folds, the F1 scores were consistent around that mean (they were very similar when run), indicating stable model performance.

This was using LogisticRegression from sklearn.linear_model. 

## Analysis rationale

I started my analysis and model training by performing the necessary imports and then setting up credentials to my Mongo database using environment variables (NOTE: you must have the password and username in a ../.env file in order to operate this notebook, and they are not publicly available in this repository). Since I am using a free-tier MongoDB database, I cleared all previously loaded data to ensure a clean and reproducible environment. This created an empty document model database for loading data from ClinicalTrials.gov studies. Finally, I loaded 1001 entries from https://clinicaltrials.gov/api/v2/studies into the MongoDB database using pymongo. I chose 1001 studies due to storage limitations of the free-tier database, while also meeting the assignment requirement of having more than 1000 documents.

I then extracted fields from each document, including `protocolSection`, `statusModule`, `designModule`, `sponsorCollaboratorsModule`, and `contactsLocationsModule`. From these, I derived the features `success`, `phase`, `enrollmentCount`, `leadSponsorClass`, and `locationCount`, as they were either directly relevant or most likely to influence trial completion. The `success` variable was constructed from `overallStatus`, where completed trials were labeled as 1 and terminated or withdrawn trials were labeled as 0. To prepare the data for modeling, I removed entries with undefined `success` values (corresponding to ongoing trials), converted `enrollmentCount` to a numeric type, and applied one-hot encoding to categorical variables such as `phase` and `leadSponsorClass`.

Logistic regression was used because the target variable in this project is binary, representing whether a clinical trial is completed or not. This makes logistic regression a natural choice, as it is specifically designed for binary classification problems. Additionally, logistic regression is easily interpretable, allowing us to understand how features such as trial phase, sponsor class, and enrollment size influence the probability of completion. This interpretability is important in this context, since stakeholders may want to understand why certain trials are predicted to succeed or fail. Finally, logistic regression is computationally efficient and performs well on smaller to medium-sized datasets, making it appropriate for this project.

I initially evaluated the model using accuracy and a confusion matrix to assess overall performance and classification behavior. However, due to class imbalance in the dataset, I also used the F1 score to better capture the balance between precision and recall. Based on my machine learning coursework, I applied sklearn’s `StratifiedKFold` and `cross_val_score` to compute cross-validated F1 scores, providing a more robust assessment of model performance across multiple data splits.

## Visualizations


```python
# refit model to work
model.fit(X, y)

# feature importance via variable coefficient in logistic regression model
importance = pd.Series(model.coef_[0], index=X.columns)
importance.sort_values().plot(kind="barh", figsize=(8,6), color='forestgreen')

plt.gca().spines['top'].set_visible(False)
plt.gca().spines['right'].set_visible(False)
plt.gca().spines['top'].set_visible(False)

plt.title("Feature Importance for Trial Completion Prediction")
plt.show()

logging.info("plotted feature importance with coefficients from logreg")
```


    
![png](pipeline_files/pipeline_24_0.png)
    



```python
import seaborn as sns
from sklearn.metrics import confusion_matrix

# confusion matrix for prediction of the model
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(6,5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Greens")

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix for Trial Completion Prediction")

plt.show()

logging.info("plotted confusion matrix of logreg")
```


    
![png](pipeline_files/pipeline_25_0.png)
    


## Visualization Rationale

To support model interpretation and evaluation, I included both a feature importance chart and a confusion matrix for the trained logistic regression model. 

The feature importance graph was constructed using the model’s learned coefficients in the logistic regression model, which reflect how each feature contributes to predicting trial completion. This allows us to understand which factors, such as trial phase or sponsor class, have the strongest positive or negative influence on whether a clinical trial is predicted to complete. By visualizing these coefficients in a horizontal bar chart, it becomes easier to compare the relative magnitude and direction of each feature’s impact.

In addition, I included a confusion matrix to evaluate the predictive performance of the model. The confusion matrix shows how many trials were correctly and incorrectly classified as completed or not completed. From this, we can observe that the model performs well at identifying completed trials, but has more difficulty correctly identifying failed trials, as shown by the higher number of false positives. I chose to include this visualization to highlight both the strengths and limitations of the model in distinguishing between successful and unsuccessful trials.

These two charts show the overall pipeline where the feature importance chart explains how the model makes predictions, while the confusion matrix shows how well those predictions align with the true outcomes. This chart combination provides both interpretability and performance insight, which is important for understanding how the model could be used in practice for clinical trial evaluation and funding decisions.

## Does the Pipeline Solve the Problem?

The specified problem of this project is, “Can we predict whether a cancer-related clinical trial will successfully complete or be terminated early based on its study design characteristics and trial metadata?”

Ultimately, the results suggest that the answer is yes, to a certain extent. Based on the accuracy score, mean F1 score, and confusion matrix results, the model is able to correctly classify many completed and non-completed studies. The accuracy score before cross-validation was approximately 0.72, while the mean F1 score was around 0.84, which indicates strong performance. This is especially when I accounted for class imbalance.

In the end, this means that it is possible to use study attributes such as sponsor type, trial phase, and enrollment size to predict whether a clinical trial is likely to complete. However, the confusion matrix shows that the model performs better at identifying completed trials than failed ones, meaning predictions are not perfectly reliable, especially for unsuccessful outcomes. This limitation is influenced by the dataset, which contains more completed trials than incomplete ones.

Overall, the pipeline demonstrates that predicting clinical trial completion is feasible using some metadata, and the model provides useful, though not perfect, insights that could support decision-making with a model like in this project in clinical research and funding allocation.
