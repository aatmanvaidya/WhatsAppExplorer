import streamlit as st
import pandas as pd
import plost
import plotly.express as px
import datetime
import folium
from streamlit_folium import folium_static
from data.common import filter_dataframe

# Data Loading
import data.loadParticipants as loadParticipants

st.set_page_config(layout='wide', initial_sidebar_state='expanded', page_title='WMDash', page_icon=':bar_chart:')

participants_data = loadParticipants.ParticipantsData()

def parse_location(loc_str):
    try:
        lat, lon = eval(loc_str)
        return lat, lon
    except:
        return None, None
    
@st.cache_data(ttl=600)
def getReport(surveyors, start_date, end_date):
    return participants_data.generateReport(surveyors, start_date, end_date)

# Sidebar
st.sidebar.title('WM Dashboard')
# st.sidebar.subheader('Surveyor')
# multi select box for selecting multiple surveyors
options = participants_data.getSurveyors()
surveyors = [option for option in options if option.startswith('wsurveyor')]
# surveyors = st.sidebar.multiselect('Select surveyors', options)
# all_options = st.sidebar.checkbox("Select all options")
# if all_options:
#     surveyors = options
st.sidebar.subheader('Date Range')
start_date = st.sidebar.date_input('Start date', value=pd.to_datetime('2024-03-01'))
end_date = st.sidebar.date_input('End date', value=datetime.datetime.now())
if start_date > end_date:
    st.sidebar.error('Error: End date must fall after start date.')

st.sidebar.markdown('''
---
Data Visualizer for WhatsappExplorer.
''')

# Page
st.markdown('### Participants Report')
# get report data
if len(surveyors) == 0:
    st.markdown('No surveyors selected.')
else:
    reportData = getReport(surveyors, start_date, end_date)
    # display report data
    df = pd.DataFrame(reportData)
    filteredDf = filter_dataframe(df)
    st.dataframe(filteredDf)
    st.download_button(
    "Download",
    pd.DataFrame(reportData).to_csv(index=False).encode('utf-8'),
    "report.csv",
    "text/csv",
    key='download-csv'
    )    
    
    filteredDf['Latitude'], filteredDf['Longitude'] = zip(*filteredDf['location'].apply(parse_location))
    # Create a map centered around the average latitude and longitude
    mean_lat = filteredDf['Latitude'].mean()
    mean_lon = filteredDf['Longitude'].mean()
    map = folium.Map(location=[mean_lat, mean_lon], zoom_start=12)

    # Add markers to the map
    for _, row in filteredDf.iterrows():
        # Check if location is valid
        if pd.notnull(row['Latitude']) and pd.notnull(row['Longitude']):
            location = (row['Latitude'], row['Longitude'])
            popup_text = f"<b>Name</b>: {row['name']}<br><b>Surveyor</b>: {row['surveyor']}<br><b>District</b>: {row['District'] if 'District' in row else 'NA'}<br><b>Town</b>: {row['Town'] if 'Town' in row else 'NA'}<br>"
            folium.Marker(location, popup=popup_text).add_to(map)
    
    # Display the map
    st.subheader('Map of Participants')
    folium_static(map, width=1000, height=500)