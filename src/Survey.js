import FormField from './FormField';

import React, { useState } from 'react';
import Fade from 'react-reveal';
import Select from 'react-select';
import axios from 'axios';

export default function Survey(props) {

    const url = "http://18.136.217.164:3001"
    
    const [survey, setSurvey] = useState(false)
    const [instruct, setInst] = useState(false)

    const [sex, setSex] = useState('')
    const [educ, setEduc] = useState('')

    const nameRef = React.createRef()
    const ageRef = React.createRef()
    const sexRef = React.createRef()
    const educRef = React.createRef()

    const startSurvey = () => {
        setSurvey(true)
    }

    const validateNameField = (input) => {
        let tempValid = true
        let tempEM = ''
        console.log('input', input)
        if (input == '') {
            tempValid = false
            tempEM = "Walang inilagay"
        }
        return [tempValid, tempEM]
    }

    const validateAgeField = (input) => {
        let tempValid = true
        let tempEM = ''
        console.log('input', input)
        if (!isPositiveInteger(input)) {
            tempValid = false
            tempEM = "Maglagay ng positibong numero"
        }
        if (parseInt(input) < 0) {
            tempValid = false
            tempEM = "Bawal ang negatibong numero"
        }
        if (input == '') {
            tempValid = false
            tempEM = "Walang inilagay"
        }
        return [tempValid, tempEM]
    }

    const handleSexSelect = (e) => {
        setSex(e)
    }

    const handleEducSelect = (e) => {
        setEduc(e)
    }

    const isPositiveInteger = (str) => {
        return /^(0|[1-9]\d*)$/.test(str)
    }

    const submitSurvey = () => {
        if (props.code == null && nameRef == null && ageRef == null && sex == '' && educ == '') {
            return
        }
        const req = {
            code: props.code,
            name: nameRef.current.input,
            age: ageRef.current.input,
            sex: sex.value,
            educ: educ.value
        }
        axios.post(url + '/survey/submit', req).then(() => {
            setInst(true)
            setSurvey(false)
        }).catch(e => {
            console.log(e)
        })
    }

    return (
        <div className="Survey">
            {instruct ? 
            <Fade>
                <div className="SurveyWelcome">
                    <div className="FinishLabel">
                        Guidelines
                    </div>
                    <div className="SWelcomeText">
                        <ul>
                            <li>
                                In annotating the number of people, we count the number of people at the end of the video. The driver is included in the count.
                            </li>
                            <li>
                                For boarding and alighting, even people only caught in the act of doing so are still counted.
                            </li>
                            <li>
                                Not following COVID guidelines include: not wearing a facemask or faceshield and not practicing social distancing.
                            </li>
                        </ul>
                        <button className="GetStarted" onClick={() => {window.location.reload()}}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            </Fade>
            :
            <div className="SurveyWelcome">
                <h1 className="SWelcomeHeader">
                    Hi!
                </h1>
                <div className="SWelcomeText">
                    Welcome to Waypoint's annotation page. Before proceeding, we would like to ask you for a survey. The information received will be used as part of our research and data aggregation methods.
                </div>
                <Fade when={!survey}>
                    <button className="GetStarted" onClick={startSurvey}>
                        GET STARTED
                    </button>
                </Fade>
            </div>}
            <div className="SurveyFormContainer">
                <Fade right when={survey}>
                    <div className="ContentSection" style={{width: '80%', height: '70%'}}>
                        <form className="SurveyForm" autoComplete="off">
                            <FormField ref={nameRef} validateField={validateNameField} className="FormField" fieldName="name" labelName="Pangalan" type="text" />
                            <FormField ref={ageRef} validateField={validateAgeField} className="FormField" fieldName="age" labelName="Edad" type="text" />
                            <Select ref={sexRef} isSearchable={false} className="FormSelect smargin2" onChange={handleSexSelect} options={[{value: 'M', label: 'Lalaki'}, {value: 'F', label: 'Babae'}]} placeholder="Kasarian" />
                            <Select ref={educRef} isSearchable={false} className="FormSelect smargin2" onChange={handleEducSelect} options={[{value: 'Elementary', label: 'Elementary'}, {value: 'High School', label: 'High School'}, {value: 'Undergraduate', label: 'Undergraduate'}, {value: 'Graduate', label: 'Graduate'}]} placeholder="Edukasyon" />
                            <button className="SurveySubmit" onClick={submitSurvey} type="button">
                                SUBMIT
                            </button>
                        </form>
                    </div>
                </Fade>
            </div>
        </div>
    )
}