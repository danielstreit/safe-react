// @flow
import { ImmortalStorage, IndexedDbStore, LocalStorageStore } from 'immortal-db'
import Box from '3box'
import { getNetwork } from '~/config'
import { getProviderInfo, getWeb3 } from '~/logic/wallets/getWeb3'

// Don't use sessionStorage and cookieStorage
// https://github.com/gruns/ImmortalDB/issues/22
// https://github.com/gruns/ImmortalDB/issues/6
const stores = [IndexedDbStore, LocalStorageStore]
export const storage = new ImmortalStorage(stores)
const boxStore = { box: null, space: null }

const PREFIX = `v2_${getNetwork()}`

export const get3Box = async (force?: boolean) => {
  if (process.env.REACT_APP_3BOX_ENABLED !== 'true' || window.sessionStorage.getItem('3BoxEnabled') !== 'true') {
    throw new Error('3box disabled by setup')
  }

  if (!force) {
    if (boxStore.box === null) {
      throw new Error('no 3box enabled')
    }
    return boxStore
  }

  try {
    const web3 = getWeb3()
    const [
      { account: address },
      box,
    ] = await Promise.all([getProviderInfo(web3), Box.create(web3.currentProvider)])
    await box.auth(['safeStorage'], { address })
    const space = await box.openSpace('safeStorage')
    await box.syncDone
    boxStore.box = box
    boxStore.space = space
    return boxStore
  } catch (e) {
    console.error('Something went wrong with 3box setup', e)
    boxStore.box = null
    boxStore.store = null
    throw new Error(e)
  }
}

export const loadFrom3Box = async (key: string): Promise<*> => {
  try {
    const { space } = await get3Box()

    const stringifiedValue = await space.private.get(`${PREFIX}__${key}`)

    if (stringifiedValue === null || stringifiedValue === undefined) {
      return undefined
    }

    return JSON.parse(stringifiedValue)
  } catch (err) {
    console.error(`Failed to load ${key} from 3box storage:`, err)
    return undefined
  }
}

export const saveTo3Box = async (key: string, value: *): Promise<*> => {
  try {
    const { space } = await get3Box()

    const stringifiedValue = JSON.stringify(value)
    await space.private.set(`${PREFIX}__${key}`, stringifiedValue)
    await space.syncDone
  } catch (err) {
    console.error(`Failed to save ${key} in the storage:`, err)
  }
}

export const removeFrom3box = async (key: string): Promise<*> => {
  try {
    const { space } = await get3Box()

    await space.private.remove(`${PREFIX}__${key}`)
    await space.syncDone
  } catch (err) {
    console.error(`Failed to remove ${key} from the storage:`, err)
  }
}


export const loadFromStorage = async (key: string): Promise<*> => {
  try {
    const stringifiedValue = await storage.get(`${PREFIX}__${key}`)
    if (stringifiedValue === null || stringifiedValue === undefined) {
      return undefined
    }

    return JSON.parse(stringifiedValue)
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err)
    return undefined
  }
}

export const saveToStorage = async (key: string, value: *): Promise<*> => {
  try {
    const stringifiedValue = JSON.stringify(value)
    await storage.set(`${PREFIX}__${key}`, stringifiedValue)
  } catch (err) {
    console.error(`Failed to save ${key} in the storage:`, err)
  }
}

export const removeFromStorage = async (key: string): Promise<*> => {
  try {
    await storage.remove(`${PREFIX}__${key}`)
  } catch (err) {
    console.error(`Failed to remove ${key} from the storage:`, err)
  }
}
