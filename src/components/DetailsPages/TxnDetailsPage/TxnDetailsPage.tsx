import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Container, Spinner } from 'react-bootstrap'

import { QueryPreservingLink } from 'src'
import { NetworkContext } from 'src/services/networkProvider'
import { TransactionDetails } from 'src/typings/api'
import { qaToZil, hexAddrToZilAddr, pubKeyToZilAddr } from 'src/utils/Utils'
import { Long } from "@zilliqa-js/util"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { faExclamationCircle, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

import InfoTabs from '../InfoTabs/InfoTabs'
import TransitionsTab from '../InfoTabs/TransitionsTab'
import EventsTab from '../InfoTabs/EventsTab'
import DefaultTab from '../InfoTabs/DefaultTab'
import ContractCreationTab from '../InfoTabs/ContractCreationTab'

import './TxnDetailsPage.css'
import NotFoundPage from '../NotFoundPage/NotFoundPage'
import LabelStar from '../LabelStart/LabelStar'

const TxnDetailsPage: React.FC = () => {

  const { txnHash } = useParams()
  const networkContext = useContext(NetworkContext)
  const { dataService } = networkContext!

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TransactionDetails | null>(null)

  const generateTabsObj = () => {

    const tabs: { tabHeaders: string[], tabTitles: string[], tabContents: React.ReactNode[] } = {
      tabHeaders: [],
      tabTitles: [],
      tabContents: [],
    }

    if (!data) return tabs

    if (data.receipt.success === undefined || (data.receipt.success && data.contractAddr)) {
      tabs.tabHeaders.push('contractAddr')
      tabs.tabTitles.push(`Contract Creation`)
      tabs.tabContents.push(<ContractCreationTab contractAddr={data.contractAddr!} />)
    }

    if (data.receipt.event_logs) {
      tabs.tabHeaders.push('eventLog')
      tabs.tabTitles.push(`Event Log (${data.receipt.event_logs.length})`)
      tabs.tabContents.push(<EventsTab events={data.receipt.event_logs} />)
    }

    if (data.receipt.transitions) {
      tabs.tabHeaders.push('transitions')
      tabs.tabTitles.push(`Transitions (${data.receipt.transitions.length})`)
      tabs.tabContents.push(<TransitionsTab transitions={data.receipt.transitions} />)
    }

    if (data.receipt.exceptions && data.receipt.exceptions.length > 0) {
      tabs.tabHeaders.push('exceptions')
      tabs.tabTitles.push(`Exceptions (${data.receipt.exceptions.length})`)
      tabs.tabContents.push(<DefaultTab content={data.receipt.exceptions} />)
    }

    if (data.receipt.errors && Object.keys(data.receipt.errors).length > 0) {
      tabs.tabHeaders.push('errors')
      tabs.tabTitles.push('Errors')
      tabs.tabContents.push(<DefaultTab content={data.receipt.errors} />)
    }
    return tabs
  }

  // Fetch data
  useEffect(() => {
    if (!dataService) return

    let receivedData: TransactionDetails
    const getData = async () => {
      try {
        setIsLoading(true)
        receivedData = await dataService.getTransactionDetails(txnHash)
        if (receivedData) {
          setData(receivedData)
        }
      } catch (e) {
        console.log(e)
        setError(e)
      } finally {
        setIsLoading(false)
      }
    }

    getData()
    return () => {
      setData(null)
      setError(null)
    }
  }, [dataService, txnHash])

  return <>
    {isLoading ? <div className='center-spinner'><Spinner animation="border" variant="secondary" /></div> : null}
    {error
      ? <NotFoundPage />
      : data && (
        <>
          <h3>
            <span>
              {(data.receipt.success === undefined || data.receipt.success) ? <FontAwesomeIcon color='green' icon={faExchangeAlt} /> : <FontAwesomeIcon color='red' icon={faExclamationCircle} />}
            </span>
            <span style={{ marginLeft: '0.75rem' }}>
              Transaction
          </span>
            <LabelStar />
          </h3>
          <div style={{ display: 'flex' }}>
            <h6 className='txn-hash'>{'0x' + data.hash}</h6>
            <div onClick={() => {
              navigator.clipboard.writeText('0x' + data.hash)
            }} className='txn-hash-copy-btn'>
              <FontAwesomeIcon icon={faCopy} />
            </div>
          </div>
          <Card className='txn-details-card'>
            <Card.Body>
              <Container>
                <Row>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>From:</span>
                      <span>
                        {/* To be removed after SDK typing is updated
                        // @ts-ignore */}
                        <QueryPreservingLink to={`/address/${pubKeyToZilAddr(data.pubKey)}`}>{pubKeyToZilAddr(data.pubKey)}</QueryPreservingLink>
                      </span>
                    </div>
                  </Col>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>To:</span>
                      <span>
                        <QueryPreservingLink to={`/address/${hexAddrToZilAddr(data.toAddr)}`}>{hexAddrToZilAddr(data.toAddr)}</QueryPreservingLink>
                      </span>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Amount:</span>
                      <span>{qaToZil(data.amount)}</span>
                    </div>
                  </Col>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Nonce:</span>
                      <span>{data.nonce}</span>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Gas Limit:</span>
                      {/* To be removed after SDK typing is updated
                        // @ts-ignore */}
                      <span>{(new Long(data.gasLimit.low, data.gasLimit.high, data.gasLimit.unsigned)).toString()}</span>
                    </div>
                  </Col>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Gas Price:</span>
                      <span>{qaToZil(data.gasPrice)}</span>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Cumulative Gas:</span>
                      <span>{data.receipt.cumulative_gas}</span>
                    </div>
                  </Col>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Transaction Block:</span>
                      <span><QueryPreservingLink to={`/txbk/${data.receipt.epoch_num}`}>{data.receipt.epoch_num}</QueryPreservingLink></span>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Success:</span>
                      <span>{`${data.receipt.success}`}</span>
                    </div>
                  </Col>
                  {/* To be removed after SDK typing is updated
                        // @ts-ignore */}
                  {data.receipt.accepted !== undefined && (<Col>
                    <div className='txn-detail'>
                      <span className='txn-detail-header'>Accepts $ZIL:</span>
                      {/* To be removed after SDK typing is updated
                        // @ts-ignore */}
                      <span>{`${data.receipt.accepted}`}</span>
                    </div>
                  </Col>)}
                </Row>
              </Container>
            </Card.Body>
          </Card>
          <InfoTabs tabs={generateTabsObj()} />
        </>
      )}
  </>
}

export default TxnDetailsPage