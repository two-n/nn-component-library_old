import React from "react"
import {PropTypes} from "prop-types"
import {scaleLinear} from "d3-scale"
import {interpolateRdYlGn} from "d3-scale-chromatic"

import "./style.css"

export class NNThreeInOne extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			scale: scaleLinear()
				.domain(
					[Math.min(...this.props.data.map(d => +d[this.props.sizeKey])), 
					 Math.max(...this.props.data.map(d => +d[this.props.sizeKey]))])
				.range([0, this.props.componentHeight]),
			dataLength: this.props.data.length,
			componentHeight: this.props.componentHeight,
			componentWidth: this.props.componentWidth
		}
		this.calcHeatmapPosition = this.calcHeatmapPosition.bind(this)
		this.calcBarPosition = this.calcBarPosition.bind(this)
		this.calcColorValue = this.calcColorValue.bind(this)
	}

	calcHeatmapPosition(i) {
		const rows = 3
		const columns = 7
		const margin = 2

		const height = this.state.componentHeight / columns
		const width = this.state.componentWidth / rows
		const top = i % (this.state.dataLength / rows) * (height + margin)
		const left = i % (this.state.dataLength / columns) * (width + margin)

		return { height, width, top, left }
	}

	calcBarPosition(bar, i) {
		const margin = 2

		const height = this.state.scale(bar[this.props.sizeKey])
		const width = this.state.componentWidth / this.state.dataLength
		const top = this.state.componentHeight - height
		const left = i * (width + margin)
	
		return { height, width, top, left }
	}

	// calcTreemapPosition(props, i) {
	//
	// 	return { height, width, top, left }
	// }

	calcColorValue(colorData) {
		return interpolateRdYlGn(colorData/1000000)
	}

	render() {
		const { data, componentHeight, componentWidth, view, sizeKey, colorKey, label, onHover, onClick } = this.props
		return (
			<div className="nnThreeInOneComponent" ref="nnThreeInOneComponent">
				{data.map((d,i) => {
					let position 
					let sizeValue
					const colorValue = this.calcColorValue(d[colorKey])
					if (view === 'heatmap') {position = this.calcHeatmapPosition(i)}
					else if (view === 'bar') {position = this.calcBarPosition(d, i)}
					// else if (view === 'treemap') {position = this.calcTreemapPosition(this.props, i)}
					return <div className={`${view}_card`} key={`${d.Ticker}_${i}`}
						style={{...position, backgroundColor: colorValue }}
					>
						{view !== 'bar' ? 
							<div>
								<div className={`${view}_ticker`}>
									{`${d.Ticker}`}
								</div>
								<div className={`${view}_name`}>
									{`${d.Name}`}
								</div>
							</div>
						: null }
					</div>
					}
				)}
			</div>
		)
	}
}

NNThreeInOne.propTypes = {
	data: PropTypes.arrayOf(PropTypes.shape({
		Ticker: PropTypes.string,
		Name: PropTypes.string,
		Date: PropTypes.string,
    Open: PropTypes.string,
    High: PropTypes.string,
    Low: PropTypes.string,
    Close: PropTypes.string,
    Adjusted_close: PropTypes.string,
    Volume: PropTypes.string
	})).isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	view: PropTypes.oneOf(['treemap', 'heatmap', 'bar']).isRequired,
	sizeKey: PropTypes.string.isRequired,
	colorKey: PropTypes.string.isRequired,
	label: PropTypes.bool,
	onHover: PropTypes.func,
	onClick: PropTypes.func
}