# DS 4320 Project 2: Predicting Clinical Trial Completion

### Executive Summary

[]

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
