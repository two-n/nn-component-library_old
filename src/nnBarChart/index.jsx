import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleTime, scaleBand, scalePoint } from "d3-scale"
import { extent, bisect } from "d3-array"
import { timeFormat } from "d3-time-format"
import { format } from "d3-format"
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
			.ticks(this.props.ticks)
			.tickSize(this.props.tickSize)
			.tickFormat(this.props.format)

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

// export class NNBarChart extends React.Component {
class NNBarChart extends React.Component {

	_onHover(hoverOptions, event) {
		const { dateKey, onHover } = this.props
		const { yAxisKey, flatLineData, xScale, yScale } = hoverOptions

		const { top, left } = event.target.getBoundingClientRect()
		const xPosIndex = Math.floor(xScale.invert(event.clientX - left))
		const yPosValue = yScale.invert(event.clientY - top)

		const closestData = flatLineData
			.filter((d,i) => i === xPosIndex)
			.reduce((t,v) =>  Math.abs(yPosValue - v[yAxisKey]) < Math.abs(yPosValue - t[yAxisKey]) ? v : t, { [yAxisKey] : Infinity })

		const mouseData = {
			data: closestData,
			x: xScale(xPosIndex),
			y: yScale(closestData[yAxisKey])
		}
		onHover(mouseData)
	}

	render() {
		const { data, componentHeight, componentWidth, dataKey, dateKey, dateFormat,
			yAxisKey, yAxisFormat, marginArray, translate, onHover } = this.props

		// this is used to determine the entire extent of dates included in the data passed in -- in case one line 
		// has more date values than the other
		const flatLineData = [].concat(...(data))
		// this then returns all dates in a set to remove duplicates and find unique dates
		const dateFormatFunc = timeFormat(dateFormat)
		const dateSet = [...new Set(flatLineData.map(d => dateFormatFunc(d[dateKey]).toString()))]

		const margin = { top: marginArray[0], right: marginArray[1], bottom: marginArray[2], left: marginArray[3] }
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const xScale = scaleLinear()
			.domain([0, dateSet.length])
			.rangeRound([0, chartWidth])

		const yScale = scaleLinear()
			.domain(extent(flatLineData, d => d[yAxisKey]))
			.range([chartHeight, 0])
			.nice()

		const hoverOptions = {
			yAxisKey,
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
						format={d => dateSet[d]}
						ticks={3}
						tickSize={5}
						translate={`translate(${margin.left}, ${chartHeight + margin.top})`}/>
					<Axis 
						orient={'Left'}
						scale={yScale}
						format={format(yAxisFormat)}
						ticks={5}
						tickSize={chartWidth}
						translate={`translate(${componentWidth - margin.right}, ${margin.top})`}/>
				</g>
				{data.map((d,i)=> {
					return <rect
						className={'bar'}
						key={i}
						width={(chartWidth / data.length)*0.5}
						height={yScale(d[yAxisKey])}
						transform={
							`translate(
								${margin.left + xScale(i)},
								${margin.top + chartHeight - yScale(d[yAxisKey]) })
							`}
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

module.exports = NNBarChart