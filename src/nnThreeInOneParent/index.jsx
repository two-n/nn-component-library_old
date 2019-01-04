import React from "react"
import { NNThreeInOne } from "../nnThreeInOne/index.jsx"
import data from "../nnThreeInOne/data.js"

export class NNThreeInOneParent extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			view: "heatmap"
		}
		this.toggle = this.toggle.bind(this)
	}

	toggle() {
		this.state.view === "heatmap" 
			? this.setState({ view: "bar" })
			: this.setState({ view: "heatmap" })
	}

	render() {
		return(
			<div className="nnThreeInOneParent">	
				<NNThreeInOne
					data={data} 
					componentHeight={600}
					componentWidth={900}
					// view={this.state.view}
					view={'treemap'}
					sizeKey={'High'}
					colorKey={'Volume'}
					sortKey={'Volume'}
					label={true}
					onHover={() => {}}
					onClick={() => {}}
					style={{
						position: "absolute",
						top: "10px",
						left: "10px"
					}}
		  	/>
				<button className="button" onClick={this.toggle}>
					toggle heatmap/bar
				</button>
			</div>
		)
	}
}