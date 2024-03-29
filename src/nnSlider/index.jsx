import {Component} from "react"
import {PropTypes} from "prop-types"
import {select, event} from "d3-selection"
import {drag} from "d3-drag"
import {scaleLinear} from "d3-scale"

import "./style.css"

class NNSlider extends Component {
	constructor(props) {
		super(props)
		this.state = {
			dragging: false,
			scale: scaleLinear()
				.domain(this.props.domain)
				.range([0, 100])
		}
		this.dragStart = this.dragStart.bind(this)
		this.dragGo = this.dragGo.bind(this)
		this.dragEnd = this.dragEnd.bind(this)
	}

	componentDidMount() {
		select(this.refs.NNSliderThumb).call(
			drag()
				.on("start", () => {
					this.dragStart()
				})
				.on("drag", () => {
					this.dragGo(event)
				})
				.on("end", () => {
					this.dragEnd()
				})
		)
	}

	componentDidUpdate(prevProps) {
		if (this.props.domain[0] !== prevProps.domain[0] || this.props.domain[1] !== prevProps.domain[1]) {
			this.setState({
				scale: this.state.scale.domain(this.props.domain)
			})
		}
	}

	dragStart() {
		this.setState({ dragging: true })
	}

	dragGo(e) {
		if (!this.state.dragging) return
		const {width} = this.refs.NNSliderComponent.getBoundingClientRect()
		const next = Math.min(
			this.props.domain[1],
			Math.max(this.props.domain[0], this.state.scale.invert((100 * e.x) / width))
		)
		this.props.onDrag(this.props.step * Math.round(next / this.props.step))
	}

	dragEnd() {
		this.setState({ dragging: false })
	}

	render() {
		const {value} = this.props
		const {scale} = this.state
		return (
			<div className="NNSliderComponent" ref="NNSliderComponent">
				<div className="NNSliderTrack">
					<div
						className="NNSliderProgress"
						style={{
							width: scale(value) + "%"
						}}
					/>
					<div
						className="NNSliderThumb"
						ref="NNSliderThumb"
						style={{
							left: scale(value) + "%"
						}}
					/>
				</div>
			</div>
		)
	}
}

NNSlider.propTypes = {
	value: PropTypes.number.isRequired,
	onDrag: PropTypes.func.isRequired,
	domain: PropTypes.arrayOf(PropTypes.number),
	step: PropTypes.number
}

NNSlider.defaultProps = {
	step: 1,
	domain: [0, 1]
}

module.exports = NNSlider