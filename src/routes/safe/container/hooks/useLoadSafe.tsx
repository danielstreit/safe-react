import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import loadAddressBookFromStorage from 'src/logic/addressBook/store/actions/loadAddressBookFromStorage'
import addViewedSafe from 'src/logic/currentSession/store/actions/addViewedSafe'
import fetchSafeTokens from 'src/logic/tokens/store/actions/fetchSafeTokens'
import fetchLatestMasterContractVersion from 'src/routes/safe/store/actions/fetchLatestMasterContractVersion'
import fetchSafe from 'src/routes/safe/store/actions/fetchSafe'
import fetchTransactions from 'src/routes/safe/store/actions/fetchTransactions'
import fetchSafeCreationTx from '../../store/actions/fetchSafeCreationTx'

export const useLoadSafe = (safeAddress) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = () => {
      if (safeAddress) {
        dispatch(fetchLatestMasterContractVersion())
          .then(() => dispatch(fetchSafe(safeAddress)))
          .then(() => {
            dispatch(fetchSafeTokens(safeAddress))
            dispatch(loadAddressBookFromStorage())
            dispatch(fetchSafeCreationTx(safeAddress))
            return dispatch(fetchTransactions(safeAddress))
          })
          .then(() => dispatch(addViewedSafe(safeAddress)))
      }
    }
    fetchData()
  }, [dispatch, safeAddress])
}
