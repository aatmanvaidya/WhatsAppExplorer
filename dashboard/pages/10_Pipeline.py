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
st.sidebar.subheader('Pipeline Viewer')

dateToView = st.sidebar.date_input('Date', value=datetime.datetime.now())
todaysDate = datetime.datetime.now().date()

pipelineData = fetchMongo.getCollectionData('pipelines')
participantsData = fetchMongo.getCollectionDataQuery('participants', "{ \"isRevoked\": { \"$ne\": true }, \"clientStatus\": { \"$ne\": \"AUTOLOGGING\" }, \"isLogging\": false }")
totalParticipants = len(participantsData)

# Page
if len(pipelineData) == 0:
    st.markdown('No pipelines found.')
else:
    # check if dateToView is todays date
    if dateToView == todaysDate:
        st.markdown("## Today's Pipeline")
    else:
        st.markdown("## Pipeline for " + dateToView.strftime('%Y-%m-%d'))
    # check if there is a pipeline for today
    flag = False
    todaysData = {}
    # sort pipeline data by start time in descending order
    pipelineData = sorted(pipelineData, key=lambda x: x['startTime'], reverse=True)
    for pipeline in pipelineData:
        if pipeline['startTime'].date() == dateToView:
            flag = True
            todaysData = pipeline
            break
    if flag:
        statusIcon = '🕐' if  todaysData['status'] == 'running' else '✅' if todaysData['status'] == 'completed' else '❌'
        col1, col2, col3 = st.columns(3)
        
        numRevoked = 0
        numConnected = 0
        numTimedOut = 0
        avgLogTime = 0
        avgMessageDownload = 0
        avgMediaDownload = 0
        totalMessages = 0
        totalMedia = 0
        
        for record in todaysData['records']:
            if record['result'] == 'connected':
                numConnected += 1
                dt = record['disconnectionTime'] - record['connectionTime']
                dt_seconds = dt.total_seconds()
                avgLogTime += dt_seconds
                totalMessages += record['messagesDownloaded']
                totalMedia += record['mediaDownloaded']
            elif record['result'] == 'revoked':
                numRevoked += 1
            else:
                numTimedOut += 1
                
        avgLogTime = avgLogTime / numConnected if numConnected > 0 else 0
        avgMessageDownload = totalMessages / numConnected if numConnected > 0 else 0
        avgMediaDownload = totalMedia / numConnected if numConnected > 0 else 0
        
        # progress bar
        percent = (numConnected / totalParticipants)
        if todaysData['status'] == 'running':
            col11, col12 = col1.columns([1, 4])
            col11.metric(label='Status', value=statusIcon)
            col12.progress(percent)
        else:
            col1.metric(label='Status', value=statusIcon)
        startTimeValue = todaysData['startTime'].strftime('%Y-%m-%d %H:%M:%S')
        col2.metric(label='Start Time', value=startTimeValue)
        if todaysData['status'] == 'completed':
            endTimeValue = todaysData['endTime'].strftime('%Y-%m-%d %H:%M:%S')
            col3.metric(label='End Time', value=endTimeValue)
        elif todaysData['status'] == 'running':
            elapsedTime = datetime.datetime.now() - todaysData['startTime']
            elapsedTime = str(elapsedTime).split('.')[0]
            col3.metric(label='Elapsed Time', value=elapsedTime)
                
        col1.metric(label='Success', value=numConnected)
        col2.metric(label='Revoked', value=numRevoked)
        col3.metric(label='Timed Out', value=numTimedOut)
        
        col1.metric(label='Avg Log Time', value=round(avgLogTime))
        col2.metric(label='Avg Msg Download', value=round(avgMessageDownload))
        col3.metric(label='Avg Media Download', value=round(avgMediaDownload))
        
        progressStr = str(numConnected) + '/' + str(totalParticipants)
        col1.metric(label='Total Messages', value=totalMessages)
        col2.metric(label='Total Media', value=totalMedia)
        col3.metric(label='Progress', value=progressStr)
        
                
        
            
    else:
        st.markdown('No pipeline found for selected date.')
        
    # display pipeline data in dataframe
    df = pd.DataFrame(pipelineData).astype(str) 
    st.dataframe(df)

    