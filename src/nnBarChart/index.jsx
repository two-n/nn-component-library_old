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
		const { yAxisKey, dateArray, flatLineData, xScale, yScale } = hoverOptions

		const { top, left } = event.target.getBoundingClientRect()
		const xPosValue = xScale.invert(event.clientX - left)
		const yPosValue = yScale.invert(event.clientY - top)
		const date = dateArray[bisect(dateArray, xPosValue) - 1]

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

		// this is used to determine the entire extent of dates included in the data passed in -- in case one line 
		// has more date values than the other
		const flatLineData = [].concat(...(data))
		// this then returns all dates to leverage for the bisect function of hover activity
		const dateArray = flatLineData.map(d => d[dateKey])
		// to make a continuous date range for the band scale, we need to know the extent of it
		const dateRange = extent(dateArray)

		// this function and "getDates" allows us to make a date range that includes weekends (since our data set does not)
		Date.prototype.addDays = function(days) {
	    var date = new Date(this.valueOf());
	    date.setDate(date.getDate() + days);
	    return date;
	  }
		const getDates = ([startDate, stopDate]) => {
			let contDateArray = new Array
	    let currentDate = startDate;
	    while (currentDate <= stopDate) {
        contDateArray.push(new Date (currentDate));
        currentDate = currentDate.addDays(1);
	    }
	    return contDateArray;
		}
	  const contDateArray = getDates(dateRange)


		const margin = { top: marginArray[0], right: marginArray[1], bottom: marginArray[2], left: marginArray[3] }
		const chartWidth = componentWidth - margin.left - margin.right
		const chartHeight = componentHeight - margin.top - margin.bottom

		const xScale = scaleTime()
			.domain(extent(flatLineData, d => d[dateKey]))
			.rangeRound([0, chartWidth])

		// the band scale is used to place the bars on the appropriate dates given the continuous time scale
		const xBandScale = scaleBand()
			.domain(contDateArray)
			.range([0, chartWidth])
			.padding(0.3)

		const yScale = scaleLinear()
			.domain(extent(flatLineData, d => d[yAxisKey]))
			.range([chartHeight, 0])
			.nice()

		const hoverOptions = {
			yAxisKey,
			dateArray,
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
					return <rect
						className={'bar'}
						key={i}
						width={xBandScale.bandwidth()}
						height={yScale(d[yAxisKey])}
						transform={
							`translate(
								${margin.left + xBandScale(d[dateKey])},
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

// module.exports = NNBarChart