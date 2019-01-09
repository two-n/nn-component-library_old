import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleTime } from "d3-scale"
import { extent } from "d3-array"
import { select } from "d3-selection"
import { axisBottom, axisLeft } from "d3-axis"
// import { timeFormat } from "d3-time-format"
import { line, curveMonotoneX } from "d3-shape"

import "./style.css";

export class NNPerformanceLineChart extends React.Component {

	// componentDidMount() {
	// 	this.drawXAxis()
	// 	this.drawYAxis()
	// }

	// componentDidUpdate() {
	// 	this.drawXAxis()
	// 	this.drawYAxis()
	// }

	// drawXAxis() {
	// 	select(this.refs.xAxis).call(axisBottom(xScale).ticks([10]))
	// }

	// drawYAxis() {
	// 	select(this.refs.yAxis).call(axisLeft(yScale).ticks([10]))
	// }

	render() {
		const { data, componentHeight, componentWidth, colorScale, colorScaleKey, xAxisKey, yAxisKey, dataKey, onHover } = this.props

		const xScale = scaleTime()
			.domain(extent([].concat(...data.map(d => d[dataKey])).map(d => d[xAxisKey])))
			.range([0, componentWidth])
		const yScale = scaleLinear()
			.domain(extent([].concat(...data.map(d => d[dataKey])).map(d => +d[yAxisKey])))
			.range([0, componentHeight])

		// const callXAxis = select('.xAxis').call(axisBottom(xScale).ticks(10))
		// const callYAxis = select('.yAxis').call(axisBottom(yScale).ticks(10))

		return(
			<svg
				width={componentWidth}
				height={componentHeight}
			> 
				<g ref={'xAxis'} className={'xAxis'}> </g>
				<g ref={'yAxis'} className={'yAxis'}> </g>
				{data.map((d,i) => 
					<path
						key={d[colorScaleKey]}
						stroke={colorScale(d[colorScaleKey])}
						strokeWidth='2'
						fill='none'
						d={
							line()
								.x((d, i) => xScale(d[xAxisKey]))
								.y((d) => yScale(d[yAxisKey]))
								.curve(curveMonotoneX)(d[dataKey])
						}
					/>
				)} 
			</svg>
		)
	}
}

NNPerformanceLineChart.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	colorScale: PropTypes.func.isRequired,
	colorScaleKey: PropTypes.string.isRequired,
	dateFormat: PropTypes.string,
	xAxisKey: PropTypes.string.isRequired,
	yAxisKey: PropTypes.string.isRequired,
	dataKey: PropTypes.string.isRequired,
	onHover: PropTypes.func
}