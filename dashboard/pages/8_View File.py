import data.fetchMongo as fetchMongo
import streamlit as st

st.sidebar.header("Filename")
search_term = st.sidebar.text_input("Enter a file name")
if search_term:
    data = fetchMongo.getGridFSFile(search_term)
    st.write(data)
else:
    st.markdown("Enter a file name to view its data")