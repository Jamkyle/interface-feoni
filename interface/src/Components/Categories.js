import React, {Component} from 'react'
import {connect} from 'react-redux'

class Categories extends Component{
  state = { value : 'FFPM'}
  sel = {}

  componentDidMount(){
      const {setCat} = this.props
    setCat(this.state.value)
  }

  handleChange = (e) => {
    const {setCat} = this.props
    this.setState({ value : e.target.value })
    setCat(e.target.value)
  }

  render(){
    var options = this.props.cats.map( e => { return <option key={e} value={e}>{e}</option> } )
    return <select ref={sel => this.sel = sel} onChange={ this.handleChange } >{options}</select>
  }
}

export default connect(
  state => state,
  dispatch => {
    return{
      setCat : (cat) => { dispatch({type:'SET_CAT', cat : cat})  }
    }
  }
)(Categories)
