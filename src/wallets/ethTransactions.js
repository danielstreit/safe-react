// @flow
import { BigNumber } from 'bignumber.js'
import { getWeb3 } from '~/wallets/getWeb3'
import { promisify } from '~/utils/promisify'
import { enhancedFetch } from '~/utils/fetch'

// const MAINNET_NETWORK = 1
export const EMPTY_DATA = '0x'

export const checkReceiptStatus = async (hash: string) => {
  if (!hash) {
    throw new Error('No valid Tx hash to get receipt from')
  }

  const web3 = getWeb3()
  const txReceipt = await promisify(cb => web3.eth.getTransactionReceipt(hash, cb))

  const { status } = txReceipt
  if (!status) {
    throw new Error('No status found on this transaction receipt')
  }

  const hasError = status === '0x0'
  if (hasError) {
    throw new Error('Obtained a transaction failure in the receipt')
  }
}

export const calculateGasPrice = async () => {
  /*
  const web3 = getWeb3()
  const { network } = web3.version
  const isMainnet = MAINNET_NETWORK === network

  const url = isMainnet
    ? 'https://safe-relay.staging.gnosisdev.com/api/v1/gas-station/'
    : 'https://safe-relay.dev.gnosisdev.com/'
  */

  if (process.env.NODE_ENV === 'test') {
    return '20000000000'
  }

  const url = 'https://ethgasstation.info/json/ethgasAPI.json'
  const errMsg = 'Error querying gas station'
  const json = await enhancedFetch(url, errMsg)

  return new BigNumber(json.average).multipliedBy(1e8).toString()
}

export const calculateGasOf = async (data: Object, from: string, to: string) => {
  const web3 = getWeb3()
  const gas = await promisify(cb => web3.eth.estimateGas({ data, from, to }, cb))

  return gas * 2
}