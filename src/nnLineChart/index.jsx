import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleTime } from "d3-scale"
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

export class NNLineChart extends React.Component {

	_onHover(hoverOptions, event) {
		const { dateKey, onHover } = this.props
		const { dataSelectionKey, dateRange, flatLineData, xScale, yScale } = hoverOptions

		const { top, left } = event.target.getBoundingClientRect()
		const xPosValue = xScale.invert(event.clientX - left)
		const yPosValue = yScale.invert(event.clientY - top)
		const date = dateRange[bisect(dateRange, xPosValue) - 1]

		const closestData = flatLineData
			.filter(d => d[dateKey].getTime() === date.getTime())
			.reduce((t,v) => {
				return Math.abs(yPosValue - v[dataSelectionKey]) < Math.abs(yPosValue - t[dataSelectionKey])
					? v : t
			}, { [dataSelectionKey] : Infinity })

		const mouseData = {
			data: closestData,
			x: xScale(date),
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

		const dataSelection = percentChange ? transformedData : data
		const dataSelectionKey = percentChange ? "_percentChange" : yAxisKey
		const flatLineData = [].concat(...(dataSelection))
		const dateRange = flatLineData.map(d => d[dateKey])

		const margin = { top: 10, bottom: 30, left: 30, right: 10 }
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const xScale = scaleTime()
			.domain(extent(flatLineData, d => d[dateKey]))
			.range([0, chartWidth])
		const yScale = scaleLinear()
			.domain(extent(flatLineData, d => d[dataSelectionKey]))
			.range([chartHeight, 0])
			.nice()

		const hoverOptions = {
			dataSelectionKey,
			dateRange,
			flatLineData,
			xScale,
			yScale
		}

		return(
			<g> 
				<g>
					<Axis 
						orient={'Bottom'}
						scale={xScale}
						format={dateFormat}
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
				{(dataSelection).map((d,i) =>
					<path
						// is there a more elegant way to determine this (ticker), now that the data is flat? This assumes
						// that the data in each array will all have the same ticker in the data point after the first
						key={d[0][colorScaleKey]}
						stroke={colorScale(d[0][colorScaleKey])}
						strokeWidth='1'
						fill='none'
						d={
							line()
								.x((d, i) => xScale(d[dateKey]) + margin.left)
								.y((d) => yScale(d[dataSelectionKey]) + margin.top)
								.curve(curveMonotoneX)(d)
						}
					/>
				)}
				<rect
					width={chartWidth}
					height={chartHeight}
					onMouseMove={this._onHover.bind(this, hoverOptions)}
					style={{fill: 'blue', opacity: 0, pointerEvents: 'all', transform: `translate(${margin.left}px, ${margin.top}px)`}}
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
}