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
            validateField()
        }
    }, [input])

    const isPositiveInteger = (str) => {
        return /^(0|[1-9]\d*)$/.test(str)
    }

    const validateField = () => {
        let tempValid = true
        console.log('input', input)
        if (!isPositiveInteger(input)) {
            tempValid = false
            setErrorMsg(ERRORMSGS[0])
        }
        if (parseInt(input) < 0) {
            tempValid = false
            setErrorMsg(ERRORMSGS[1])
        }
        if (input == '') {
            tempValid = false
            setErrorMsg(ERRORMSGS[0])
        }
        setValid(tempValid)
    }

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