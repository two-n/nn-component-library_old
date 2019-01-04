import React from "react"
import { render } from "react-dom"
import { NNThreeInOne } from "./nnThreeInOne/index.jsx"
import { NNThreeInOneParent } from "./nnThreeInOneParent/index.jsx"

// import data from "./nnThreeInOne/data.js"

render(
  <NNThreeInOneParent/>,
  document.getElementById("app")
)