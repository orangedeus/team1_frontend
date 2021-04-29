
import axios from 'axios';
import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle } from 'react';
import Fade from 'react-reveal';
import ReactPlayer from 'react-player';
import Select from 'react-select';
import { useSpring, animated, config } from 'react-spring';

import FormField from './FormField';

export default function Annotation(props) {


    const url = "http://18.136.217.164:3001"

    const annotatedRef = React.createRef()
    const boardingRef = React.createRef()
    const alightingRef = React.createRef()
    const selectRef = React.createRef()

    const [videos, setVideos] = useState([])
    const [index, setIndex] = useState(0)
    const [added, setAdded] = useState([])
    const [rendered, setRendered] = useState([])
    const [selected, setSelected] = useState({})
    const [validForm, setVF] = useState(true)


    const prevIndexRef = useRef()

    useEffect(() => {

        prevIndexRef.current = index

        if (index < videos.length - 1) {
            console.log('preloading', index, index + 1)
            addToRenderedCondition(index + 1)
        }
        formReset()
        
    }, [index])

    useEffect(() => {
        if (added.length == 0 && videos.length != 0) {
            setAdded(new Array(videos.length).fill(false))
        }
    }, [videos])

    useEffect(() => {
        if (rendered.length == 0) {
            addToRenderedCondition(index)
            addToRenderedCondition(index + 1)
        }
    }, [added])

    useEffect(() => {
        if (!validForm) {
            setTimeout(() => {
                setVF(true)
            }, 3000)
        }
    }, [validForm])

    const prevIndex = prevIndexRef.current

    const { scroll } = useSpring({
        scroll: index * 600,
        from: { scroll: ((prevIndex ? prevIndex : 0) * 600)},
    })

    useEffect(() => {
        axios.get(url + '/stops').then(res => {
            setVideos(res.data.map((stop, i) => {
                if (index == i) {
                    return ({url: stop.url})
                } else {
                    return ({url: stop.url})
                }
            }))
        })
    }, [])

    const addToRenderedCondition = (i) => {
        if (videos.length == 0) { /* If there is no data, render nothing */
            return
        }
        if (added[i]) { /* If data at index i is already added, add nothing */
            return
        }
        console.log('made it!', i)
        setRendered((curr) => {
            let tempRendered = [...curr]
            tempRendered.push(
                <div key={`video-container-${i}`} className="VideoContainer">
                    <ReactPlayer key={`video-player-${i}`} playing={false} url={url + '/videos/' + videos[i].url} stopOnUnmount={true} width={640} height={360} controls={true}/>
                </div>
            )
            return tempRendered
        })
        setAdded((curr) => {
            let tempAdded = [...curr]
            tempAdded[i] = true
            return tempAdded
        })
    }

    const handleVideoScroll = (e) => {
        if (e.deltaY < 0) {
            if (index > 0) {
                setIndex(curr => {return (curr - 1)})
                formReset()
            }
        } else {
            if (index < videos.length) {
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
        if (index < videos.length) {
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
                if (index < videos.length) setIndex(index + 1)
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
                    <h1>{`${index} / ${videos.length}`}</h1>
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
                        <FormField ref={annotatedRef} className="FormField" fieldName="annotated" labelName="Bilang ng tao sa dulo ng bidyo" type="text" />
                        <FormField ref={boardingRef} className="FormField" fieldName="boarding" labelName="Sumakay" type="text" />
                        <FormField ref={alightingRef} className="FormField" fieldName="alighting" labelName="Bumaba" type="text" />
                        <button type="button" onClick={validateForm} className="btn2">ANNOTATE</button>
                    </form>
                </div>
            </div>
        </div>
    )
}