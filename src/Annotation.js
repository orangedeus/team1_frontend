
import axios from 'axios';
import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle } from 'react';
import Fade from 'react-reveal';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import { useSpring, animated, config } from 'react-spring';

import FormField from './FormField';



const ConditionalReactPlayer = (props) => {

    useEffect(() => { console.log(props.i, props.index, within()) }, [props.index])

    const within = () => {
        if ((props.i < props.index + 2) && (props.i > props.index - 2)) {
            return true
        } else {
            return false
        }
    }

    return (
        <div key={`video-container-${props.i}`} className="VideoContainer">
            {within() ? <ReactPlayer ref={props.ref} id={`video-player-${props.i}`} key={`video-player-${props.i}`} playing={false} url={props.url} stopOnUnmount={true} width={640} height={360} controls={true}/> : ""}
        </div>
    )
}

export default function Annotation(props) {
    const ERRORMSGS = [
        'Maglagay ng numero',
        'Di tumatanggap nang mas mababa sa zero'
    ]


    const url = "http://18.136.217.164:3001"

    const annotatedRef = React.createRef()
    const boardingRef = React.createRef()
    const alightingRef = React.createRef()
    const selectRef = React.createRef()

    const [videos, setVideos] = useState([])
    const [index, setIndex] = useState(0)
    let [rendered, setRendered] = useState([])
    const [selected, setSelected] = useState({})
    const [validForm, setVF] = useState(true)
    const [playerRefs, setPR] = useState([])


    const prevIndexRef = useRef()
    const maxIndexRef = useRef(0)

    useEffect(() => {

        //handleIndexMove()

        prevIndexRef.current = index
        maxIndexRef.current = Math.max(maxIndexRef.current, index)

        if (index + 2 < videos.length + 1) {
            addToRenderedCondition(index + 2)
        }
        formReset()
        
    }, [index])
    

    useEffect(() => {
        if (videos.length != 0) {
            setPR(playerRefs => (
                Array(videos.length).fill().map((_, i) => playerRefs[i] || React.createRef())
            ))
        }
    }, [videos])

    useEffect(() => {
        if (rendered.length == 0) {
            addToRenderedCondition(index + 2)
        }
    }, [playerRefs])

    useEffect(() => {
        if (!validForm) {
            setTimeout(() => {
                setVF(true)
            }, 3000)
        }
    }, [validForm])

    const prevIndex = prevIndexRef.current
    const maxIndex = maxIndexRef.current

    const { scroll } = useSpring({
        scroll: index * 600,
        from: { scroll: ((prevIndex ? prevIndex : 0) * 600)},
    })

    useEffect(() => {
        axios.get(url + '/stops').then(res => {
            setVideos(res.data.map((stop, i) => {
                return ({url: stop.url})
            }))
        })
    }, [])

    const addToRenderedCondition = (i) => {
        if (videos.length == 0) { /* If there is no data, render nothing */
            return
        }
        if (playerRefs[i - 1].current != null) {
            return
        }
        /* if (added[i]) {
            return
        } */
        setRendered((curr) => {
            let tempRendered = []
            for (let j = 0; j < i; j++) {
                tempRendered.push(
                    <ConditionalReactPlayer key={`condrp-${j}`} ref={playerRefs[j]} i={j} index={index} url={url + '/videos/' + videos[j].url} />
                )
            }
            return tempRendered
        })
        /* setAdded((curr) => {
            let tempAdded = [...curr]
            tempAdded[i] = true
            return tempAdded
        }) */
    }

    const handleIndexMove = () => {
        if (rendered.length == 0) {
            return
        }
        if (index - 1 > 0) {
            showVideoPlayer(index - 1)
        }
        if (index + 1 > 0 && index + 1 < rendered.length) {
            showVideoPlayer(index + 1)
        }
        if (index - 2 > 0) {
            hideVideoPlayer(index - 2)
        }
        if (index + 2 > 0 && index + 2 < rendered.length) {
            hideVideoPlayer(index + 2)
        }
    }

    const hideVideoPlayer = (i) => {
        let playerContainer = document.getElementById(`video-player-${i}`);
        playerContainer.style.display = "none"
    }

    const showVideoPlayer = (i) => {
        let playerContainer = document.getElementById(`video-player-${i}`);
        playerContainer.style.display = ""
    }

    const handleVideoScroll = (e) => {
        if (e.deltaY < 0) {
            if (index > 0) {
                setIndex(curr => {return (curr - 1)})
                formReset()
            }
        } else {
            if (index < videos.length - 1) {
                setIndex(curr => {return (curr + 1)})
                formReset()
            }
        }
    }

    const handlePrev = () => {
        if (index > 0) {
            setIndex(curr => {return (curr - 1)})
            formReset()
        }
    }

    const handleNext = () => {
        if (index < videos.length - 1) {
            setIndex(curr => {return (curr + 1)})
            formReset()
        }
    }

    

    const validateForm = () => {
        let fieldValid = (annotatedRef.current.input != null && boardingRef.current.input != null && alightingRef.current.input != null && annotatedRef.current.valid && boardingRef.current.valid && alightingRef.current.valid)
        console.log('1', (selectRef.current != null && selectRef.current.state.value != ""))
        console.log('current', selectRef.current, 'value', selectRef.current.state.value)
        let selectValid = (selectRef.current != null && selectRef.current.state.value != "" && selectRef.current.state.value != null)
        
        
        let bool = (fieldValid && selectValid)
        setVF(bool)
        if (bool) {
            handleAnnotate().then((res) => {
                if (index < videos.length - 1) setIndex(index + 1)
                console.log(res)
            })
        }
    }

    const handleAnnotate = async () => {
        let annotated = annotatedRef.current.input
        let boarding = boardingRef.current.input
        let alighting = alightingRef.current.input
        let following = selected.value

        let res = await axios.post(url + '/stops/annotate', {
            annotated: annotated,
            boarding: boarding,
            alighting: alighting,
            following: following,
            url: videos[index].url,
            code: props.code
        })
        return res
    }

    const isPositiveInteger = (str) => {
        return /^(0|[1-9]\d*)$/.test(str)
    }

    const validateField = (input) => {
        let tempValid = true
        let tempEM = ''
        console.log('input', input)
        if (!isPositiveInteger(input)) {
            tempValid = false
            tempEM = ERRORMSGS[0]
        }
        if (parseInt(input) < 0) {
            tempValid = false
            tempEM = ERRORMSGS[1]
        }
        if (input == '') {
            tempValid = false
            tempEM = ERRORMSGS[0]
        }
        return [tempValid, tempEM]
    }

    const formReset = () => {
        annotatedRef.current.reset()
        boardingRef.current.reset()
        alightingRef.current.reset()
        selectRef.current.state.value = null
    }

    const handleFormSelect = (e) => {
        setSelected(e)
    }

    return(
        <div className="Annotation">
            <animated.div className="AnnotationVideosContainer" scrollTop={scroll} onScroll={(e) => e.preventDefault()} onTouchMove={(e) => console.log('touching')} onWheel={handleVideoScroll}>
                {rendered}
            </animated.div>
            <div className="AnnotationFormContainer">
                <div className="CustomScrollBar">
                    <span className="up" onClick={handlePrev}/>
                    <span className="down"onClick={handleNext}/>
                </div>
                <div className="FormContainer">
                    <h1>{`${index + 1} / ${videos.length}`}</h1>
                    <Fade left collapse opposite when={!validForm}>
                        <div className="ErrorBox" >
                            <div className="ErrorIcon">!</div>
                            <div className="ErrorMessage">
                                May mali sa mga ibinigay.
                            </div>
                        </div>
                    </Fade>
                    <form autoComplete="off" s className="AnnotationForm">
                        <Select ref={selectRef} isSearchable={false} className="FormSelect" onChange={handleFormSelect} options={[{value: true, label: 'Oo'}, {value: false, label: 'Hindi'}]} placeholder="Sumusunod sa COVID Guidelines?" />
                        <FormField ref={annotatedRef} validateField={validateField} className="FormField" fieldName="annotated" labelName="Bilang ng tao sa dulo ng bidyo" type="text" />
                        <FormField ref={boardingRef} validateField={validateField} className="FormField" fieldName="boarding" labelName="Sumakay" type="text" />
                        <FormField ref={alightingRef} validateField={validateField} className="FormField" fieldName="alighting" labelName="Bumaba" type="text" />
                        <button type="button" onClick={validateForm} className="btn2">ANNOTATE</button>
                    </form>
                </div>
            </div>
        </div>
    )
}