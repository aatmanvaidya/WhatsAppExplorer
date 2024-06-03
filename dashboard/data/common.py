import json
import os
from pandas.api.types import (
    is_categorical_dtype,
    is_datetime64_any_dtype,
    is_numeric_dtype,
    is_object_dtype,
)
import pandas as pd
import streamlit as st
import yaml


def getConfig():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    config_path = os.path.join(dir_path, '../config.yml')
    with open(config_path) as file:
        config = yaml.load(file, Loader=yaml.FullLoader)
    return config


config = getConfig()
path = config['survey']

def loadJsonFile(filename):
    # Open the file
    with open(filename) as file:
        # Load the file
        data = json.load(file)
    # remove key 'info'
    data.pop('info')
    return data
    

def getFileName(surveyType, clientId):
    prefix = clientId + '_'
    if surveyType == 'pre':
        prefix += '0_'
    else:
        prefix += '1_'
    
    for filename in os.listdir(path):
        if filename.startswith(prefix) and filename.endswith('.json'):
            return filename
    return None
     
    

def loadSurveyResponse(surveyType, clientId, name):
    # filename of surveyType clientId_0_name
    filename = getFileName(surveyType, clientId)
    if filename == None:
        return None
    filename = path + '/' + filename
    
    return loadJsonFile(filename)

def filter_dataframe(df, columns = []):
    # Adds a UI on top of a dataframe to let viewers filter columns

    # Args:
    #     df (pd.DataFrame): Original dataframe

    # Returns:
    #     pd.DataFrame: Filtered dataframe
    modify = st.checkbox("Filters")

    if not modify:
        return df

    df = df.copy()

    # Try to convert datetimes into a standard format (datetime, no timezone)
    if len(columns) == 0:
        columns = df.columns
    for col in df.columns:
        if is_object_dtype(df[col]):
            try:
                df[col] = pd.to_datetime(df[col])
            except Exception:
                pass

        if is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.tz_localize(None)

    modification_container = st.container()

    with modification_container:
        to_filter_columns = st.multiselect("Filter on", columns)
        for column in to_filter_columns:
            left, right = st.columns((1, 20))
            # Treat columns with < 10 unique values as categorical
            if is_categorical_dtype(df[column]) or df[column].nunique() < 10:
                user_cat_input = right.multiselect(
                    f"Values for {column}",
                    df[column].unique(),
                    default=list(df[column].unique()),
                )
                df = df[df[column].isin(user_cat_input)]
            elif is_numeric_dtype(df[column]):
                _min = float(df[column].min())
                _max = float(df[column].max())
                step = (_max - _min) / 100
                user_num_input = right.slider(
                    f"Values for {column}",
                    min_value=_min,
                    max_value=_max,
                    value=(_min, _max),
                    step=step,
                )
                df = df[df[column].between(*user_num_input)]
            elif is_datetime64_any_dtype(df[column]):
                user_date_input = right.date_input(
                    f"Values for {column}",
                    value=(
                        df[column].min(),
                        df[column].max(),
                    ),
                )
                if len(user_date_input) == 2:
                    user_date_input = tuple(map(pd.to_datetime, user_date_input))
                    start_date, end_date = user_date_input
                    df = df.loc[df[column].between(start_date, end_date)]
            else:
                user_text_input = right.text_input(
                    f"Substring or regex in {column}",
                )
                if user_text_input:
                    df = df[df[column].astype(str).str.contains(user_text_input)]

    return df