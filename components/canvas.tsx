import {useState, useRef, useEffect} from 'react';
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
    const [backgroundColor, setBackgroundColor] = useState(theme.colorBgContainer);
    const [canvasWidth, setCanvasWidth] = useState(200);
    

    const drawBox = () => {
        const ctx = canvasRef.current.getContext('2d'); 
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

    useEffect(()=> {
        drawBox()
    }, [])

    const draw = (e) => { //response to Draw button click 
        setMode('draw')
    }

    const erase = () => { //response to Erase button click
        setMode('erase')
    }

    const drawing = (e) => { //if the pen is down in the canvas, draw/erase
        //console.log(canvasRef.current.getContext('2d'))
        const ctx = canvasRef.current.getContext('2d');
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

    const penDown = (e) => { //mouse is down on the canvas
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

    const setColor = (c) =>{ //a color button was clicked
        setPenColor(c)
    }

    const reset = () => { //clears it to all white, resets state to original
        drawBox()
        const ctx = canvasRef.current.getContext('2d'); 
        setMode('draw')
        setPen('up')
        /setLineWidth(baseLineWidth)
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

/*const styles = {
    canvas : {
        border:'1px solid #333',
        margin:'20px 0px'
    },

    maindiv : {
        padding:'10px',
        margin:'auto',
        width:'800px'
    },

    button : {
        border:'0px',
        margin:'1px',
        height:'50px',
        minWidth:'75px'
    },

    colorSwatches : {        
        red : {'backgroundColor' : 'red'},    
        orange : {'backgroundColor' : 'orange'},
        yellow : {'backgroundColor' : 'yellow'},
        green : {'backgroundColor' : 'green'},
        blue : {'backgroundColor' : 'blue'},
        purple : {'backgroundColor' : 'purple'},
        black : {'backgroundColor' : 'black'}
    }
}

//simple draw component made in react
class DrawApp extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.reset()
    }

    draw(e) { //response to Draw button click 
        this.setState({
            mode:'draw'
        })
    }

    erase() { //response to Erase button click
        this.setState({
            mode:'erase'
        })
    }

    drawing(e) { //if the pen is down in the canvas, draw/erase

        if(this.state.pen === 'down') {

            ctx.beginPath()
            ctx.lineWidth = this.state.lineWidth
            ctx.lineCap = 'round';


            if(this.state.mode === 'draw') {
                ctx.strokeStyle = this.state.penColor
            }

            if(this.state.mode === 'erase') {
                ctx.strokeStyle = '#ffffff'
            }

            ctx.moveTo(this.state.penCoords[0], this.state.penCoords[1]) //move to old position
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY) //draw to new position
            ctx.stroke();

            this.setState({ //save new position 
                penCoords:[e.nativeEvent.offsetX, e.nativeEvent.offsetY]
            })
        }
    }

    penDown(e) { //mouse is down on the canvas
        this.setState({
            pen:'down',
            penCoords:[e.nativeEvent.offsetX, e.nativeEvent.offsetY]
        })
    }

    penUp() { //mouse is up on the canvas
        this.setState({
            pen:'up'
        })
    }

    penSizeUp(){ //increase pen size button clicked
        this.setState({
            lineWidth: this.state.lineWidth += 5
        })
    }

    penSizeDown() {//decrease pen size button clicked
        this.setState({
            lineWidth: this.state.lineWidth -= 5
        })
    }

    setColor(c){ //a color button was clicked
        this.setState({
            penColor : c
        })
    }

    reset() { //clears it to all white, resets state to original
        this.setState({
            mode: 'draw',
            pen : 'up',
            lineWidth : 10,
            penColor : 'black'
        })

        ctx = this.refs.canvas.getContext('2d')
        ctx.fillStyle="white"
        ctx.fillRect(0,0,800,600)
        ctx.lineWidth = 10
    }

    render() {
        return (
            <div style={styles.maindiv}>
                <h3>Super Simple React Drawing Component</h3>
                <h4>Pen by Jason.lough@gmail.com</h4>
                <canvas ref="canvas" width="800px" height="600px" style={styles.canvas} 
                    onMouseMove={(e)=>this.drawing(e)} 
                    onMouseDown={(e)=>this.penDown(e)} 
                    onMouseUp={(e)=>this.penUp(e)}>
                </canvas>
                <div>
                    <button onClick={(e)=>this.draw(e)} style={styles.btn, styles.button}>Draw</button>
                    <button onClick={(e)=>this.erase(e)} style={styles.btn, styles.button}>Erase</button>
                    <button onClick={(e)=>this.penSizeUp()} style={styles.btn, styles.button}>Pen Size +</button>
                    <button onClick={(e)=>this.penSizeDown()} style={styles.btn, styles.button}>Pen Size -</button>
                    <button onClick={()=>this.reset()} style={styles.btn, styles.button}>Reset</button>
                </div>
                <div>
                    <button style={Object.assign({}, styles.colorSwatches.red, styles.button)} onClick={()=>this.setColor('red')}>Red</button>
                    <button style={Object.assign({}, styles.colorSwatches.orange, styles.button)} onClick={()=>this.setColor('orange')}>Orange</button>
                    <button style={Object.assign({}, styles.colorSwatches.yellow, styles.button)} onClick={()=>this.setColor('yellow')}>Yellow</button>
                    <button style={Object.assign({}, styles.colorSwatches.green, styles.button)} onClick={()=>this.setColor('green')}>Green</button>
                    <button style={Object.assign({}, styles.colorSwatches.blue, styles.button)} onClick={()=>this.setColor('blue')}>Blue</button>
                    <button style={Object.assign({}, styles.colorSwatches.purple, styles.button)} onClick={()=>this.setColor('purple')}>Purple</button>
                    <button style={Object.assign({}, styles.colorSwatches.black, styles.button)} onClick={()=>this.setColor('black')}>Black</button>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<DrawApp />, document.getElementById('da'))*/