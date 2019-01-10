import React from "react"
import { scaleOrdinal } from "d3-scale"
import { timeParse } from "d3-time-format"
import { NNLineChart } from "../nnLineChart/index.jsx"
import data from "../nnTicker/data.js"

const colorScale = scaleOrdinal()
	.domain(["AAPL", "MSFT"])
	.range(["pink", "blue"])

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
			.map(d => Object.assign({}, d,
				{ 
					[PERFORMANCE]: d[PERFORMANCE]
						.map(e => Object.assign({}, e,
							{ [DATE]: new Date (e[DATE]),
								[OPEN]: +e[OPEN],
								[HIGH]: +e[HIGH],
								[LOW]: +e[LOW],
								[CLOSE]: +e[CLOSE],
								[ADJCLOSE]: +e[ADJCLOSE],
								[VOLUME]: +e[VOLUME]
							}))
				}))

		return(
			<div className="NNLineChartParent"> 
				<NNLineChart 
					data={cleanData}
					componentHeight={600}
					componentWidth={900}
					colorScale={colorScale}
					colorScaleKey={"Ticker"}
					xAxisKey={"Date"}
					xAxisFormat={"%B %d, %Y"}
					xAxisTicks={5}
					yAxisKey={"Adjusted_close"}
					yAxisFormat={".0%"}
					yAxisTicks={5}
					dataKey={"Performance"}
					onHover={() => {}}
				/>
			</div>
		)
	}
}