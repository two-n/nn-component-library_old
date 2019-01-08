import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleSequential } from "d3-scale"
import { extent } from "d3-array"
import { interpolateRdYlGn } from "d3-scale-chromatic"
import { hierarchy, treemap } from "d3-hierarchy"
import { TransitionGroup, CSSTransition } from "react-transition-group"

import "./style.css";

const calcHeatmapPosition = (data, options) => {
	const { componentHeight, componentWidth, margin } = options
	const columns = Math.max(Math.ceil(componentWidth / 250), Math.floor(componentWidth / 350))
	const rows = Math.ceil(data.length / columns)
	const height = (componentHeight / rows) - margin;
	const width = (componentWidth / columns) - margin

	return data.map((d, i) => {
		const top = (Math.floor(i / columns)) * (height + margin)
		const left = (i % columns) * (width + margin)

		return { ...d, position: { height, width, top, left } }
	})
}

const calcBarPosition = (data, options) => {
	const { sizeKey, componentHeight, componentWidth, margin } = options
	const width = (componentWidth / data.length) - margin
	const yScale = scaleLinear()
			.domain(extent(data.map(d => +d[sizeKey])))
			.range([0, componentHeight])

	return data.map((d, i) => {
		const height = yScale(d[sizeKey])
		const top = componentHeight - height
		const left = i * (width + margin)

		return { ...d, position: { height, width, top, left } }
	})
}

const calcTreemapPosition = (data, options) => {
	const { componentWidth, componentHeight, sizeKey, margin } = options

  return treemap()
    .size([componentWidth, componentHeight])
    .padding(margin)
    .round(true)
    (
    	hierarchy({
		  	"children": data 
		  })
		  	.sum(d => d[sizeKey])
		  	.sort((a, b) => b.height - a.height || b[sizeKey] - a[sizeKey])
  	)
		.leaves()
  	.map(d => ({
  		...d.data,
  		position: {
  			top: d.y0,
  			left: d.x0,
  			height: d.y1 - d.y0,
  			width: d.x1 - d.x0
  		}
  	}))
}

export class NNThreeInOne extends React.Component {

	render() {
		const { data, componentHeight, componentWidth, view, sizeKey, colorKey, sortKey, label, primary, secondary, onHover, onClick } = this.props
		const sortedData = data
			.sort((a, b) => +a[sortKey] - +b[sortKey])

		const colorScale = scaleSequential(interpolateRdYlGn)
			.domain(extent(sortedData.map(d => +d[colorKey])))

		const margin = this.props.margin || 2
		const options = {
			componentHeight, 
			componentWidth, 
			margin,
			sizeKey
		}

		let positionedData = []
		if (view === 'heatmap') {
			positionedData = calcHeatmapPosition(sortedData, options)
		} else if (view === 'treemap') {
			positionedData = calcTreemapPosition(sortedData, options)
		} else {
			positionedData = calcBarPosition(sortedData, options)
		}

		return (
			<div className="nnThreeInOneComponent" style={{ height: componentHeight, width: componentWidth }}>
				<TransitionGroup component="div" className="transition-group">
					{positionedData.map((d,i) =>
						<CSSTransition
							in={true}
							key={d[primary]}
							timeout={500}
							classNames="fade"
						>
							<div 
								className='card'
								style={{ ...d.position, backgroundColor: colorScale(d[colorKey]) }}
								onClick={() => onClick(d[primary])}
								onMouseEnter={() => onHover(d[primary])}
								onMouseLeave={() => onHover(null)}
							>
								{label ?
									<div>
										<div className='label'>
											{`${d[primary]}`}
										</div>
										<div className='subLabel'>
											{`${d[secondary]}`}
										</div>
									</div>
								: null }
							</div>
						</CSSTransition>)}
					</TransitionGroup>
			</div>
		)
	}
}

NNThreeInOne.propTypes = {
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	view: PropTypes.oneOf(['treemap', 'heatmap', 'bar']).isRequired,
	sizeKey: PropTypes.string.isRequired,
	colorKey: PropTypes.string.isRequired,
	sortKey: PropTypes.string,
	label: PropTypes.bool,
	primary: PropTypes.string.isRequired,
	secondary: PropTypes.string,
	onHover: PropTypes.func,
	onClick: PropTypes.func
}