import React, {Component} from 'react'
import {connect} from 'react-redux'
class TextInput extends Component{
  state = { value: '', cantique : '' }

  componentWillUpdate(nextProps, nextState){
    if(nextProps.trad.titre !== this.props.trad.titre)
      {
        console.log(nextProps.trad.titre);
          this.props.name === 'title' && this.setState({value : nextProps.trad.titre || ''})
      }
  }

  textChange = (e) => {
    const { name, setId, setTitle, categories } = this.props
    this.setState({ value: e.target.value})

    name === 'num' && setId(categories+e.target.value)
    name === 'title' && setTitle(e.target.value)
  }

  render(){
    const { name, placeholder } = this.props
    return <input className={ 'i--'+name } placeholder={ placeholder||name } value={this.state.value} ref={ this.props.ref } onChange={ this.textChange } />
  }
}

export default connect(
  state => state,
  dispatch => {
    return {
      setId : (id) => dispatch({type:'SET_ID', id: id}),
      setTitle : (title)=> dispatch({type:'SET_TITLE', title: title})
    }
  }
)(TextInput)
