import React from "react"
import { render } from "react-dom"
import { NNSlider } from "./nnSlider/index.jsx"

let v = 0.7

render(
  <NNSlider
  	value={v}
		onDrag={e => v = e}
		domain={[0,1]}
		step={1} 
  />,
  document.getElementById("app")
)