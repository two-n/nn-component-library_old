import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleTime } from "d3-scale"
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

// export class NNLineChart extends React.Component {
class NNLineChart extends React.Component {

	_onHover(hoverOptions, event) {
		const { dateKey, onHover } = this.props
		const { dataSelectionKey, flatLineData, dateSet, xScale, yScale } = hoverOptions

		const { top, left } = event.target.getBoundingClientRect()
		const xPosValue = new Date(dateSet[Math.floor(xScale.invert(event.clientX - left))])
		const yPosValue = yScale.invert(event.clientY - top)

		const closestData = flatLineData
			.filter(d => d[dateKey].getTime() === xPosValue.getTime())
			.reduce((t,v) =>  Math.abs(yPosValue - v[dataSelectionKey]) < Math.abs(yPosValue - t[dataSelectionKey]) ? v : t, { [dataSelectionKey] : Infinity })

		const mouseData = {
			data: closestData,
			x: xScale(xPosValue),
			y: yScale(closestData[dataSelectionKey])
		}
		onHover(mouseData)
	}

	render() {
		const { data, componentHeight, componentWidth, dataKey, colorScale, colorScaleKey,
			dateKey, dateFormat, yAxisKey, yAxisFormat, onHover, percentChange } = this.props

		let transformedData
		if (percentChange) {
			transformedData = data.map(d => d.map(e => Object.assign({}, e, {
					"_percentChange": (e[yAxisKey] - d[0][yAxisKey]) / d[0][yAxisKey]
				})
			))
		}

		const dataSelection = percentChange
			? data.map(d => d.map(e => Object.assign({}, e, { "_percentChange": (e[yAxisKey] - d[0][yAxisKey]) / d[0][yAxisKey] }) ))
			: data
		const dataSelectionKey = percentChange ? "_percentChange" : yAxisKey

		// this is used to determine the entire extent of dates included in the data passed in -- in case one line 
		// has more date values than the other
		const flatLineData = [].concat(...(dataSelection))
		// this then returns all dates in a set to remove duplicates and find unique dates
		const dateFormatFunc = timeFormat(dateFormat)
		const dateSet = [...new Set(flatLineData.map(d => d[dateKey].toString()))]
		const formattedDateSet = dateSet.map(e => dateFormatFunc(new Date(e)))

		const margin = { top: 10, bottom: 30, left: 30, right: 10 }
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const xScale = scaleLinear()
			.domain([0, dateSet.length])
			.rangeRound([0, chartWidth])
		const yScale = scaleLinear()
			.domain(extent(flatLineData, d => d[dataSelectionKey]))
			.range([chartHeight, 0])
			.nice()

		const path = line()
			.x((d,i) => xScale(i) + margin.left)
			.y(d => yScale(d[dataSelectionKey]) + margin.top)
			.curve(curveMonotoneX)

		const hoverOptions = {
			dataSelectionKey,
			flatLineData,
			dateSet,
			xScale,
			yScale
		}

		return(
			<g className="NNLineChart"> 
				<g>
					<Axis 
						orient={'Bottom'}
						scale={xScale}
						format={d => formattedDateSet[d]}
						ticks={3}
						tickSize={chartHeight + 5}
						translate={`translate(${margin.left}, ${margin.top})`}/>
					<Axis 
						orient={'Left'}
						scale={yScale}
						format={format(yAxisFormat)}
						ticks={5}
						tickSize={chartWidth}
						translate={`translate(${componentWidth - margin.right}, ${margin.top})`}/>
				</g>
				{dataSelection.map(d =>
					<path
						key={d[0][colorScaleKey]}
						stroke={colorScale(d[0][colorScaleKey])}
						d={path(d)}
					/>
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

NNLineChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.array).isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	colorScale: PropTypes.func.isRequired,
	colorScaleKey: PropTypes.string.isRequired,
	dateKey: PropTypes.string.isRequired,
	dateFormat: PropTypes.string,
	yAxisKey: PropTypes.string.isRequired,
	yAxisFormat: PropTypes.string,
	onHover: PropTypes.func,
	percentChange: PropTypes.bool,
	marginArray: PropTypes.array,
}

NNLineChart.defaultProps = {
	dateFormat: "%B %d, %Y",
	yAxisFormat: ".0%",
	onHover: (d) => {console.log('hover data:', d)},
	percentChange: true,
	marginArray: [10, 10, 30, 30],
}
module.exports = NNLineChart