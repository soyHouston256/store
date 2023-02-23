import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {BrowserRouter as Router} from 'react-router-dom';
import { Provider } from 'react-redux'
import reducer from "./store/reducer"
import { DispatchType, ProductAction, ProductState } from './type';
import { applyMiddleware, createStore, Store } from 'redux';
import thunk from "redux-thunk"

const store: Store<ProductState, ProductAction> & {
  dispatch: DispatchType
} = createStore(reducer, applyMiddleware(thunk))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Provider store={ store } >
        <App />
      </Provider>
    </Router>
  </React.StrictMode>
)
