import React, { useContext } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Route, Switch } from 'react-router-dom'

import HomePage from 'src/components/HomePage/HomePage'
import DSBlocksPage from 'src/components/ViewAllPages/DSBlocksPage/DSBlocksPage'
import TxBlocksPage from 'src/components/ViewAllPages/TxBlocksPage/TxBlocksPage'
import TxnsPage from 'src/components/ViewAllPages/TxnsPage/TxnsPage'
import AddressDetailsPage from 'src/components/DetailsPages/AddressDetailsPage/AddressDetailsPage'
import DSBlockDetailsPage from 'src/components/DetailsPages/DSBlockDetailsPage/DSBlockDetailsPage'
import TxBlockDetailsPage from 'src/components/DetailsPages/TxBlockDetailsPage/TxBlockDetailsPage'
import TxnDetailsPage from 'src/components/DetailsPages/TxnDetailsPage/TxnDetailsPage'
import NetworkErrPage from 'src/components/ErrorPages/NetworkErrPage'
import LabelsPage from 'src/components/LabelsPage/LabelsPage'
import NotFoundPage from 'src/components/ErrorPages/NotFoundPage'
import { NetworkContext } from 'src/services/networkProvider'

import './App.css'

const App: React.FC = () => {

  const networkContext = useContext(NetworkContext)
  const { inTransition, isValidUrl } = networkContext!

  return (
    <div className='app-container'>
      <Container>
        {inTransition
          ? <div className='center-spinner'><Spinner animation="border" /></div>
          : <>
            <Switch>
              <Route exact path="/labels"><LabelsPage /></Route>
              {isValidUrl
                ? <>
                  <Switch>
                    <Route exact path="/"><HomePage /></Route>
                    <Route exact path="/dsbk"><DSBlocksPage /></Route>
                    <Route exact path="/txbk"><TxBlocksPage /></Route>
                    <Route exact path="/tx"><TxnsPage /></Route>
                    <Route path="/dsbk/:blockNum"><DSBlockDetailsPage /></Route>
                    <Route path="/txbk/:blockNum"><TxBlockDetailsPage /></Route>
                    <Route path="/tx/:txnHash"><TxnDetailsPage /></Route>
                    <Route path="/address/:addr"><AddressDetailsPage /></Route>
                    <Route><NotFoundPage /></Route>
                  </Switch>
                </>
                : <NetworkErrPage />
              }
            </Switch>
          </>
        }
      </Container>
    </div>
  )
}

export default App