import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Fade from 'react-reveal';

const FormField = forwardRef((props, ref) => {

    const ERRORMSGS = [
        'Maglagay ng numero',
        'Di tumatanggap nang mas mababa sa zero'
    ]

    const [valid, setValid] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')
    const [input, setInput] = useState(null)
    const inputRef = React.createRef()

    useImperativeHandle(ref, () => ({
        valid: valid,
        input: input,
        delay: 0,
        reset: () => {
            setValid(true)
            setErrorMsg('')
            setInput(null)
            inputRef.current.value = ''
        }
    }))

    useEffect(() => {
        if (!(input == null)) {
            let [tempValid, errorMessage] = props.validateField(input)
            console.log(tempValid, errorMessage)
            setValid(tempValid)
            setErrorMsg(errorMessage)
        }
    }, [input])

    const handleInputChange = (e) => {
        setInput(e.target.value)
    }

    return (
        <div className={`${props.className} --FormField`}>
            <label className="FormLabel" style={{display: 'grid'}} htmlFor={props.fieldName}>{props.labelName}</label>
            <input ref={inputRef} className="FormInputBox" style={{display: 'grid'}} id={props.fieldName} onChange={handleInputChange} type={props.type} min={0} />
            <Fade bottom collapse when={!valid}>
                <small className="error-msg" style={{display: 'grid', position: 'static', color: 'red'}}>
                    {errorMsg}
                </small>
            </Fade>
        </div>
    )
})

export default FormField;