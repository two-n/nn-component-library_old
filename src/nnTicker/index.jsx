import React from "react"
import { scaleOrdinal } from "d3-scale"
import { sort } from "d3-array"
import { timeParse } from "d3-time-format"
import { NNLineChart } from "../nnLineChart/index.jsx"
import data from "../nnTicker/data.js"

const colorScale = scaleOrdinal()
	.domain(["AAPL", "MSFT"])
	.range(["red", "blue"])

const svgWidth = 900,
	svgHeight = 600

const Constants = {
	TICKER: "Ticker",
	DESCRIPTION: "Description",
	PERFORMANCE: "Performance",
  DATE: "Date",
  OPEN: "Open",
  HIGH: "High",
  LOW: "Low",
  CLOSE: "Close",
  ADJCLOSE: "Adjusted_close",
  VOLUME: "Volume"
}
const { TICKER, DESCRIPTION, PERFORMANCE, DATE, OPEN, HIGH, LOW, CLOSE, ADJCLOSE, VOLUME } = Constants

export class NNTicker extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {

		let cleanData = data
			.map(d => d[PERFORMANCE]
				.map(e => Object.assign({}, e,
					{ [TICKER]: d[TICKER],
						[DESCRIPTION]: d[DESCRIPTION],
						[DATE]: new Date (e[DATE]),
						[OPEN]: +e[OPEN],
						[HIGH]: +e[HIGH],
						[LOW]: +e[LOW],
						[CLOSE]: +e[CLOSE],
						[ADJCLOSE]: +e[ADJCLOSE],
						[VOLUME]: +e[VOLUME]
					}))
				)
			.sort((a,b) => a[DATE] - b[DATE])

		return(
			<svg
				className="NNLineChartParent"
				width={svgWidth}
				height={svgHeight}
				>
				<NNLineChart 
					data={cleanData}
					componentHeight={svgHeight/2}
					componentWidth={svgWidth}
					colorScale={colorScale}
					colorScaleKey={"Ticker"}
					dateKey={"Date"}
					dateFormat={"%B %d, %Y"}
					yAxisKey={"Adjusted_close"}
					yAxisFormat={".0%"}
					onHover={(d) => {console.log('hover data:', d)}}
					percentChange={true}
				/>
			</svg>
		)
	}
}