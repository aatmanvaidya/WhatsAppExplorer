import json
import os

path = '/home/kg766/whatsappMonitor/api/whatsappWebApi/formResponse'

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