import React from "react"
import { render } from "react-dom"
import { NNTicker } from "./nnTicker/index.jsx"
import { NNThreeInOneParent } from "./nnThreeInOneParent/index.jsx"

render(
  <NNThreeInOneParent/>,
  document.getElementById("app")
)