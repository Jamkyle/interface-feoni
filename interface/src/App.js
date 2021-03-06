import React, { Component } from 'react';
import {connect} from 'react-redux';
import { withFirebase } from 'react-redux-firebase'
import TextAera from './Components/TextAera'
import TextInput from './Components/TextInput'
import Categories from './Components/Categories'
import Modal from './Components/Modal'
import './css/App.css';

class App extends Component {
  constructor(props){
    super(props)
    this.francais = {}
    this.malgache = {}
    this.title = ''
    this.state = { show : 250}
    this.messages = ''
    this.state = {list: [], listTrad : []}
  }

  componentDidMount(){
    const {firebase, getList, listCantiques} = this.props
    getList( firebase )
  }

  componentWillUpdate(nextProps){
    if(nextProps.trad !== this.props.trad)
      {
        this.francais = nextProps.trad.strophe[0].trad
        this.malgache = nextProps.trad.strophe[0].cantique||''
        this.title = nextProps.trad.titre
      }
    if(nextProps.listCantiques !== this.props.listCantiques){
          let list = nextProps.listCantiques.map( e => { return isNaN(e.id) ? e.id : Number(e.id) })
          let listTrad = nextProps.listCantiques.map(e => { if(e.strophe[0].trad !== ""){ return isNaN(e.id) ? e.id : Number(e.id) } })
          this.setState({list: list, listTrad : listTrad });
    }
  }

  showHandle(){
  this.state.show >= 200 ? this.setState({show : 0}) : this.setState({show :  250})
  }

  submit(data){
    const { firebase, keyData, trad, id, title, go} = this.props

    let database = firebase.database().ref('/Traduction')
    if (trad.id) {
      this.messages = { color:'#3E6', message : 'le cantique :'+ id + ' a bien été modifié et sauvegarder dans la base'}
      database.child(keyData+'/strophe').set([data])
      go(id, firebase)
    }else {
      database.push({id: id, strophe : [data], titre: title })
      this.messages = { color:'#3E6', message : 'le cantique :'+ id + ' a bien été créé et sauvegarder dans la base'}
      go(id, firebase)
    }

  }

  listDiff= (list) =>{
    let arr1 = []
    for (let i=1; i<828;i++){
      arr1[i-1]=i
    }
     return arr1.filter( x => !list.includes(x))
  }

  affiche(){
    this.messages = {color:'#3E6', message: 'Cantique '+this.props.id+' prêt à être modifié'}
  }

  render() {
    const {go, firebase, id, categories, tradData, cantiqueData, messages} = this.props
    const {list, listTrad }= this.state
    let aList = list.sort( ( a, b ) => a - b)
    let listDiffTrad = this.listDiff(listTrad).map((e) => <span style={{ color: '#4e7' }} key={e}> {e} </span>)
    let num = id.includes(categories) ? id : categories+id
    return (
      <div className="App">
      <h1>Interface Gestion <br /> Feoni </h1>
        <div className="App-editeur">
        <div >
          <a onClick={()=>{ this.showHandle() }} style={{ cursor: 'pointer', background:'#47e', border: '1px solid black', padding:'5px', borderRadius: '10px', color:'#eee'}}>
            afficher/cacher le tutoriel
          </a>
        </div>
        <div className='tuto' style={{ height : this.state.show }}>
          <p>Etape:<br/>1. Choisir la categorie (FFPM, ANTEMA, TSANTA ...)
            <br/>
            2. Entrer le numéro du cantique
            <br/>
            3. Appuyez sur Commencer directement <i>( oui le titre se rempli automatiquement :) )</i>
            <br/>
            <br/>
            4. Remplir la traduction
            <br/>
            5. Remplir le cantique en malgache s'il n'apparait pas
            <br/>
            6. Appuyez sur Sauvegarder tout en base de la page pour sauvegarder dans la base
          </p>
          <p style={{ fontSize:'0.8em', color: '#47E' }}><i>Si aucun titre n'est affiché ou que le titre n'a pas changé c'est qu'il n'existe pas<br/> il suffit donc de remplir la case ou la corrigée</i></p>
        </div>
        <div className='messages'><span style={{ color: this.messages.color }}>{this.messages.message}</span></div>
        <div className='App-options'>
          <Categories cats={['FFPM','TSANTA', 'ANTEMA', 'FF']}/>
          <TextInput name={'num'}/>
          <input type='button' value='Commencer' onClick={() => { id && go(num, firebase); this.affiche() }}/>
          <div><TextInput name={'title'} style={{width:'100%'}}/></div>
        </div>
          <TextAera name={'francais'} placeholder='Ici doit se trouver le contenu en francais' content={this.francais}/>
          <TextAera name={'malgache'} placeholder='Ici le contenu en malgache' content={this.malgache}/>
        </div>
          <input type='button' value='Sauvegarder' onClick={() => this.submit({trad :tradData, cantique:cantiqueData})}/>
          <p>Liste des Cantiques sans traduction</p>
          <div>{ listDiffTrad }</div>
      </div>
    );
  }
}

export default connect(
  state => state,
  dispatch => ({
    go : (id, firebase) => dispatch({type: 'GET_CANTIQUE_TRADUCTION', id, firebase}),
    getList : (firebase) => dispatch({type: 'GET_LIST_CANTIQUE', firebase })
  })
)(withFirebase(App));
