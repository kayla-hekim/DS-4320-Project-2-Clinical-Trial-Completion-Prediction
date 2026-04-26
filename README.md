# DS 4320 Project 2: Predicting Clinical Trial Completion

### Executive Summary

This repository contains a data pipeline for predicting the completion of cancer-related clinical trials using a MongoDB document database and machine learning techniques such as logistic regression. Clinical trial data was collected from the ClinicalTrials.gov API and stored in MongoDB Atlas to preserve its semi-structured and schema-unenforced format. The repository includes supporting documentation, metadata tables, a press release, an MIT License, and a pipeline Jupyter notebook under ./pipeline that performs data preprocessing and model training. The project demonstrates end-to-end data acquisition, preprocessing, and binary classification to predict whether a clinical trial will be completed or terminated early, with the goal of providing insights that may support more efficient research funding and decision-making.

**Name**: Kayla Kim

**Computing ID**: rkf9wd

**DOI**: https://doi.org/10.5281/zenodo.19671133

[![DOI](https://zenodo.org/badge/1216319205.svg)](https://doi.org/10.5281/zenodo.19671133)

<br> 

**Press Release:** https://github.com/kayla-hekim/DS-4320-Project-2-Clinical-Trial-Completion-Prediction/blob/main/press_release.md

**Pipeline**: https://github.com/kayla-hekim/DS-4320-Project-2-Clinical-Trial-Completion-Prediction/blob/main/pipeline

**License**: MIT License, linked at https://github.com/kayla-hekim/DS-4320-Project-2-Clinical-Trial-Completion-Prediction/blob/main/LICENSE
- Dataset source: clinicaltrials.gov (https://clinicaltrials.gov/api/v2/studies?query.cond=cancer&pageSize=1000)
- Dataset license remains subject to clinicaltrials.gov's terms and original dataset author permissions on the studies API in json format.

<br><br>

## Problem Definition

**General Problem**: Clinical drug trials (trial completion prediction)

**Specific Problem**: Can we predict whether a cancer-related clinical trial will successfully complete or be terminated early based on its study design characteristics and trial metadata?

**Rationale for Refinement**: The refinement from predicting outcomes in general clinical drug trials to specifically predicting trial completion status was made to better focus the scope of the project and align it with the use of a NoSQL document database. Predicting whether a drug shows an effect or not is also valuable, but that type of prediction may be performed effectively using a structured relational dataset. In contrast, predicting whether a clinical trial reaches completion or is terminated early is better suited for a NoSQL database because clinical trials often contain highly varied and nested features, including study design, enrollment, sponsor information, eligibility criteria, location data, and more. The flexibility of a document-based database allows these differing trial structures to be stored more naturally, which may improve both data organization and future predictive analysis.

**Motivation**: Cancer research is critically important due to the many varying cancer-related conditions that lead to some of the highest numbers of deaths each year across diverse population groups. Funding is therefore highly valuable and often a limited resource. To maximize the effectiveness of funding in cancer research, it is important to understand which clinical trials are more likely to complete successfully and therefore may be stronger candidates for resource allocation and continued support. This project aims to determine these patterns for future predictive use. The World Health Organization states that cancer is a leading cause of death worldwide and accounted for nearly 10 million deaths in 2020 (https://www.who.int/news-room/fact-sheets/detail/cancer?).

**Headline:** [Predicting Clinical Trial Completion Could Improve Cancer Research Funding Efficiency.](https://github.com/kayla-hekim/DS-4320-Project-2-Clinical-Trial-Completion-Prediction/blob/main/press_release.md)


<br><br>

## Domain Exposition

**Terminology**: 

|     Term / KPI    |                                             Definition                                             |
|:-----------------:|:--------------------------------------------------------------------------------------------------:|
| Clinical Trial    | A research study involving human participants used to evaluate medical treatments or interventions |
| Trial Completion  | A study that reaches its planned end and is marked as “Completed”                                  |
| Early Termination | A study marked as terminated, withdrawn, or suspended before planned completion                    |
| Metadata          | Descriptive study information such as sponsor, phase, dates, locations, and enrollment             |
| Study Phase       | Stage of the trial such as Phase 1, 2, 3, or 4                                                     |
| Enrollment        | Number of participants in the study                                                                |
| Sponsor           | Organization funding or managing the study                                                         |
| Intervention Type | Treatment type such as drug, device, or behavioral intervention                                    |
| Completion Rate   | Percentage of trials that successfully complete                                                    |
| Accuracy          | Percentage of correct model predictions                                                            |
| Precision         | Proportion of predicted completed trials that were actually completed                              |
| Recall            | Proportion of actual completed trials correctly identified                                         |
| F1 Score          | Harmonic mean of precision and recall                                                              |
| ROC-AUC           | Model ability to separate completed vs terminated trials                                           |

<br>

**Project's Domain**: This project lives in the domain of medical research, specifically in cancer-related medical research. It focuses on varying logistical factors within the medical research realm, such as study design, enrollment, sponsor information, eligibility criteria, location data, and more. Key stakeholders here include medical researchers, healthcare facilities, pharmaceutical companies that produce and distribute medications, funding partners, and patients who either participate in the trials or may benefit from successful treatment developments. These stakeholders share an interest in improving efficiency and the success rate of trials despite already limited funding and resources. Data science fits into this domain through the use of structured and semi-structured trial metadata, numerical representations of study characteristics, and machine learning (ML) models that predict trial completion outcomes at varying scales.

**Background Reading**: 
1. WHO (World Health Organization) - Cancer - article on defining key Cancer terms and statistics of the recent years (such as "nearly 10 million deaths in 2020") (src: https://www.who.int/news-room/fact-sheets/detail/cancer)
2. NIH (National Institutes of Health), National Cancer Institute - What Are Clinical Trials? - defines what clinical research trials are, why they're important, and the types of clinical trials (src: https://www.cancer.gov/research/participate/clinical-trials/what-are-clinical-trials)
3. ScienceDirect - Trial-level factors affecting accrual and completion of oncology clinical trials: A systematic review - paper discusses what factors are more prevalent in trials that do or don't complete in oncology (src: https://www.sciencedirect.com/science/article/pii/S2451865421001435?)
4. NIH, National Library of Medicine - Enrollment Success, Factors, and Prediction Models in Cancer Trials (2008-2019) - similar to this project, in focusing on prediction models for success in clinical trials (src: https://pmc.ncbi.nlm.nih.gov/articles/PMC10667018/pdf/op-19-1058.pdf)
5. Yale Medicine - Clinical Trials - discusses eligibility and who is eligible in clinical trials, along with the various steps of clinical trials (src: https://medicine.yale.edu/cancer/research/clinical/clinicaltrialsinfo/)

(Link to pdfs of all 5 readings: https://drive.google.com/drive/folders/1_W2s_i7x1VEDIJ1r4F-ly8ZQH8KILzTP?usp=sharing)

<br>

**Summary of Readings**: 

| Reading                                                                                                                     | Summary                                                                                                                                                                                                                                                                                             | Link in Folder |
|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| "Cancer" (WHO)                                                                                                              | Global overview of cancer incidence, mortality, major risk factors, early detection, screening, and treatment strategies.<br> Provides epidemiological context and supports the significance of improving cancer clinical trial efficiency.                                                             | [Link](https://drive.google.com/file/d/17MczvLmFcWL73WdnRK8LlgoDuOveMGIF/view?usp=drive_link)           |
| "What Are Clinical Trials?" (NIH, National Cancer Institute)                                                                | Overview of cancer clinical trials, including their purpose, importance in advancing treatment, and major trial types such<br> as treatment, prevention, screening, and supportive care studies. Useful for establishing foundational background on<br> how trials function.                                | [Link](https://drive.google.com/file/d/15_aexBpLuvuSPnWdYUHMiT2WDQ1W86qD/view?usp=drive_link)           |
| "Trial-level factors affecting accrual and completion<br> of oncology clinical trials: A systematic review" (ScienceDirect) | Systematic review examining factors that influence whether oncology trials successfully enroll participants and reach<br> completion, including eligibility criteria, sample size, phase, sponsor type, and study design complexity. Highly relevant<br> for identifying predictive variables in the model. | [Link](https://drive.google.com/file/d/1qcovO72BwymIScj9jHLTAQ185uwMrEnp/view?usp=drive_link)           |
| "Enrollment Success, Factors, and Prediction Models in Cancer<br> Trials (2008-2019)" (NIH, National Library of Medicine)   | Large-scale study of 4,004 cancer clinical trials from 2008-2019 that uses logistic regression to predict whether trials<br> successfully meet enrollment goals. The paper identifies important predictive factors such as trial phase, sponsor type,<br> number of locations, and planned sample size.     | [Link](https://drive.google.com/file/d/10bkf2s8K9xVTQl8qlda-uo_86rP44486/view?usp=drive_link)           |
| "Clinical Trials" (Yale Medicine)                                                                                           | Academic medical center overview of cancer clinical trials, including eligibility criteria, trial phases, patient selection,<br> and treatment evaluation. Especially useful for supporting model features related to cohort design, eligibility, and trial<br> progression.                                | [Link](https:https://drive.google.com/file/d/16zccnAb6SOAFGxAvs0TRriYSaNJ5aY6z/view?usp=drive_link//)           |


<br><br>

## Data Creation

**Raw Data Provenance**: I obtained a dataset oof clinical trial studies from ClinicalTrials.gov, a database maintained by the National Institutes of Health (NIH) through the National Library of Medicine. After taking a look at the APIs listed on the site, I selected the studies API at https://clinicaltrials.gov/api/v2/studies. Using Python and the python mongo and requests libraries, I retrieved the json from the API and inserted the first 1000 study entries into a MongoDB database. Each document represents a single clinical trial and contains semi-structured information such as study design, enrollment size, sponsor organization, trial phase, and recruitment status. Limiting the dataset to the first 1000 entries allowed for full use of the free and limited storage.

<br>

**Code Table**: 

| File | Description | Link |
|---|---|---|
| load_clinical_trials.py | Python script that connects to the ClinicalTrials.gov v2 studies API, retrieves the first 1000 cancer-related clinical trial records <br> in JSON format, and inserts them into the MongoDB `cancer_trials_raw` collection. | [Code](https://drive.google.com/file/d/146R67JNDs71_Opn7rY5v3dEyXczGfpsx/view?usp=sharing) |
| check_database.js | mongosh script used to inspect the MongoDB database, verify the `cancer_trials_raw` document count, view an example document, and summarize trial statuses. | [Code](https://github.com/kayla-hekim/DS-4320-Project-2-Clinical-Trial-Completion-Prediction/blob/main/pipeline/mongosh/check_database.js) |


- see the link **above** contains the python file for the code
- and **below** for the colab version of the code


<br>

**Rationale for Critical Decisions**: Some decisions truly impacted the modeling process that were made during the collection and preparation of data  with the goal of improving the data's quality. The decision to use the ClinicalTrials.gov API was based on its accessibility and structured format. The json format of the API's data was easily transferrable to the MongoDB document based storage format. Limiting the dataset to the first 1000 trials was a practical choice to stay within MongoDB storage constraints while still maintaining sufficient scale for analysis. MongoDB was used as an assignment constraint, but also since the clinical trial studies data had nested and semi-structured fields that remained highly consistent across each entry study. This therefore worked better with a NoSQL Document based DB compared to a relational DB. The trial completion as a binary 1 (completed) or 0 (terminated/withdrawn) outcome was used to easily model on the data, where numbers could be used instead of the strings as statuses, where a slight difference in status strings would cause an error in the target modeling process. In the end, recent trails were filtered out to reduce uncertainty from incomplete outcomes, but unfortunately did reduce the database size. Newer trends were also excluded because of this, so we had to find a threshold that balanced the tradeoff between representative data completeness and recent trends.

**Bias Identification**: Bias can be introduced in this dataset through both the data source and the collection method. The data is mentioned to be obtained from ClinicalTrials.gov, which mainly includes registered clinical trials and may not fully represent all studies across the world. This introduces selection bias since not all study types are represented. In addition, filtering the studies for cancer-related labels using the query condition in the code above may exclude relevant studies that are miscategorized but still relevant to cancer research. This can cause selection bias as well since only certain studies are being selected and may not be representative of all studies with clinical trials. Another source of bias comes from limiting the dataset to the first 1000 entries from the API, which may not be a randomly selected sample. The first 1000 entries could overrepresent certain time periods of studies, sponsors, study types, and more. Finally, temporal bias is present because most or more recent trials are often still ongoing through this year of querying (2026). This means that their completion status is not yet known or reported in the database, which can affect outcome distributions.

**Bias Mitigation**: The biases discussed above can be avoided or mitigated through even more careful filtering that considers all types of labels, missing or relevant to cancer research. Using a threshold year, such as 2019, to include in the analysis or code might be beneficial to avoid the tepmoral bias discussed. This means that the studies that have not had time to complete would be excluded as they are not representative of all studies in terms of completion and status. Sampling from only the 1000 trials can be ackwoledged and avoided by ensureing the sample still contains a diverse range of trials that are represents most or all existing labels in the API. Categorical features like trial phase and sponsor can be included in the trained model to help account for structural differences in trial outcomes. All results from using the database and associated model should be interpreted with awareness of these limitations. Model performance should be evaluated using appropriate validation techniques like train-test splits and cross validations to ensure generalizability.


<br><br>

## Metadata

**Implicit Schema**: The MongoDB collection `cancer_trials_raw` stores one document for each clinical trial study retrieved from the ClinicalTrials.gov API https://clinicaltrials.gov/api/v2/studies. Each document follows an implicit or semi-structured JSON format rather than a rigid fixed schema like relational databases. This means that documents or "entries" share a general layout but may differ in which fields are present. The primary organizational pattern is nested under the `protocolSection` field, which contains major subfields such as `identificationModule`, `statusModule`, `designModule`, `sponsorCollaboratorsModule`, `conditionsModule`, `eligibilityModule`, and `contactsLocationsModule`.
<br>

These nested fields define the implicit schema of the dataset. For example, `identificationModule` contains identifiers nested under such as `nctId`, `statusModule` (contains trial status and dates), `designModule` (contains study phase and enrollment information), `sponsorCollaboratorsModule` (contains sponsor metadata), and `contactsLocationsModule` (contains site information such as participating locations). Since studies report fields in different ways and formats, the schema is flexible with some unenforced rules rather than strictly followed. This document design is appropriate for MongoDB because it preserves the nested structure of the source json file in the API. It also allows key features and fields to be later used in an analytical dataset for summary tables, machine learning modeling, and analysis.

<br>

**Data Summary**

| Field/Attribute | Value |
|---|---|
| Database Name | api_studies |
| Collection Name in MongoDB | cancer_trials_raw |
| Source | ClinicalTrials.gov API (https://clinicaltrials.gov/api/v2/studies) |
| Observation Units per Document | One clinical trial study |
| Number of Documents/entries | 1000 |
| Format | JSON (stored as MongoDB documents) |
| Schema Type | Semi-structured / document-based |
| Key Top-Level Field | `protocolSection` |
| Key Nested Modules | identificationModule, statusModule, designModule, sponsorCollaboratorsModule, conditionsModule, eligibilityModule, contactsLocationsModule |
| Target Variable | Trial completion status (`overallStatus`) |

<br>

**Data Dictionary Table**: 

- DISCLAIMER: listing only the key fields nested that were vital in modeling or analysis in this project of predicting trial completion:
<br><br>

| Feature/Field | Data Type | Description | Example |
|---|---|---|---:|
| `nctId` | string | Unique identifier for each clinical trial | NCT01234567 |
| `overallStatus` | string | Final or current status of the trial (target variable in modeling) | COMPLETED |
| `phase` | string | Clinical trial phase indicating stage of testing | PHASE2 |
| `enrollmentCount` | integer | Number of participants enrolled or planned by the study | 120 |
| `leadSponsorClass` | string | Category of the primary sponsor (like INDUSTRY or GOVERNMENT) | INDUSTRY |
| `locationCount` | integer | Number of study locations associated with the trial | 5 |
| `conditionCount` | integer | Number of medical conditions studied in the trial | 2 |
| `hasEligibilityCriteria` | boolean | Indicates whether eligibility criteria text is provided | True |
| `startYear` | integer | [DERIVED FOR MODELING] Year the trial began (from listed start date) | 2015 |
| `success` | integer | [DERIVED FOR MODELING] 1 if trial completed, 0 otherwise | 1 |

<br>

**Data Dictionary Uncertainty Quantification**: 

- numerical features/fields: `enrollmentCount`, `locationCount`, `conditionCount`, `startYear`, `success`
<br>

| Feature | Missing % | Mean | Std Dev | Min | Max |
|---|---:|---:|---:|---:|---:|
| `enrollmentCount` | 1.4% | 584.199797 | 7210.088080 | 0.0 | 200000.0 |
| `locationCount` | 0.0% | 10.778000 | 51.706037 | 0.0 | 940.0 |
| `conditionCount` | 0.0% | 2.210000 | 3.381617| 1.0 | 64.0 |
| `startYear` | 0.7% | 2015.727090 | 7.426185 | 1985.0 | 2026.0 |
| `success` | 43.2% | 0.801056 | 0.399557 | 0.0 | 1.0 |

<br>

The numerical features above exhibit different levels of uncertainty and variability. The `enrollmentCount` feature has a smaller percentage of missing values (1.4%) but an extremely large standard deviation compared to its mean. This demonstrates the existence of outliers and wide variation in the study sizes. Like `enrollmentCount`, `locationCount` also shows high variance. This indicates that some trials involve many more sites for the study's performance than others. In contrast, `conditionCount` has lower variability and appears more consistent across studies. The `startYear` feature has little missing values and lower-ended variance. However, more recent years may introduce uncertainty due to ongoing trials that have not yet reached completion (discussed above).
<br>

The `success` variable is a created feature for the modeling of this project (1 = completed, 0 = terminated or withdrawn). It is included for modeling purposes. The reported missing percentage (43.2%) does not represent true missing data, but instead reflects trials that are still ongoing and do not yet have a final outcome (like many studies after the 2019 threshold). This represents right-censoring in the dataset, which introduces uncertainty when modeling trial completion from the studies.

