import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear } from "d3-scale"
import { extent } from "d3-array"
import { interpolateRdYlGn } from "d3-scale-chromatic"
import { TransitionGroup } from "react-addons-transition-group"

import "./style.css"

export class NNThreeInOne extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const { data, componentHeight, componentWidth, view, sizeKey, colorKey, label, onHover, onClick } = this.props

		const yScale = scaleLinear()
			.domain(extent(data.map(d => +d[sizeKey])))
			.range([0, componentHeight])

		const colorScale = scaleLinear()
			.domain(extent(data.map(d => +d[colorKey])))
			.range([0, 1])
		
		const calcHeatmapPosition = (i) => {
			const rows = 3
			const columns = 7
			const margin = 2

			const height = componentHeight / columns
			const width = componentWidth / rows
			const top = i % (data.length / rows) * (height + margin)
			const left = i % (data.length / columns) * (width + margin)

			return { height, width, top, left }
		}

		const calcBarPosition = (bar, i) => {
			const margin = 2

			const height = yScale(bar[sizeKey])
			const width = componentWidth / data.length
			const top = componentHeight - height
			const left = i * (width + margin)

			return { height, width, top, left }
		}

		const calcColorValue = (colorData) => {
			return interpolateRdYlGn(colorScale(colorData))
		}

		return (
			<div className="nnThreeInOneComponent">
				{data.map((d,i) => {
					let position 
					let sizeValue
					const colorValue = calcColorValue(d[colorKey])
					if (view === 'heatmap') {position = calcHeatmapPosition(i)}
					else if (view === 'bar') {position = calcBarPosition(d, bar)}
					// else if (view === 'treemap') {position = this.calcTreemapPosition(this.props, i)}
					return <div className={`${view}_card`} key={`${d.Date}_${i}`}
						style={{...position, backgroundColor: colorValue }}
					>
						{view !== 'bar' ? 
							<div>
								<div className={`${view}_label`}>
									{`${d.Date}`}
								</div>
								<div className={`${view}_subLabel`}>
									{`${d.Close}`}
								</div>
							</div>
						: null }
					</div>
					}
				)}
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
	label: PropTypes.bool,
	onHover: PropTypes.func,
	onClick: PropTypes.func
}