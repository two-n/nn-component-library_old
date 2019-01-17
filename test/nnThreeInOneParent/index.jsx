import React from "react"
import { nnThreeInOne } from "../nnThreeInOne/index.jsx"
import data from "../nnThreeInOne/data.js"

const views = ['bar', 'heatmap', 'treemap']

const Constants = {
  DATE: "Date",
  OPEN: "Open",
  HIGH: "High",
  LOW: "Low",
  CLOSE: "Close",
  ADJCLOSE: "Adjusted_close",
  VOLUME: "Volume"
}
const { DATE, OPEN, HIGH, LOW, CLOSE, ADJCLOSE, VOLUME } = Constants

export class nnThreeInOneParent extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			view: "heatmap",
			componentWidth: null,
			componentHeight: null
		}
		this.toggle = this.toggle.bind(this)
		this.onResize = this.onResize.bind(this)
	}

	toggle() {
		this.setState({ view: views[(views.indexOf(this.state.view) + 1) % 3] })
	}

	componentWillMount() {
		window.addEventListener('resize', () => {
			this.onResize()
		})
		this.onResize()
	}

	componentWillUnmount() {
		window.removeEventListener('resize') // prevent memory leaks
	}

	onResize() {
		this.setState({
			componentHeight: Math.min(600, window.innerHeight),
			componentWidth: Math.min(900, window.innerWidth)
		})
	}

	render() {

		let cleanData = data
			.map(d => Object.assign({}, d,
				{ [OPEN]: +d[OPEN],
					[HIGH]: +d[HIGH],
					[LOW]: +d[LOW],
					[CLOSE]: +d[CLOSE],
					[ADJCLOSE]: +d[ADJCLOSE],
					[VOLUME]: +d[VOLUME]
				}))

		return(
			<div className="nnThreeInOneParent">	
				<nnThreeInOne
					data={cleanData}
					componentHeight={this.state.componentHeight}
					componentWidth={this.state.componentWidth}
					view={this.state.view}
					sizeKey={'High'}
					colorKey={'Volume'}
					sortKey={'Volume'}
					label={this.state.view !== 'bar'}
					primary={'Volume'}
					secondary={'Date'}
					onHover={(d) => {console.log('hovering on', d)}}
					onClick={(d) => {console.log('clicked on', d)}}
					style={{
						position: "absolute",
						top: "10px",
						left: "10px"
					}}
		  	/>
				<button className="button" onClick={this.toggle}>
					toggle
				</button>
			</div>
		)
	}
}