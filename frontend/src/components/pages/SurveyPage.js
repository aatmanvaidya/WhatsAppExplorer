import { Survey } from "survey-react-ui";
import { useNavigate, useLocation } from "react-router-dom";
import "survey-core/defaultV2.min.css";
import listToJson from "../../surveyFormJson";
import { Model } from "survey-core";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import "survey-core/survey.i18n";
import { useTranslation } from 'react-i18next';
import preSurveyJsonPt from "../../surveyTemplates/Pt/preSurveyFormPt"
import postSurveyFormPt from "../../surveyTemplates/Pt/postSurveyFormPt";
import preSurveyJsonHindi from "../../surveyTemplates/Hi/preSurveyFormHindi";
import postSurveyFormHindi from "../../surveyTemplates/Hi/postSurveyFormHindi";
import preSurveyJsonEn from "../../surveyTemplates/En/preSurveyFormEn";
import postSurveyFormEn from "../../surveyTemplates/En/postSurveyFormEn";
import preSurveyJsonEs from "../../surveyTemplates/Es/preSurveyFormEs";
import postSurveyFormEs from "../../surveyTemplates/Es/postSurveyFormEs";

const SurveyPage = () => {
    const axiosPrivate = useAxiosPrivate();
    const location = useLocation();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const { state } = location;
    const checked_users = state.checkedUsers // max 5. if >5 checked, choose random 5 groups
    const unchecked_users = state.uncheckedUsers
    const formType = state.formType


    // console.log(state)

    const saveSurveyToServer = (data) => {
        console.log(`saving ${data} to server..`);

        axiosPrivate
            .post("/save-survey", data)
            .then((res) => {
                // check if consenting first time
                if (res.data === "SurveySaved") {
                    console.log("Form Saved to server!")
                }
            })
            .catch((err) => {
                console.log(err);
            })
    };

    let surveyJson = {};
    if (formType === 0) {

        switch (i18n.language) {
            case 'en':
                surveyJson = preSurveyJsonEn();
                break;
            case 'pt':
                surveyJson = preSurveyJsonPt();
                break;
            case 'hi':
                surveyJson = preSurveyJsonHindi();
                break;
            case 'es':
                surveyJson = preSurveyJsonEs();
                break;
        }

    }
    else {

        switch (i18n.language) {
            case 'en':
                surveyJson = postSurveyFormEn(unchecked_users, checked_users);
                break;
            case 'pt':
                surveyJson = postSurveyFormPt(unchecked_users, checked_users);
                break;
            case 'hi':
                surveyJson = postSurveyFormHindi(unchecked_users, checked_users);
                break;
            case 'es':
                surveyJson = postSurveyFormEs(unchecked_users, checked_users);
                break;
        }
    }

    const survey = new Model(surveyJson);
    survey.onComplete.add((sender, options) => {
        let surveyInfo = {
            info: {
                clientId: state.clientId,
                clientName: state.clientName,
                surveyType: state.formType,
                timestamp: new Date()
            }
        }
        let data = { ...surveyInfo, ...sender.data }
        console.log(data);
        saveSurveyToServer(data);
        // console.log(JSON.stringify(sender.data, null, 3));
        setTimeout(() => {
            if (formType === 0) {
                let stateData = {
                    username: state.data.username,
                    // phNo: state.data.phNo,
                    // addr: state.data.addr,
                    village: state.data.village,
                    tehsilOrBlock: state.data.tehsilOrBlock,
                    email: state.data.email,
                    waNo: state.data.waNo,
                    bio: state.data.bio,
                    userId: state.data.userId
                }
                navigate("/addUser", { state: { from: location, data: stateData }, replace: true });
            }
            else {
                navigate("/allUsers", { state: { from: location }, replace: true });
            }
        }, 2000);
    });

    survey.locale = i18n.language;

    // Instantiate Showdown
    const converter = new showdown.Converter();
    survey.onTextMarkdown.add(function (survey, options) {
        // Convert Markdown to HTML
        let str = converter.makeHtml(options.text);
        // Remove root paragraphs <p></p>
        str = str.substring(3);
        str = str.substring(0, str.length - 4);
        // Set HTML markup to render
        options.html = str;
    });
    return (
        < Survey model={survey} />
    );
}

export default SurveyPage;
