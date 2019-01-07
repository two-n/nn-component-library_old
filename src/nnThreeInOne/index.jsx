import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear, scaleSequential } from "d3-scale"
import { extent } from "d3-array"
import { interpolateRdYlGn } from "d3-scale-chromatic"
import { hierarchy, treemap } from "d3-hierarchy"
import { TransitionGroup, CSSTransition } from "react-transition-group"

import "./style.css";

const calcHeatmapPosition = (data, options) => {
	const {height, width, margin, columns} = options

	return data.map((d, i) => {
		const top = Math.floor(i / (data.length / columns)) * (height + margin)
		const left = i % (data.length / columns) * (width + margin)
		return { ...d, position: { height, width, top, left } }
	})
}

const calcBarPosition = (data, options) => {
	const {yScale, sizeKey, width, componentHeight, margin} = options

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
		const { data, componentHeight, componentWidth, view, sizeKey, colorKey, sortKey, label, onHover, onClick } = this.props
		const sortedData = data
			.sort((a, b) => +a[sortKey] - +b[sortKey])
			// .slice(0, Math.floor(20*Math.random()))

		const yScale = scaleLinear()
			.domain(extent(sortedData.map(d => +d[sizeKey])))
			.range([0, componentHeight])

		const colorScale = scaleSequential(interpolateRdYlGn)
			.domain(extent(sortedData.map(d => +d[colorKey])))

		const rows = this.props.rows || 3 // TODO implement wrapping when width gets too small
		const columns = this.props.columns || 7
		const margin = this.props.margin || 2
		const height = (componentHeight / columns) - margin;
		const width = (view === 'bar'
			? componentWidth / sortedData.length // bar
			: componentWidth / rows) // heatmap
			- margin;
		const options = {
			yScale, 
			componentHeight, 
			componentWidth, 
			height, 
			width,
			rows,
			columns,
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
							key={d.Date}
							timeout={500}
							classNames="fade"
						>
							<div 
								className='card'
								style={{ ...d.position, backgroundColor: colorScale(d[colorKey]) }}
								// TODO add events to trigger onHover and onClick callbacks
							>
								{label ?
									<div>
										<div className='label'>
											{`${d.Date}`}
										</div>
										<div className='subLabel'>
											{`${d.Volume}`}
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
	// TODO add props for 'primary' and 'secondary' which correspond to label and sublabel. primary should also be used as key in CSSTransition
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	componentHeight: PropTypes.number.isRequired,
	componentWidth: PropTypes.number.isRequired,
	view: PropTypes.oneOf(['treemap', 'heatmap', 'bar']).isRequired,
	sizeKey: PropTypes.string.isRequired,
	colorKey: PropTypes.string.isRequired,
	sortKey: PropTypes.string,
	label: PropTypes.bool,
	onHover: PropTypes.func,
	onClick: PropTypes.func
}