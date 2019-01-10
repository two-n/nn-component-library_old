import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleTime } from "d3-scale"
import { extent } from "d3-array"
import { select } from "d3-selection"
import * as d3Axis from "d3-axis"
import { line, curveMonotoneX } from "d3-shape"

import "./style.css";

class Axis extends React.Component {

	componentDidMount() {
		this.drawAxis()
	}

	componentDidUpdate() {
		this.drawAxis()
	}

	drawAxis() {
		const axisType = `axis${this.props.orient}`
    const axis = d3Axis[axisType]()
			.scale(this.props.scale)
			.ticks(this.props.ticks, this.props.format)
			.tickSize(this.props.tickSize)

		select(this.axisElement).call(axis)
	}

	render() {
		return (
			<g 
				className={`axis axis-${this.props.orient.toLowerCase()}`}
				ref={(el) => {this.axisElement = el}}
				transform={this.props.translate}
			/>
		)
	}
}

export class NNLineChart extends React.Component {

	_onHover(hoverOptions, event) {
		const { combinedLineData, xScale, yScale, xAxisKey, yAxisKey } = hoverOptions

		const xPos = event.screenX
		const yPos = event.screenY

		const roundDate = (date) => {
			return new Date(date.getFullYear(), date.getMonth(), date.getDate())
		}

		const xPosValue = xScale.invert(xPos)
		const yPosValue = yScale.invert(yPos)

		const yValues = combinedLineData.filter(e => {
			console.log(roundDate(e[xAxisKey]))
			roundDate(e[xAxisKey]) === roundDate(xPosValue)
		})

		console.log(roundDate(xPosValue))
		console.log(yPosValue)
		console.log(yValues)

		// const mouseData = {
		// 	data: data,
		// 	x: xScale(roundDate(xPosValue)),
		// 	y: yScale(nearestLine)
		// }
		// onHover(mouseData)
	}

	render() {
		const { data, componentHeight, componentWidth, colorScale, colorScaleKey, 
			xAxisKey, xAxisFormat, yAxisKey, yAxisFormat, dataKey, onHover } = this.props

		const margin = { top: 10, bottom: 30, left: 30, right: 10 }
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const combinedLineData = [].concat(...data.map(d => d[dataKey]))

		const xScale = scaleTime()
			.domain(extent(combinedLineData.map(d => d[xAxisKey])))
			.range([0, chartWidth])
		const yScale = scaleLinear()
			.domain(extent(combinedLineData.map(d => +d[yAxisKey])))
			.range([chartHeight, 0])
			.nice()

		const hoverOptions = {
			combinedLineData,
			xScale,
			yScale,
			xAxisKey,
			yAxisKey
		}

		return(
			<g> 
				<g>
					<Axis 
						orient={'Bottom'}
						scale={xScale}
						format={xAxisFormat}
						ticks={3}
						tickSize={chartHeight + 5}
						translate={`translate(${margin.left}, ${margin.top})`}/>
					<Axis 
						orient={'Left'}
						scale={yScale}
						format={yAxisFormat}
						ticks={5}
						tickSize={chartWidth}
						translate={`translate(${componentWidth - margin.right}, ${margin.top})`}/>
				</g>
				{data.map((d,i) => 
					<path
						key={d[colorScaleKey]}
						stroke={colorScale(d[colorScaleKey])}
						strokeWidth='1'
						fill='none'
						d={
							line()
								.x((d, i) => xScale(d[xAxisKey]) + margin.left)
								.y((d) => yScale(d[yAxisKey]) + margin.top)
								.curve(curveMonotoneX)(d[dataKey])
						}
					/>
				)}
				<rect
					width={componentWidth}
					height={componentHeight}
					onMouseMove={this._onHover.bind(this, hoverOptions)}
					style={{fill: 'blue', opacity: 0, pointerEvents: 'all'}}
					>
				</rect>
			</g>
		)
	}
}

NNLineChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	colorScale: PropTypes.func.isRequired,
	colorScaleKey: PropTypes.string.isRequired,
	xAxisKey: PropTypes.string.isRequired,
	xAxisFormat: PropTypes.string,
	yAxisKey: PropTypes.string.isRequired,
	yAxisFormat: PropTypes.string,
	dataKey: PropTypes.string.isRequired,
	onHover: PropTypes.func
}