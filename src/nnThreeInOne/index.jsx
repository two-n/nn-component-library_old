import React from "react"
import { PropTypes } from "prop-types"
import { scaleLinear } from "d3-scale"
import { extent } from "d3-array"
import { interpolateRdYlGn } from "d3-scale-chromatic"
import { hierarchy, treemap } from "d3-hierarchy"
import { TransitionGroup, CSSTransition } from "react-transition-group"

import "./style.css"

const Constants = {
  DATE: "Date",
  OPEN: "Open",
  HIGH: "High",
  LOW: "Low",
  CLOSE: "Close",
  ADJCLOSE: "Adjusted_close",
  VOLUME: "Volume"
}
const { DATE, OPEN, HIGH, LOW, CLOSE, ADJCLOSE, VOLUME } = Constants

export class NNThreeInOne extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const { data, componentHeight, componentWidth, view, sizeKey, colorKey, sortKey, label, onHover, onClick } = this.props
		const sortedData = data
			.map(d => Object.assign({}, d,
				{ [OPEN]: +d[OPEN],
					[HIGH]: +d[HIGH],
					[LOW]: +d[LOW],
					[CLOSE]: +d[CLOSE],
					[ADJCLOSE]: +d[ADJCLOSE],
					[VOLUME]: +d[VOLUME]
				}))
			.sort((a, b) => +a[sortKey] - +b[sortKey])

		// console.log('sorted data:', sortedData)

		const yScale = scaleLinear()
			.domain(extent(sortedData.map(d => +d[sizeKey])))
			.range([0, componentHeight])

		const colorScale = scaleLinear()
			.domain(extent(sortedData.map(d => +d[colorKey])))
			.range([0, 1])
		
		const calcHeatmapPosition = (i) => {
			const rows = 3
			const columns = 7
			const margin = 2

			const height = componentHeight / columns
			const width = componentWidth / rows
			const top = 30 + Math.floor(i / (sortedData.length / columns)) * (height + margin)
			const left = 150 + i % (sortedData.length / columns) * (width + margin)

			return { height, width, top, left }
		}

		const calcBarPosition = (d, i) => {
			const margin = 2

			const height = yScale(d[sizeKey])
			const width = componentWidth / sortedData.length
			const top = 30 + componentHeight - height
			const left = 150 + i * (width + margin)

			return { height, width, top, left }
		}

		const createTree = () => {

			const treemapFn = treemap()
		    .size([componentWidth, componentHeight])
		    .padding(1)
		    .round(true);

		  const hierarchyData = Object.assign({}, {
		  	"name" : "root",
		  	"children" : sortedData 
		  })

		  const root = hierarchy(hierarchyData)
		  	.sum(d => d[sizeKey])
		  	.sort((a, b) => b.height - a.height || b[sizeKey] - a[sizeKey])

		  const nodes = treemapFn(root).leaves()
		  console.log('nodes:',nodes)

		  // return tree
		}

		const calcTreemapPosition = (d, i) => {

			console.log('ran calcTreemapPosition')

			// return { height, width, top, left }
		}

		const calcColorValue = (colorData) => {
			return interpolateRdYlGn(colorScale(colorData))
		}

		return (
			<div className="nnThreeInOneComponent">
				{view === 'treemap' ? createTree() : null}
				<TransitionGroup component="div" className="transition-group">
					{sortedData.map((d,i) => {
						let position 
						const colorValue = calcColorValue(d[colorKey])
						if (view === 'heatmap') {position = calcHeatmapPosition(i)}
						else if (view === 'bar') {position = calcBarPosition(d, i)}
						else if (view === 'treemap') {position = calcTreemapPosition(d, i)}
						return (
							<CSSTransition
								key={d.Date+i}
								timeout={500}
								classNames={{
									enter: "fadeEnter",
									enterActive: "fadeEnterActive",
                  exit: "fadeExit",
                  exitActive: "fadeExitActive"
								}}
							>
								<div 
									className={`${view}_card`} id={`${i}`} key={`${d.Date}_${i}`}
									style={{...position, backgroundColor: colorValue }}>
									{view !== 'bar' ? 
										<div>
											<div className={`${view}_label`}>
												{`${d.Date}`}
											</div>
											<div className={`${view}_subLabel`}>
												{`${d.Volume}`}
											</div>
										</div>
									: null }
								</div>
							</CSSTransition>
						)}
					)}
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
	onHover: PropTypes.func,
	onClick: PropTypes.func
}