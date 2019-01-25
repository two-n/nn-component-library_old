import React from "react"
import { NNThreeInOne } from "../nnThreeInOne/index.jsx"
import { NNTicker } from "../nnTicker/index.jsx"
import { interpolateSpectral } from "d3-scale-chromatic"
import { scaleLinear, scaleSequential } from "d3-scale"
import { extent } from "d3-array"
import data from "./data.js"

import "./style.css";

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

const colorScale = scaleSequential(interpolateSpectral)
	.domain(extent(data.map(d => +d[VOLUME])))

export class NNThreeInOneParent extends React.Component {

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
			// <div className="nnThreeInOneParent">	
			// 	<NNThreeInOne
			// 		data={cleanData}
			// 		componentHeight={this.state.componentHeight}
			// 		componentWidth={this.state.componentWidth}
			// 		view={this.state.view}
			// 		sizeKey={'High'}
			// 		colorKey={'Volume'}
			// 		// colorScale={colorScale}
			// 		sortKey={'Volume'}
			// 		label={this.state.view !== 'bar'}
			// 		primary={'Volume'}
			// 		secondary={'Date'}
			// 		onHover={(d) => {console.log('hovering on', d)}}
			// 		onClick={(d) => {console.log('clicked on', d)}}
			// 		style={{
			// 			position: "absolute",
			// 			top: "10px",
			// 			left: "10px"
			// 		}}
		 //  	/>
			// 	<button className="button" onClick={this.toggle}>
			// 		toggle
			// 	</button>
				<NNTicker/>
			// </div>
		)
	}
}