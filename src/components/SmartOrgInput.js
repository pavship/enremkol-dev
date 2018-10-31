import React, { Component } from 'react'
import validateInn from '../utils/validateInn'

import { graphql, compose } from 'react-apollo'
import { createOrg } from '../graphql/org'

import { Input, Message, Icon, Form } from 'semantic-ui-react'
import { Div, Span, A, Label } from './shared/styled-semantic.js'

class SmartOrgInput extends Component {
	componentIsMounted = true
	state = {
		inn: '',
		loading: false,
		err: null,
		orgName: ''
	}
	handleInputChange = async ( e, { value: inn } ) => {
		if (this.state.loading) return
		const { field: { name }, setField } = this.props
		this.setState({ inn })
		// 1. validate INN
		let err = {}
		const isValidInn = validateInn(inn, err)
		if (!isValidInn) return this.setState({ err: true })
		// 2. createOrg and use received orgId and orgName
		this.setState({ loading: true, err: null })
		try {
			const res = await this.props.createOrg({ variables: { inn } })
			console.log('res > ', res)
			const { id: orgId, name: orgName } = res.data.createOrg
			if (!this.componentIsMounted) return
			this.setState({ orgName, loading: false })
			setField(name, { value: orgId })
		} catch (err) {
			if (!this.componentIsMounted) return
			this.setState({ loading: false, 
				err: {
					title: 'Найти организацию по ИНН не удалось..',
					message: err.message
				}
			})
			console.log(err)
		}
	}
	render() {
		const { field: { curVal }, setField, createOrg, ...rest } = this.props
		const { inn, loading, err, orgName } = this.state
		console.log('err > ', err)
		if (!orgName) return <>
			<Form
				error
			>
				<Form.Field
					inline
					required
					error={!!err}
				>
					<Label>ИНН</Label>
					<Input
						{...rest}
						placeholder='Введите ИНН'
						value={inn}
						onChange={this.handleInputChange}
						loading={loading}
					/>
				</Form.Field>
				{err && err.message &&
					<Message
						error
						header={err.title}
						content={err.message}
					/>
				}
			</Form>
		</>
		return <>
			<Icon
				name='check'
				color='green'
			/>
			<Span
				m='calc(9rem/14) 0'
			>
				{orgName}
			</Span>
		</>
	}
}

export default compose(
	graphql(createOrg, { 
		name: 'createOrg',
	}),
)(SmartOrgInput)
