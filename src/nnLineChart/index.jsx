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

	render() {
		const { data, componentHeight, componentWidth, colorScale, colorScaleKey, 
			xAxisKey, xAxisFormat, xAxisTicks, yAxisKey, yAxisFormat, yAxisTicks, dataKey, onHover } = this.props

		const margin = {
			top: 10,
			bottom: 50, 
			left: 50, 
			right: 10
		}
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const xScale = scaleTime()
			.domain(extent([].concat(...data.map(d => d[dataKey])).map(d => d[xAxisKey])))
			.range([0, chartWidth])
		const yScale = scaleLinear()
			.domain(extent([].concat(...data.map(d => d[dataKey])).map(d => +d[yAxisKey])))
			.range([chartHeight, 0])

		return(
			<svg
				width={componentWidth}
				height={componentHeight}
			> 
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
						ticks={7}
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
			</svg>
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
	xAxisTicks: PropTypes.string,
	yAxisKey: PropTypes.string.isRequired,
	yAxisFormat: PropTypes.string,
	yAxisTicks: PropTypes.string,
	dataKey: PropTypes.string.isRequired,
	onHover: PropTypes.func
}