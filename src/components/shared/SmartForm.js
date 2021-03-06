import { Component } from 'react'

class SmartForm extends Component {
	constructor(props){
		super(props)
		this.componentIsMounted = true
		this.isNewEntity = props.isNewEntity
		// gather original form fields' values from provided object
		const oriEntity = props.entity
		this.fields = Object.keys(oriEntity)
		this.requiredFields = props.requiredFields
		// map through form fields and write helper props
		this.state = {}
		this.fields.forEach(key => {
			this.state[key] = {
				name: key,
				curVal: oriEntity[key],
				err: null,
				...this.requiredFields.includes(key) && { required: true },
				...!this.isNewEntity && {
					oriVal: oriEntity[key],
					diff: false,
				}
			}
		})
		// console.log(this.state)
	}
	setField = (field, {value, err}) => {
		// console.log('field, value, err > ', field, value, err)
		const prevErr = this.state[field].err
		this.setState({
			[field]: {
				...this.state[field],
				...(value !== 'undefined') && {
					curVal: value,
					...!this.isNewEntity && { diff: value !== this.state[field].oriVal },
				},
				// persist dismissable error
				err: err || (prevErr && prevErr.dissmisable && prevErr) || null,
			}
		})
	}
	submit = () => {
		const entity = this.fields.reduce((entity, f) => {
			entity[f] = this.state[f].curVal
			return entity
		}, {})
		this.props.submit(entity)
	}
	render() {
		const { children, errSkipFields } = this.props
		const requiredIsEmpty = this.requiredFields.some(f => !this.state[f].curVal)
		const diff = this.isNewEntity ? null : this.fields.map(f => this.state[f].diff).includes(true)
		const err = this.fields.filter(f => !errSkipFields.includes(f)).map(f => this.state[f].err).find(err => !!err)
		const state = {
			disabled: (!this.isNewEntity && !diff) || requiredIsEmpty || !!err,
			err: err || this.props.err,
			setField: this.setField,
			submit: this.submit,
			formState: this.state
		}
		// @ts-ignore
		return children(state)
	}
}

export default SmartForm