import {useState, useRef, useEffect, useCallback} from 'react';
import { Space, Button, Card, theme } from 'antd';
const { useToken } = theme;

const Canvas = () => {
    let canvasRef = useRef();
    const { token } = useToken();
    const [mode, setMode] = useState('draw');
    const [pen, setPen] = useState('up');
    const baseLineWidth = 3;
    const [lineWidth, setLineWidth] = useState(baseLineWidth);
    const [penColor, setPenColor] = useState(token.colorTextBase);
    const [penCoords, setPenCoords] = useState([0,0]);
    const [backgroundColor, setBackgroundColor] = useState();
    
    const [canvasWidth, setCanvasWidth] = useState(200);

    const drawBox = useCallback(() => {
        const ctx = canvasRef?.current?.getContext('2d');  
        if(ctx) {
            ctx.fillStyle=backgroundColor
            ctx.fillRect(0,0, canvasWidth, canvasWidth)
            ctx.lineWidth = lineWidth
            ctx.fill()
            ctx.strokeStyle = penColor
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.setLineDash([10,10]);
            ctx.moveTo(0,0);
            ctx.lineTo(canvasWidth,canvasWidth);
            ctx.moveTo(0, canvasWidth);
            ctx.lineTo(canvasWidth,0);
            ctx.moveTo(0,canvasWidth/2);
            ctx.lineTo(canvasWidth,canvasWidth/2);
            ctx.moveTo(canvasWidth/2, 0);
            ctx.lineTo(canvasWidth/2,canvasWidth);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }        
        
    }, [canvasWidth, lineWidth, penColor, backgroundColor])

    useEffect(()=> {
        drawBox()
    }, [drawBox])

    const draw = (e: React.ChangeEvent<HTMLInputElement>) => { //response to Draw button click 
        setMode('draw')
    }

    const erase = () => { //response to Erase button click
        setMode('erase')
    }

    const drawing = (e: React.ChangeEvent<HTMLInputElement>) => { //if the pen is down in the canvas, draw/erase
        //console.log(canvasRef.current.getContext('2d'))
        const ctx = canvasRef?.current?.getContext('2d');
        if(pen === 'down') {
            ctx.beginPath()
            ctx.lineWidth = lineWidth
            ctx.lineCap = 'round';
            if(mode === 'draw') {
                ctx.strokeStyle = penColor
            }
            if(mode === 'erase') {
                ctx.strokeStyle = backgroundColor
            }
            ctx.moveTo(penCoords[0], penCoords[1]) //move to old position
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY) //draw to new position
            ctx.stroke();
            setPenCoords([e.nativeEvent.offsetX, e.nativeEvent.offsetY])
        }
    }

    const penDown = (e: React.ChangeEvent<HTMLInputElement>) => { //mouse is down on the canvas
        setPen('down')
        setPenCoords([e.nativeEvent.offsetX, e.nativeEvent.offsetY])
    }

    const penUp = () => { //mouse is up on the canvas
        setPen('up')
    }

    const penSizeUp = () => { //increase pen size button clicked
        setLineWidth(lineWidth + 5)
    }

    const penSizeDown = () => {//decrease pen size button clicked
        setLineWidth(lineWidth - 5)
    }

const setColor = (c: string) =>{ //a color button was clicked
        setPenColor(c)
    }

    const reset = () => { //clears it to all white, resets state to original
        drawBox()
        const ctx = canvasRef.current.getContext('2d'); 
        setMode('draw')
        setPen('up')
        setLineWidth(baseLineWidth)
        setPenColor(penColor)
        ctx.fillStyle=backgroundColor
        ctx.lineWidth = lineWidth
    }

    return (

        <Space direction="vertical">
            <canvas width={canvasWidth} height={canvasWidth} ref={canvasRef}
                style={{border:'1px solid', borderRadius: theme.borderRadiusSM, backgroundColor: backgroundColor, borderColor: theme.colorBorder}}
                onMouseMove={(e)=>drawing(e)} 
                onMouseDown={(e)=>penDown(e)} 
                onMouseUp={(e)=>penUp(e)}>
            </canvas>
            <Button onClick={reset}>Reset</Button>
        </Space>

    )
    
}

export default Canvas;
