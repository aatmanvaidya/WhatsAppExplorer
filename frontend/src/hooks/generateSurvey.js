//not used. lib issues for cross ref
import "survey-core/defaultV2.min.css";
import { Model } from "survey-core";
import listToJson from "../surveyFormJson.js"

const generateSurvey = (clientId, unchecked_list, checked_list) => {
    const surveyJson = listToJson(unchecked_list, checked_list);
    const survey = new Model(surveyJson);
    survey.focusFirstQuestionAutomatic = false;
    return survey;
}

export default generateSurvey;