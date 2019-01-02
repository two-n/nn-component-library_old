import React from "react"
import { render } from "react-dom"
import { NNThreeInOne } from "./nnThreeInOne/index.jsx"

import data from "./nnThreeInOne/data.js"

render(
  <NNThreeInOne
		data={data} 
		componentHeight={600}
		componentWidth={900}
		view={'heatmap'}
		sizeKey={'High'}
		colorKey={'Volume'}
		label={true}
		onHover={() => {}}
		onClick={() => {}}
  />,
  document.getElementById("app")
)