import streamlit as st
import pandas as pd
import plost
import plotly.express as px
import datetime
import data.fetchMongo as fetchMongo
import json

st.set_page_config(layout='wide', initial_sidebar_state='expanded', page_title='MongoDB', page_icon=':bar_chart:')

# SideBar
st.sidebar.title('WM Dashboard')
st.sidebar.subheader('Database Viewer')

collections = fetchMongo.getAllCollections()
# Select Collection from dropdown
collectionName = st.sidebar.selectbox('Select Collection', collections, placeholder='Select a collection')
# Add filter for the collection
st.sidebar.subheader('Query')
query = st.sidebar.text_input('Query', value='{}')

# Page
st.markdown('### Database Viewer')
if collectionName == '':
    st.markdown('No collections found.')
else:
    # get collection data
    # convert all single quotes to double quotes
    if query == '' or query == None:
        query = '{}'
    query = query.replace("\'", "\"")
    collectionData = fetchMongo.getCollectionDataQuery(collectionName, query)
    collectionData = pd.DataFrame(collectionData).astype(str)
    # display collection data
    st.dataframe(collectionData)
    # display collection headers
    st.markdown('### Collection Headers')
    collectionHeaders = fetchMongo.getCollectionHeaders(collectionName)
    st.dataframe(collectionHeaders)
    