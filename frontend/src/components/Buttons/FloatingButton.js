import React from 'react';
import Fab from '@mui/material/Fab';
import { makeStyles } from '@mui/styles';
import { CSVLink } from 'react-csv';


const useStyles = makeStyles((theme) => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
}));

const FloatingButton = ({ data, filename, type, label, icon }) => {
    const classes = useStyles();
    var result = [];
    const convertData = (json_data) => {
        // console.log(json_data)
        let surveyResult = {}
        try {
            if (json_data[i].surveyResults) {
                surveyResult = json_data[i].surveyResults && json_data[i].surveyResults[0] || {}; // Use an empty object if surveyResults is not available
            }
        } catch (error) {
            console.error("A minor error occurred in Floating window, ignore:", error);
        }

        result.push(["ID", "Name", "DOJ", "Added By", "Personal Chats", "Group Chats", "Eligible Groups", "Consented Groups",
            "Default Selected Groups", "Deselected Groups", "Additionally Selected Groups", "Messages Logged", "Age", "Caste", "Religion", "AreaType"])
        for (var i in json_data) {
            try {
                result.push([
                    json_data[i].clientId
                    , json_data[i].name
                    , json_data[i].DOJ
                    , json_data[i].surveyor
                    , json_data[i].totalIndividualChats
                    , json_data[i].totalGroups
                    , json_data[i].eligibleGroups
                    , json_data[i].consentedGroups
                    , json_data[i].defaultSelectedGroups
                    , json_data[i].deselectedGroups
                    , json_data[i].additionalSelectedGroups
                    , json_data[i].messagesLogged
                    , json_data[i].surveyResults[0].age
                    , json_data[i].surveyResults[0].caste
                    , json_data[i].surveyResults[0].religion
                    , json_data[i].surveyResults[0]["Residental area type"]
                ])
            }
            catch {
                result.push([
                    json_data[i].clientId || "NA"
                    , json_data[i].name || "NA"
                    , json_data[i].DOJ || "NA"
                    , json_data[i].surveyor || "NA"
                    , json_data[i].totalIndividualChats || "NA"
                    , json_data[i].totalGroups || "NA"
                    , json_data[i].eligibleGroups || "NA"
                    , json_data[i].consentedGroups || "NA"
                    , json_data[i].defaultSelectedGroups || "NA"
                    , json_data[i].deselectedGroups || "NA"
                    , json_data[i].additionalSelectedGroups || "NA"
                    , json_data[i].messagesLogged || "NA"
                    , "NA",
                    "NA",
                    "NA",
                    "NA"
                ])
            }


        }
    }
    convertData(data);
    return (
        <CSVLink data={result} filename={filename} className={classes.fab}>
            <Fab color="primary" className={classes.fab} variant={type}>
                {icon} {label}
            </Fab>
        </CSVLink>
    );
};

export default FloatingButton;
