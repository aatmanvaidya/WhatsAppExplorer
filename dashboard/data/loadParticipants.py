import json
from datetime import datetime
import data.fetchMongo as fetchMongo
import data.common as common

class ParticipantsData:

    def __init__(self):
        self.data = fetchMongo.getCollectionData('participants')
        self.reportData = []
        self.timeStats = self.getTimeStatsFromJSON()

    def getSurveyors(self):
        surveyors = fetchMongo.getCollectionData('surveyors')
        data = []
        for surveyor in surveyors:
            data.append(surveyor['username'])
        return data
    
    def getActiveParticipants(self):
        data = []
        for participant in self.data:
            data.append({
                "Count": participant['name'] + ' (' + participant['clientId'][-4:] + ')',
                "Status": "Revoked" if participant['isRevoked'] else "Active"
            })
        return data

    def getClientStatus(self):
        data = []
        for participant in self.data:
            data.append({
                "Name": participant['name'] + ' (' + participant['clientId'][-4:] + ')',
                "Status": participant['clientStatus']
            })
        return data

    def getParticipants(self, minDate, maxDate):
        # get participants with dateOfRegistration between minDate and maxDate
        data = []
        for participant in self.data:
            date = participant['dateOfRegistration'].date()
            if date >= minDate and date <= maxDate:
                data.append(participant)
        return data
    
    def getParticipantsBySurveyors(self, surveyors):
        data = []
        for participant in self.data:
            if participant['addedByName'] in surveyors:
                data.append(participant['name'] + ' (' + participant['clientId'][-4:] + ')')
        return data
    
    def getDOJS(self, participantNames):
        data = {}
        for participant in self.data:
            if participant['name'] + ' (' + participant['clientId'][-4:] + ')' in participantNames:
                data[participant['name'] + ' (' + participant['clientId'][-4:] + ')'] = participant['dateOfRegistration']
        return data

    
    def processConsentedChatUsers(self, participant):
        consentedUsers = set()
        for item in participant['consentedChatUsers']:
            if item[1] == True:
                consentedUsers.add(item[0])
        return consentedUsers
    
    def getChatUserLogs(self, participant):
        clientId = participant['clientId']
        chatUserData = fetchMongo.getCollectionData('chatusers')
        for chatUser in chatUserData:
            if chatUser['userID'] == clientId:
                return fetchMongo.getGridFSFile(chatUser['chats']['filename'])
        return None
    
    def getMessageCount(self, participant):
        count = 0
        messageData = fetchMongo.getCollectionData('messages')
        for message in messageData:
            if message['participantID'] == participant['_id']:
                count += message['messages']['length']
        return count
    
    def addSurveyResults(self, participant, data):
        # Only for brazil
        try:
            if 'brazil' in participant['addedByName'].lower():
                surveyResults = common.loadSurveyResponse('pre', participant['clientId'], participant['name'])
                if not surveyResults:
                    return data
                data['Age'] = surveyResults['age']
                data['Gender'] = surveyResults['gender']
                data['Race'] = surveyResults['race']
                data['Religion'] = surveyResults['religion']
                data['Education'] = surveyResults['education']
                data['Zip Code'] = surveyResults['zip']
                data['Income'] = surveyResults['Monthly Income']
                data['Bolsa Família'] = surveyResults['Resources']
            elif 'wsurveyor' in participant['addedByName'].lower():
                surveyResults = common.loadSurveyResponse('pre', participant['clientId'], participant['name'])
                if not surveyResults:
                    return data
                data['Age'] = surveyResults['age'] if 'age' in surveyResults else "NA"
                data['Religion'] = surveyResults['religion'] if 'religion' in surveyResults else "NA"
                data['District'] = surveyResults['District'] if 'District' in surveyResults else "NA"
                data['Town'] = surveyResults['Town_'+data['District'].replace(" ", "_")] if 'Town_'+data['District'].replace(" ", "_") in surveyResults else "NA"
                data['Caste'] = surveyResults['caste'] if 'caste' in surveyResults else "NA"
                data['Education'] = surveyResults['education'] if 'education' in surveyResults else "NA"
                data['Residential Type'] = surveyResults['Residental area type'] if 'Residental area type' in surveyResults else "NA"
                data['House Type'] = [key for key in surveyResults.keys() if key.startswith('House type')][0] if [key for key in surveyResults.keys() if key.startswith('House type')] else "NA"
                data['Income'] = surveyResults['Monthly Income'] if 'Monthly Income' in surveyResults else "NA"
            return data
        except Exception as e:
            # print(e)
            print("Error in getting survey data")
            return data

    def getTimeStatsFromJSON(self):
        # load file /home/kg766/whatsappMonitor/timeStats.json
        with open('/home/kg766/whatsappMonitor/timeStats.json') as f:
            data = json.load(f)
        
        return data
    
    def getTotalTime(self, data):
        if 'chatUsers' in data and 'messages' in data and 'connection' in data:
            return float(data['chatUsers'].split(' ')[0]) + float(data['messages'].split(' ')[0]) + float(data['connection'].split(' ')[0])
        return "NA"
            
    def processChatUserLogs(self, participant):
        chatLogs = self.getChatUserLogs(participant)
        consentedUsers = self.processConsentedChatUsers(participant)
        connectionTime = participant['timeStats']['connection'] if 'timeStats' in participant and 'connection' in participant['timeStats'] else str(round(self.timeStats[participant['clientId']]['connectionTime']/1000,2)) + " seconds"  if participant['clientId'] in self.timeStats else "NA"
        totalTime = str(round(self.timeStats[participant['clientId']]['totalTimeFg']/1000,2)) + " seconds" if participant['clientId'] in self.timeStats else self.getTotalTime(participant['timeStats']) if 'timeStats' in participant else "NA"
        data = {
            'name': participant['name'] + ' (' + participant['clientId'][-4:] + ')',
            'connectionTime': connectionTime,
            'totalTime': totalTime,
            'DOJ': participant['dateOfRegistration'],
            'Status': "Revoked" if participant['isRevoked'] else "Available",
            'Revoked Date': participant['revokeTime'] if 'revokeTime' in participant and  participant['revokeTime'] is not None else "NA",
            'surveyor': participant['addedByName'],
            'totalIndividualChats': 0,
            'totalGroups': 0,
            'eligibleGroups': 0,
            'defaultSelectedGroups': 0,
            'deselectedGroups': 0,
            # 'additionalSelectedGroups': 0,
            'consentedGroups': len(consentedUsers),
            'messagesLogged': 0,
            'timeStats': participant['timeStats'] if 'timeStats' in participant else None,
            'location': participant['location']['msg'] if 'location' in participant and 'msg' in participant['location'] else  "(" +str(participant['location']['latitude']) + ", " + str(participant['location']['longitude']) + ")" if 'location' in participant else "Geolocation not supported"
        }
        data = self.addSurveyResults(participant, data)
        if chatLogs is not None:
            for chat in chatLogs:
                if chat['isGroup']:
                    data['totalGroups'] += 1
                    if 'num_participants' not in chat:
                        chat['num_participants'] = len(chat['groupMetadata']['participants'])
                    if chat['num_participants'] >= 5:
                        data['eligibleGroups'] += 1
                        if 'num_messages' in chat and chat['num_messages'] >= 15:
                            if chat['id']['_serialized'] not  in consentedUsers:
                                data['deselectedGroups'] += 1
                else:
                    data['totalIndividualChats'] += 1
        data['defaultSelectedGroups'] = data['consentedGroups'] + data['deselectedGroups']
        # data['additionalSelectedGroups'] = data['consentedGroups'] - data['defaultSelectedGroups'] + data['deselectedGroups']
        data['messagesLogged'] = self.getMessageCount(participant)
        return data
    
    def generateReport(self, surveyors, minDate, maxDate):
        participants = self.getParticipants(minDate, maxDate)
        for participant in participants:
            if participant['addedByName'] in surveyors:
                self.reportData.append(self.processChatUserLogs(participant))
        return self.reportData
    

                