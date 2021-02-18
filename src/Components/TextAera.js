import React, {Component} from 'react'
import { connect } from 'react-redux'

class TextAera extends Component{
  state = { value: '' }

  componentWillUpdate(nextProps, nextState){
    const {setData, name} = this.props
    if(nextProps.content !== this.props.content)
      {
        if(this.state.value !== nextProps.content && this.state.value !== '')
          {
            if( name === 'francais'){
              let answer = window.confirm(nextProps.name+' : afficher le nouveau cantique ?')
              if (answer) {
                  this.setState({value : nextProps.content})
              }
            }else {
              this.setState({value : nextProps.content})
            }
          }
        else {
          this.setState({value : nextProps.content})
        }
      }
    if(this.state.value !== nextState.value){
      name === 'francais' && setData({type:'SET_DATA_TRAD', data : nextState.value})
      name === 'malgache' && setData({type:'SET_DATA_CANTIQUE', data : nextState.value})
    }
  }

  textChange = (e) => {
    const {setData, name} = this.props
    this.setState({value : e.target.value})
    name === 'francais' && setData({type:'SET_DATA_TRAD', data : e.target.value})
    name === 'malgache' && setData({type:'SET_DATA_CANTIQUE', data : e.target.value})
    // console.log(e.target.value);
  }

  render(){
    const { name } = this.props
    return <textarea rows='30' cols='70' id={ name } ref={this.props.ref} value={this.state.value} placeholder={this.props.placeholder} className={this.props.name+'--editZone'} onChange={ this.textChange } />
  }

}

export default connect(
  state => state,
  dispatch => {
    return {
      setData : (data) => { dispatch(data) }
    }
  }
)(TextAera)
