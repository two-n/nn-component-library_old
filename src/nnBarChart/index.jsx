import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleTime, scaleBand } from "d3-scale"
import { discontinuitySkipWeekends } from "d3fc"
import { extent, bisect } from "d3-array"
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

export class NNBarChart extends React.Component {

	_onHover(hoverOptions, event) {
		const { dateKey, onHover } = this.props
		const { yAxisKey, dateRange, flatLineData, xScale, yScale } = hoverOptions

		const { top, left } = event.target.getBoundingClientRect()
		const xPosValue = xScale.invert(event.clientX - left)
		const yPosValue = yScale.invert(event.clientY - top)
		const date = dateRange[bisect(dateRange, xPosValue) - 1]

		const closestData = flatLineData
			.filter(d => d[dateKey].getTime() === date.getTime())
			.reduce((t,v) =>  Math.abs(yPosValue - v[yAxisKey]) < Math.abs(yPosValue - t[yAxisKey]) ? v : t, { [yAxisKey] : Infinity })

		const mouseData = {
			data: closestData,
			x: xScale(date),
			y: yScale(closestData[yAxisKey])
		}
		onHover(mouseData)
	}

	render() {
		const { data, componentHeight, componentWidth, dataKey, dateKey, dateFormat,
			yAxisKey, yAxisFormat, marginArray, translate, onHover } = this.props

		const flatLineData = [].concat(...(data))
		const dateRange = flatLineData.map(d => d[dateKey])

		const margin = { 
			top: this.props.marginArray[0], 
			right: this.props.marginArray[1],
			bottom: this.props.marginArray[2], 
			left: this.props.marginArray[3]
		}
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const xScale = scaleTime()
			.domain(extent(flatLineData, d => d[dateKey]))
			.rangeRound([0, chartWidth])

		const discXScale = discontinuitySkipWeekends(xScale)
		// const xBandScale = scaleBand()
		// 	.domain(data.map(d=>d[dateKey]))
		// 	.range([0, chartWidth])
		// 	.padding(0.3)
		const yScale = scaleLinear()
			.domain(extent(flatLineData, d => d[yAxisKey]))
			.range([chartHeight, 0])
			.nice()

		console.log((extent(flatLineData, d => d[dateKey])[1] - extent(flatLineData, d => d[dateKey])[0])/(1000*60*60*24))

		const barPadding = chartWidth / data.length * 0.1
		const barWidth = chartWidth / data.length * 0.9

		console.log(barPadding, barWidth)
		const hoverOptions = {
			yAxisKey,
			dateRange,
			flatLineData,
			xScale,
			yScale
		}

		return(
			<g className="NNBarChart" transform={`translate(${this.props.translate[0]},${this.props.translate[1]})`}> 
				<g>
					<Axis 
						orient={'Bottom'}
						scale={xScale}
						format={dateFormat}
						ticks={3}
						tickSize={5}
						translate={`translate(${margin.left}, ${chartHeight + margin.top})`}/>
					<Axis 
						orient={'Left'}
						scale={yScale}
						format={yAxisFormat}
						ticks={5}
						tickSize={chartWidth}
						translate={`translate(${componentWidth - margin.right}, ${margin.top})`}/>
				</g>
				{data.map((d,i)=> {
					// const barWidth = 25
					// const barPadding = 1
					const barHeight = yScale(d[yAxisKey])
					return <rect
						className={d[dateKey]}
						key={i}
						width={barWidth}
						height={barHeight}
						transform={`translate(${margin.left + i * (barWidth + barPadding)},${margin.top + chartHeight - barHeight})`}
						// transform={
						// 	`translate(
						// 		${margin.left + xScale.padding() + (barWidth * i) + (xBandScale.padding())}, 
						// 		${margin.top + chartHeight - barHeight })
						// 	`}
					>	
					</rect>}
					)}
				<rect
					width={chartWidth}
					height={chartHeight}
					onMouseMove={this._onHover.bind(this, hoverOptions)}
					style={{fill: 'blue', opacity: 0, pointerEvents: 'fill', transform: `translate(${margin.left}px, ${margin.top}px)`}}
					>
				</rect>
			</g>
		)
	}
}

NNBarChart.propTypes = {
	data: PropTypes.array.isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	dateKey: PropTypes.string.isRequired,
	dateFormat: PropTypes.string,
	yAxisKey: PropTypes.string.isRequired,
	yAxisFormat: PropTypes.string,
	marginArray: PropTypes.array,
	translate: PropTypes.array,
	onHover: PropTypes.func,
}

NNBarChart.defaultProps = {
	dateFormat: "%B %d, %Y",
	yAxisFormat: "~s",
	marginArray: [10, 10, 30, 30],
	translate: [0,0],
	onHover: (d) => {console.log('hover data:', d)},
}

// module.exports = NNBarChart