
import axios from 'axios';
import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle } from 'react';
import Fade from 'react-reveal';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import { useSpring, animated, config } from 'react-spring';

import FormField from './FormField';
import Survey from './Survey';



const ConditionalReactPlayer = forwardRef((props, ref) => {

    const playerRef = React.useRef()

    const [played, setPlayed] = useState(0)

    console.log(props.i)

    useImperativeHandle(ref, () => ({
        getPlayed: () => {
            if (played == 0) {
                return 0
            } else {
                return (Date.now() - played) / 1000
            }
        },
        getCurrentTime: playerRef.current ? playerRef.current.getCurrentTime : () => { return 0 }
    }))

    const within = () => {
        if ((props.i < props.index + 2) && (props.i > props.index - 2)) {
            return true
        } else {
            return false
        }
    }

    const handlePlay = () => {
        if (played == 0) {
            setPlayed(Date.now())
        }
    }

    return (
        <div key={`video-container-${props.i}`} className="VideoContainer">
            {within() ? <ReactPlayer ref={playerRef} id={`video-player-${props.i}`} key={`video-player-${props.i}`} playing={false} url={props.url} onPlay={handlePlay} stopOnUnmount={true} width={640} height={360} controls={true}/> : ""}
        </div>
    )
})

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
    const [rendered, setRendered] = useState([])
    const [selected, setSelected] = useState({})
    const [validForm, setVF] = useState(true)
    const [playerRefs, setPR] = useState([])
    const [currPlay, setCP] = useState(0)
    const [surveyed, setSurveyed] = useState(props.auth.surveyed)
    const [errorMsg, setErrorMsg] = useState('')

    const prevIndexRef = useRef()
    const maxIndexRef = useRef(0)

    useEffect(() => {

        console.log(index, playerRefs[index])

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

    // useEffect(() => {
    //     if (errorMsg != '') {
    //         setVF(false)
    //     }
    // }, [errorMsg])

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
        let storedUrls = localStorage.getItem('urls')
        if (storedUrls == null) {
            if (props.auth.code == 'Cs198ndsg!') {
                axios.get(url + '/stops').then(res => {
                    let tempUrl = res.data.map((stop, i) => {
                        return ({url: stop.url})
                    })
                    setVideos(tempUrl)
                    localStorage.setItem('urls', JSON.stringify(tempUrl))
                })
            } else {
                axios.get(url + '/stops/reduced').then(res => {
                    let tempUrl = res.data.map((stop, i) => {
                        return ({url: stop.url})
                    })
                    setVideos(tempUrl)
                    localStorage.setItem('urls', JSON.stringify(tempUrl))
                })
            }
        } else {
            setVideos(JSON.parse(storedUrls))
        }
    }, [])

    const addToRenderedCondition = (i) => {
        if (videos.length == 0) { /* If there is no data, render nothing */
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

    const changeIndex = (newIndex) => {
        if (index > 0 && newIndex == index - 1) {
            setIndex(curr => {return (curr - 1)})
        }
        if (index < videos.length - 1 && newIndex == index + 1) {
            axios.get(`${url}/stops/check/${props.auth.code}&${videos[index].url}`).then(res => {
                if (res.data.status) {
                    setIndex(curr => {return (curr + 1)})
                } else {
                    setErrorMsg('Kailangan muna ito sagutan.')
                    setTimeout(() => { setVF(false) }, 200)
                }
            }).catch(e => {
                console.log(e)
            })
        }
        formReset()
        setCP(0)
    }

    const handleVideoScroll = (e) => {
        if (e.deltaY < 0) {
            changeIndex(index - 1)
        } else {
            changeIndex(index + 1)
        }
    }

    const handlePrev = () => {
        changeIndex(index - 1)
    }

    const handleNext = () => {
        changeIndex(index + 1)
    }

    const validateForm = () => {
        let fieldValid = (annotatedRef.current.input != null && boardingRef.current.input != null && alightingRef.current.input != null && annotatedRef.current.valid && boardingRef.current.valid && alightingRef.current.valid)
        let selectValid = (selectRef.current != null && selectRef.current.state.value != "" && selectRef.current.state.value != null)
        
        
        let bool = (fieldValid && selectValid)
        setErrorMsg('May mali sa mga ibinigay.')
        setTimeout(() => { setVF(bool) }, 200)
        if (bool) {
            handleAnnotate().then((res) => {
                if (index < videos.length - 1) setIndex(index + 1)
            })
        }
    }

    const handleTimeData = () => {
        console.log(playerRefs)
        let annotateDur = playerRefs[index].current.getPlayed()
        let timePlayed = playerRefs[index].current.getCurrentTime()
        console.log('Time played:', timePlayed, 'Annotation duration:', annotateDur)
        let req = {
            code: props.auth.code,
            file: videos[index].url,
            time: timePlayed,
            duration: annotateDur
        }

        axios.post(url + '/instrumentation', req).catch(e => console.log(e))
    }

    const handleAnnotate = async () => {
        let annotated = annotatedRef.current.input
        let boarding = boardingRef.current.input
        let alighting = alightingRef.current.input
        let following = selected.value

        handleTimeData()

        let res = await axios.post(url + '/stops/annotate', {
            annotated: annotated,
            boarding: boarding,
            alighting: alighting,
            following: following,
            url: videos[index].url,
            code: props.auth.code
        })
        return res
    }

    const isPositiveInteger = (str) => {
        return /^(0|[1-9]\d*)$/.test(str)
    }

    const validateField = (input) => {
        let tempValid = true
        let tempEM = ''
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
        if (!annotatedRef.current && !alightingRef.current && !boardingRef.current) {
            return
        }

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
            {surveyed ? <><animated.div className="AnnotationVideosContainer" scrollTop={scroll}>
                {rendered}
            </animated.div>
            <div className="AnnotationFormContainer">
                <div className="CustomScrollBar">
                    <span className="up" onClick={handlePrev}/>
                    <span className="down" onClick={handleNext}/>
                </div>
                <div className="FormContainer">
                    <h1>{`${videos.length != 0 ? index + 1 : 0} / ${videos.length}`}</h1>
                    <Fade left collapse opposite when={!validForm}>
                        <div className="ErrorBox" >
                            <div className="ErrorIcon">!</div>
                            <div className="ErrorMessage">
                                {errorMsg}
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
            </div></> : <Survey code={props.auth.code} />}
        </div>
    )
}