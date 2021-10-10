import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';

export default function SliderButton(props) {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState('right')
    const [padding, setPadding] = useState([])
    const [paddingWidth, setPaddingWidth] = useState(0)
    const [dimensions, setDimensions] = useState({ width:0, height: 0 });

    useEffect(() => {
        let tempPadding = []
        for (let i = 0; i < current; i++) {
            tempPadding.push(
                <div style={{...styles[2]}} />
            )
        }
        setPadding(tempPadding)

        let tempPaddingWidth = Math.max(0, (current * ((1 / (props.options - 1)) * dimensions.width)) - 25)
        setPaddingWidth(tempPaddingWidth)
    }, [current])

    const containerRef = useRef()
    const knobRef = useRef()

    useLayoutEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            })
        }
    }, [])

    const styles = [
        {
            borderRadius: props.height,
            backgroundColor: '#DDDDDD',
            padding: 3,
            display: 'flex',
            flexDirection: 'row',
            cursor: 'pointer'
        },
        {
            borderRadius: props.height,
            backgroundColor: 'white',
            borderColor: 'black',
            height: '100%',
            width: props.height,
            boxShadow: '0 10px 12px -2px rgba(0, 0, 0, 0.1), 0 5px 5px -2px rgba(0, 0, 0, 0.2)'
        },
        {
            width: paddingWidth,
            height: '100%',
            transition: 'ease-in 0.2s'
        }
    ]
//`${((((1 / props.options) * 100) + ((1 / props.options) * 19)).toFixed(2))}%`
    const handleClick = () => {
        if (direction == 'right') {
            setCurrent((curr) => {
                return curr + 1
            })
            if (current + 2 == props.options) {
                setDirection('left')
            }
        } else {
            setCurrent((curr) => {
                return curr - 1
            })
            if (current - 1 < 1) {
                setDirection('right')
            }
        }
    }

    const handleClick2 = (e) => {
        
        if (knobRef.current.getBoundingClientRect().x < e.clientX) {
            if (current + 1 < props.options) {
                setCurrent((curr) => {
                    return curr + 1
                })
            }
        } else {
            if (current - 1 > -1) {
                setCurrent((curr) => {
                    return curr - 1
                })
            }
        }
    }

    return(
        <div ref={containerRef} style={{width: props.width, height: props.height, ...styles[0]}} onClick={handleClick2}>
            <div style={{...styles[2]}} />
            <div ref={knobRef} id="knob" style={{...styles[1]}}/>
        </div>
    )
}